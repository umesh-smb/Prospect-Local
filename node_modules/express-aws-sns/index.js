var https = require('https'),
    crypto = require('crypto'),
    url = require('url');

// Local memory cache for PEM certificates
var pemCache = {};

// keys required in a valid SNS request
var requiredKeys = [
    'Type', 'MessageId', 'TopicArn', 'Message', 'Timestamp',
    'SignatureVersion', 'Signature', 'SigningCertURL'
];

function validateRequest(options, message, callback) {
    // Let's make sure all keys actually exist to avoid errors
    for (var i = 0; i < requiredKeys.length; i++) {
        var key = requiredKeys[i];
        if (!(key in message)) {
            callback(new Error('Invalid request, required key ' + key + ' does not exist'));
            return;
        }
    }

    // short circuit to be able to bypass validation
    if ('verify' in options && !options.verify) {
        callback();
        return;
    }

    var cert = url.parse(message.SigningCertURL),
        arn = message.TopicArn.split(':'),
        region = arn[3];

    if (options.topic && options.topic !== message.TopicArn) {
        callback(new Error('Topic ARN does not match, expected ' + options.topic + ' got ' + message.TopicArn));
        return;
    }

    // Make sure the certificate comes from the same region
    if (cert.host !== 'sns.' + region + '.amazonaws.com') {
        callback(new Error('Invalid request, invalid cert host ' + cert.host));
        return;
    }

    // check if certificate has been downloaded before and cached
    if (message.SigningCertURL in pemCache) {
        var pem = pemCache[message.SigningCertURL];
        validateMessage(pem, message, callback);
        return;
    }

    https.get(cert, function(res) {
        var pemData = '';
        res.on('data', function(chunk) {
            pemData += chunk;
        });
        res.on('end', function() {
            pemCache[message.SigningCertURL] = pemData;
            validateMessage(pemData, message, callback);
        });

        res.on('error', callback);
    });
}

function validateMessage(pem, message, callback) {
    var msg = buildSignatureString(message);
    if (!msg) {
        callback(new Error('Invalid request, could not build signature string'));
        return;
    }

    var verifier = crypto.createVerify('RSA-SHA1');
    verifier.update(msg, 'utf8');
    if (!verifier.verify(pem, message.Signature, 'base64')) {
        callback(new Error('Invalid request, could not verify signature'));
        return;
    }

    callback();
}

function buildSignatureString(message) {
    var chunks = [];
    switch (message.Type) {
        case 'Notification':
            chunks.push('Message');
            chunks.push(message.Message);
            chunks.push('MessageId');
            chunks.push(message.MessageId);
            if (message.Subject) {
                chunks.push('Subject');
                chunks.push(message.Subject);
            }
            chunks.push('Timestamp');
            chunks.push(message.Timestamp);
            chunks.push('TopicArn');
            chunks.push(message.TopicArn);
            chunks.push('Type');
            chunks.push(message.Type);
            break;
        case 'SubscriptionConfirmation':
            chunks.push('Message');
            chunks.push(message.Message);
            chunks.push('MessageId');
            chunks.push(message.MessageId);
            chunks.push('SubscribeURL');
            chunks.push(message.SubscribeURL);
            chunks.push('Timestamp');
            chunks.push(message.Timestamp);
            chunks.push('Token');
            chunks.push(message.Token);
            chunks.push('TopicArn');
            chunks.push(message.TopicArn);
            chunks.push('Type');
            chunks.push(message.Type);
            break;
        default:
            return false;
    }

    return chunks.join('\n') + '\n';
}

module.exports = function awsSnsMiddleware(opts) {
    opts = opts || {};
    return function(req, res, next) {
        var body = '';
        req.on('data', function(chunk) {
            body += chunk;
        });

        req.on('end', function() {
            var message;
            try {
                message = JSON.parse(body);
            } catch (e) {
                next(e);
                return;
            }

            req.snsMessage = message;
            validateRequest(opts, message, function(err) {
                if (err) {
                    next(err);
                    return;
                }

                next();
            });
        });
    };
};
