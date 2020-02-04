# AWS SNS Express middleware
This has been adapted from https://github.com/mattrobenolt/node-snsclient
to better support express. If you just want a standalone client without
express you're better off using that one.

## Installation
```
$ npm install express-aws-sns
```

## Usage
```javascript
var express = require('express'),
    sns = require('express-aws-sns'),
    app = express();

app.use(sns());
```

Perform no verification (not recommended except for debugging):
```javascript
app.use(sns({
    verify: false
}));
```

Ensure topic:
```javascript
app.use(sns({
    topic: 'aws:sns:arn:xxx:yyy:zzz'
}));
```

By default, the message will be attached to the request in the `snsMessage`
property. It can be accessed via `req.snsMessage`.