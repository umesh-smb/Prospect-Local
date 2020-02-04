var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
config = require('.././server/config');
servicecontroller = require('../controllers/serviceController');
var request = require('request');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('Prospect');
});

router.use(function (req, res, next) {
  req.response = { status: false, message: "error" };
  next();
});

/* Function used for login. */
// router.post('/login', usercontroller.login, (req, res, next) => {
//   res.json(req.response)
// });





router.use(function (req, res, next) {
  var token = req.headers['authtoken'];
  var refreshtoken = req.headers['refreshtoken'];

  if (refreshtoken) {
    jwt.verify(refreshtoken, config.jwt_secret, function (err, decoded) {
      
      if (err) {
        res.setHeader('Authentication', false)
        return res.json({ status: false, Authentication: false, message: "Failed to authenticate token.", invalidToken: true });
      } else {
        
        if(decoded.version != process.env.VERSION){
          res.setHeader('Authentication', false)
          return res.json({ status: false, Authentication: false, message: "Failed to authenticate token.", invalidToken: true });
        }else{
          res.setHeader('Authentication', true)
          req.decoded = decoded;
          var newtoken = jwt.sign({ "email": req.decoded.email, "user_id": req.decoded.user_id ,"office_id" : req.decoded.office_id , "region_id" : req.decoded.region_id , "division_id" : req.decoded.division_id , "dealer_id" : req.decoded.dealer_id , "user_type" : req.decoded.user_type }, config.jwt_secret, {
            expiresIn: "24h"
          });
          var newrefreshtoken = jwt.sign({ "email": req.decoded.email, "user_id": req.decoded.user_id ,"office_id" : req.decoded.office_id , "region_id" : req.decoded.region_id , "division_id" : req.decoded.division_id , "dealer_id" : req.decoded.dealer_id , "user_type" : req.decoded.user_type }, config.jwt_secret, {
            expiresIn: "240000h"
          });
          res.setHeader('AuthToken', newtoken)
          res.setHeader('RefreshToken', newrefreshtoken)
          next();
        }
        
      }
    });
  } else {
    if (token) {
      jwt.verify(token, config.jwt_secret, function (err, decoded) {
        if (err) {
          res.setHeader('Authentication', false)
          return res.json({ status: false, Authentication: false, message: "Failed to authenticate token.", invalidToken: true });
        } else {
          if(decoded.version != process.env.VERSION){
            res.setHeader('Authentication', false)
            return res.json({ status: false, Authentication: false, message: "Failed to authenticate token.", invalidToken: true });
          }else{
            res.setHeader('Authentication', true)
            req.decoded = decoded;
          
            next();
          }
          
        }
      });
    } else {
      res.setHeader('Authentication', false)
      return res.json({
        status: false,
        message: "Failed to authenticate token.",
      })
    }
  }
});


  router.post('/get_guides', servicecontroller.getGuides, (req, res, next) => {
    res.json(req.response)
  });

  router.post('/get_guide_categories', servicecontroller.getGuideCategories, (req, res, next) => {
    res.json(req.response)
  
  });
  router.post('/create_ticket', servicecontroller.createTicket, (req, res, next) => {
    res.json(req.response)
  });
  router.post('/get_tickets', servicecontroller.getTickets, (req, res, next) => {
    res.json(req.response)
  });
  router.post('/get_comments', servicecontroller.getComments, (req, res, next) => {
    res.json(req.response)
  });
  router.post('/post_comment', servicecontroller.postComment, (req, res, next) => {
    res.json(req.response)
  });
  router.post('/get_oppty_status', servicecontroller.getOpptyStatus, (req, res, next) => {
    res.json(req.response)
  });
  router.post('/appointment_details', servicecontroller.getAppointmentDetails, (req, res, next) => {
    res.json(req.response)
  });
  router.post('/delete_appointment', servicecontroller.deleteAppointment, (req, res, next) => {
    res.json(req.response)
  });


module.exports = router;
