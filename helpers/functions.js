let connectionProvider = require("../server/dbConnectionProvider"),
    crypto = require('crypto'),
    merge = require('merge'),
    mysql = require('mysql'),
    //config = require('../helpers/config'),
    config = require('.././server/config'),
    Password = require("node-php-password"),

    nodemailer = require('nodemailer'),
    jwt = require('jsonwebtoken');

let functions = {
    get(table, cond) {
        var self = this;
        var sql = "SELECT * FROM " + table;
        if (typeof(cond) == "object") {
            sql += " WHERE ";
            for (var key in cond) {
                sql += key + " = '" + cond[key] + "' AND ";
            }
            sql = sql.substring(0, sql.length - 4);
        }
        return self.selectQuery(sql);
    },
    insert(table, data) {
        var self = this;
        var sql = "INSERT INTO " + table + " SET ?";
        if (typeof(data) == "object") {
            return self.processQuery(sql, data);
        } else {
            return false;
        }
    },
    insertMultiple(table, fields, data) {
        var self = this;
        var sql = "INSERT INTO " + table + " (" + fields + ") VALUES  ?";
        //if (typeof (data) == "object") {
        return self.processQuery(sql, [data]);
        // } else {
        //  return false;
        // }
    },
    update(table, fields, cond) {
        var self = this;
        var sql = "UPDATE " + table + " SET ";
        for (var key in fields) {
            sql += key + " = ?,";
        }
        sql = sql.substring(0, sql.length - 1) + " WHERE ";

        for (var ky in cond) {
            sql += ky + " = ? AND ";
        }
        sql = sql.substring(0, sql.length - 4);

        var original = merge(fields, cond);
        var data = [];
        for (var attr in original) {
            data.push(original[attr]);
        }
        console.log(sql)
        return self.processQuery(sql, data);
    },
    delete(table, cond) {
        var self = this;
        var sql = "DELETE FROM " + table + " WHERE 1";
        if (typeof(cond) == 'object') {
            for (var key in cond) {
                sql += " AND " + key + "='" + cond[key] + "'";
            }
            return self.selectQuery(sql);
        } else {
            return false;
        }
    },
    selectQuery(sql) {
        return new Promise((resolve, reject) => {
            let connection = connectionProvider.dbConnectionProvider.getMysqlConnection();
            connection.query(sql, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
            connectionProvider.dbConnectionProvider.closeMysqlConnection(connection);
        })
    },
    processQuery(sql, data) {
        return new Promise((resolve, reject) => {
            let connection = connectionProvider.dbConnectionProvider.getMysqlConnection();
            connection.query(sql, data, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            })
            connectionProvider.dbConnectionProvider.closeMysqlConnection(connection);
        })
    },
    getCount(table, cond) {
        var self = this;
        var sql = "SELECT count(*) as count FROM " + table;
        if (typeof(cond) == "object") {
            sql += " WHERE ";
            for (var key in cond) {
                sql += key + " = '" + cond[key] + "' AND ";
            }
            sql = sql.substring(0, sql.length - 4);
        }
        return self.selectQuery(sql);
    },
    encryptPass(password, callb) {

        var cipher = crypto.createCipher(config.encrypt_algorithm, config.encrypt_pass);
        var crypted = cipher.update(password, 'utf8', 'hex');
        crypted += cipher.final('hex');
        console.log(crypted);
        callb(crypted);
    },
    decryptPass(user_password, callb) {
        var user_password = "123456";
        var hash = Password.hash(user_password, "PASSWORD_DEFAULT", { cost: 10 });
        console.log(hash);

        if (Password.verify("123456", hash)) {
            console.log("true");
        } else {
            console.log("false");
        }

        var decipher = crypto.createDecipher(config.encrypt_algorithm, config.encrypt_pass)
        var dec = decipher.update(user_password, 'hex', 'utf8')
        dec += decipher.final('utf8');

        callb(dec);
    },


    sendMail: function(to, subject, email, isEmailTemplate, file_url = "",replyTo="", callback) {
        //console.log('subject=====', subject);
        this.get('general_config', '')
            .then((configData) => {
                // console.log(configData);


                var poolConfig = {
                    pool: true,
                    host: configData.find(x => x.field == "smtp_email_host").value,
                    port: configData.find(x => x.field == "smtp_email_port").value,
                    secure: true, // use SSL
                    auth: {
                        user: configData.find(x => x.field == "smtp_email").value,
                        pass: configData.find(x => x.field == "smtp_email_password").value
                    }
                };

                var transporter = nodemailer.createTransport(poolConfig);

                transporter.verify(function(error, success) {
                    if (error) {
                        throw error;
                    } else {
                        var from_email = configData.find(x => x.field == "smtp_email_from").value;
                        var from_name = from_email.substr(0, from_email.indexOf('@'));
                        console.log(from_name);
                        if (!isEmailTemplate) {
                            var mailOptions = {
                                from: '"' + configData.find(x => x.field == "smtp_name_from").value + '" <' + configData.find(x => x.field == "smtp_email_from").value + '>',
                                to: to,
                                subject: subject,
                                html: email,
                                attachments: []
                            }

                            if (file_url && file_url != '') {
                                mailOptions.attachments.push({ // filename and content type is derived from path
                                    path: file_url
                                });
                            }
                            // console.log(configData);
                            if (replyTo!='' && replyTo!= undefined) {
                                mailOptions.from = '"' + replyTo.fromname + '" <' + configData.find(x => x.field == "smtp_email_from").value + '>', 
                                mailOptions.replyTo = replyTo.replyTo;
                            }

                            transporter.sendMail(mailOptions, function(err, info) {
                                if (err) {
                                    throw err;
                                } else {
                                    var response = { 'status': 'success', 'message': 'Message sent successfully.', 'from_email': from_email, 'from_name': from_name };
                                    callback(response);
                                }
                            });
                        } else {
                            var template = email.email_template;
                            //var template = config.email_header + email.email_template + config.email_footer;

                            var mailOptions = {
                                from: '"' + configData.find(x => x.field == "smtp_name_from").value + '" <' + configData.find(x => x.field == "smtp_email_from").value + '>',
                                to: to,
                                subject: subject,
                                html: template
                            }

                            if (email.cc == 'Y') {
                                configData.find(x => x.field == "admin_email").value.split(",").forEach((item) => {
                                        mailOptions.cc = item;
                                    })
                                    // mailOptions.cc = configData.find(x=> x.field == "admin_email").value;

                            }

                            if (email.bcc == 'Y') {
                                configData.find(x => x.field == "admin_email").value.split(",").forEach((item) => {
                                    mailOptions.bcc = item;
                                })

                                // mailOptions.bcc = configData.find(x=> x.field == "admin_email").value;
                            }

                            if (email.admin_only == 'Y') {
                                configData.find(x => x.field == "admin_email").value.split(",").forEach((item) => {
                                        mailOptions.to = item;
                                    })
                                    // mailOptions.to = configData.find(x=> x.field == "admin_email").value;
                            }
                            if (replyTo!='' && replyTo!= undefined) {
                                mailOptions.from = '"' + replyTo.fromname + '" <' + configData.find(x => x.field == "smtp_email_from").value + '>', 
                                mailOptions.replyTo = replyTo.replyTo;
                            }

                            transporter.sendMail(mailOptions, function(err, info) {
                                if (err) {
                                    throw err;
                                } else {
                                    var response = { 'status': 'success', 'message': 'Message sent successfully.', 'from_email': from_email, 'from_name': from_name };
                                    console.log(response);
                                    callback(response);
                                }
                            });
                        }
                    }

                })

            })
            .catch((error) => {

            })


    },














    middleware(req, res, next) {

        let token = req.headers['authtoken'] || '';

        let method = req.method;

        token = token.replace(/^Bearer\s/, '');

        let verify_response = function(err, decoded) {

            if (!err) {
                req.decoded = decoded;
                next();

            } else if (err.name == 'TokenExpiredError') {

                let originalDecoded = jwt.decode(token, { complete: true });

                req.decoded = originalDecoded.payload;

                let user = req.decoded;

                delete user['exp'];
                delete user['iat'];

                let jsonFilePath = 'public/uploads/users/' + originalDecoded.payload.user_id + '/refreshtoken.json';

                let refreshToken = req.headers['refreshtoken'] || '';

                let jsonObj;

                if (fs.existsSync(jsonFilePath)) jsonObj = jsonfile.readFileSync(jsonFilePath);

                if (jsonObj[refreshToken] == originalDecoded.payload.email) {
                    var refreshed = jwt.sign(user, config.secret, {
                        expiresIn: 3600
                    });
                    res.setHeader('AuthToken', refreshed);
                    next();
                } else {
                    return res.json({ status: 'fail', error: 'Token expired.', 'statusCode': 'TokenExpired' });
                }
            } else {
                return res.json({ status: 'fail', error: 'Failed to authenticate token.', 'statusCode': "TokenInvalid" });
            }
        }

        if (method != 'OPTIONS') {
            if (token) {
                jwt.verify(token, config.secret, verify_response);

            } else {
                return res.status(403).send({
                    status: 'fail',
                    error: 'No token provided.',
                    statusCode: "TokenMissing"
                });
            }
        } else {
            return res.json({ status: "success", "message": "Server preflight verification success." });
        }
    }
}

module.exports = functions;