var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var client = require('./routes/client');
var users = require('./routes/users');
var service = require('./routes/service');

var sns = require('express-aws-sns');
var app = express();

util = require('util');

// Add headers
app.use(function (req, res, next) {

  var allowedOrigins = ['http://10.10.10.36:4001','http://10.10.10.87:4444','http://127.0.0.1:3000','http://10.10.10.89:3000/','http://3.215.155.209:3000','https://prospect.nomodealerhub.com:4000','http://prospect.nomodealerhub.com:4001','https://prospect.nomodealerhub.com'];

  var origin = req.headers.origin;

  if (allowedOrigins.indexOf(origin) > -1) {
    // Website you wish to allow to connect
    // res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
    
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,cache-control,content-type,accept,authorization,new-token,invalidToken,refresh-token,AuthToken,RefreshToken,x-access-token,source');

  res.setHeader('Access-Control-Expose-Headers', 'authorization,x-access-token,new-token,invalidToken,refresh-token,AuthToken,RefreshToken,source');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

// app.use(sns({
//   verify: false
// }));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

exports.overrideContentType = function () {
  return function (req, res, next) {
    if (req.headers['x-amz-sns-message-type']) {
      req.headers['content-type'] = 'application/json;charset=UTF-8';
    }
    next();
  };
}
//app.use(util.overrideContentType());

const snsSubscriptionConfirmation = require('aws-sns-subscription-confirmation');

// app.use(bodyParser.json({ limit: '50mb' }));

app.use(snsSubscriptionConfirmation.overrideContentType());

app.use(bodyParser.json({ limit: '150mb' }));
app.use(bodyParser.urlencoded({ limit: '150mb', extended: true ,parameterLimit:50000}));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(snsSubscriptionConfirmation.snsConfirmHandler());


app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/client', client);
app.use('/users', users);
app.use('/service', service);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

module.exports = app;
