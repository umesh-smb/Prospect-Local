# express-sns-validator

[![Build Status](https://travis-ci.org/compwright/express-sns-validator.svg?branch=master)](https://travis-ci.org/compwright/express-sns-validator)

ExpressJS middleware for verifying Amazon SNS notifications using [sns-validator](https://www.npmjs.com/package/sns-validator) (no dependency on the AWS SDK).

## Requirements

* NodeJS 6.4+
* ExpressJS 4+
* body-parser 1.4+

## Installation

```bash
npm install --save express-sns-validator
```

## Usage

Add to the route handler you will use to subscribe to Amazon SNS notifications. If the request does not validate, an HTTP 400 will be returned.

> Note: you need [body-parser](https://npmjs.com/package/body-parser) to parse the JSON body from SNS.

```javascript
const express = require('express')
const bodyParser = require('body-parser')
const snsMiddleware = require('express-sns-validator')

const app = express()

app.use(bodyParser.json()) // required for express-sns-validator to work properly

app.post('/notifications/sns', snsMiddleware(), (req, res) => {
  // do stuff with req.body
});
```

## License

MIT License
