var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
config = require('.././server/config');
usercontroller = require('../controllers/userController');
var request = require('request');
functions = require('../helpers/functions');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('Prospect');
});


router.use(function (req, res, next) {
  req.response = { status: false, message: "error" };
  next();
});
router.post('/checkcheck', (req, res, next) => {
  console.log(req.body);

  res.json(req.response)
});

router.get('/tessssssssstttt',  usercontroller.tessssssssstttt, (req, res, next) => {
  res.json(req.response)
});

/* Function used for login. */
router.post('/login', usercontroller.login,usercontroller.checkUserAlreadyInlogin, (req, res, next) => {
  res.json(req.response)
});

/* Function used for forgot password. this will send otp to the users email. */
router.post('/forgotPassword', usercontroller.forgotPassword, (req, res, next) => {
  res.json(req.response)
});

/* Function used to verify otp. */
router.post('/verifyResetCode', usercontroller.verifyResetCode, (req, res, next) => {
  res.json(req.response)
});
router.post('/setPassword', usercontroller.setPassword, (req, res, next) => {
  res.json(req.response)
});

router.get('/getData', usercontroller.userDetails, (req, res, next) => {
  res.json(req.response)
});

router.post('/prospectKeyLogin', usercontroller.prospectKeyLogin, (req, res, next) => {
  res.json(req.response)
});



router.use(function (req, res, next) {
  var token = req.headers['authtoken'];
  var refreshtoken = req.headers['refreshtoken'];
  var  isblocked =  false;
  //if (req.method === "OPTIONS") { return res.status(200).end(); } 

  // console.log("--------env--------------");
  // console.log(process.env.VERSION);
  // console.log("-----tok-----------------");
  // console.log(token);
  // console.log("refreshtoken");
  // console.log(refreshtoken);
  

  res.setHeader('Last-Modified', (new Date()).toUTCString());
  if (refreshtoken) {
    jwt.verify(refreshtoken, config.jwt_secret, function (err, decoded) {
      if (err) {
        res.setHeader('Authentication', false)
        return res.json({ status: false, Authentication: false, message: "Failed to authenticate token.", invalidToken: true });
      } else {
        
        if(decoded.version != parseInt(process.env.VERSION)){
          res.setHeader('Authentication', false)
          return res.json({ status: false, Authentication: false, message: "Failed to authenticate token.", invalidToken: true });
        }else{
          
          req.decoded = decoded;
          functions.get('user_master', { "user_id": req.decoded.user_id })
          .then((result) => {
            //console.log(result[0].active)
            if(result[0].active == 'Y'){
              var newtoken = jwt.sign({ "email": req.decoded.email, "user_id": req.decoded.user_id ,"office_id" : req.decoded.office_id , "region_id" : req.decoded.region_id , "division_id" : req.decoded.division_id , "dealer_id" : req.decoded.dealer_id , "user_type" : req.decoded.user_type,"first_name": req.decoded.first_name,"last_name": req.decoded.last_name,"phone": req.decoded.phone,version : parseInt(process.env.VERSION) }, config.jwt_secret, {
                expiresIn: "6h"
              });
              var newrefreshtoken = jwt.sign({ "email": req.decoded.email, "user_id": req.decoded.user_id ,"office_id" : req.decoded.office_id , "region_id" : req.decoded.region_id , "division_id" : req.decoded.division_id , "dealer_id" : req.decoded.dealer_id , "user_type" : req.decoded.user_type,"first_name": req.decoded.first_name,"last_name": req.decoded.last_name,"phone": req.decoded.phone,version : parseInt(process.env.VERSION) }, config.jwt_secret, {
                expiresIn: "12h"
              });
              res.setHeader('Authentication', true)
              res.setHeader('AuthToken', newtoken)
              res.setHeader('RefreshToken', newrefreshtoken)
              next();
            }else{
              res.setHeader('Authentication', false)
              return res.json({ status: false, isblocked: true, message: "You are blocked by admin." });
            }

          }).catch((err) => {
            res.setHeader('Authentication', false)
            next();
          })
          
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
          if(decoded.version != parseInt( process.env.VERSION)){
            res.setHeader('Authentication', false)
            return res.json({ status: false, Authentication: false, message: "You are using an older version of app. Please update your app.", invalidToken: true });

            // res.setHeader('Authentication', true)
            // return res.json({ status: false, isblocked: true, message: "You are using an older version of app. Please update your app." });

          }else{
            req.decoded = decoded;
            //console.log(req.decoded.user_id);
            functions.get('user_master', { "user_id": req.decoded.user_id })
            .then((result) => {
                if (result) {
                    if(result[0].active == 'Y'){
                      // functions.get('user_login_collection', { "user_id": req.decoded.user_id })
                      var sql = `SELECT * FROM user_login_collection WHERE user_id = ${req.decoded.user_id} AND( platform = 'prospect_ios' OR platform = 'prospect_web')`;
                      functions.selectQuery(sql)
                      .then((respon) => {
                        if (respon) {
                          if(respon[0].session_id != token){
                            res.setHeader('Authentication', true)
                            if(req.body.isLogin ){
                              res.setHeader('Authentication', true)
                              next();
                            }else{
                              res.setHeader('Authentication', true)
                              next();
                              //return res.json({ status: true, isloggedin: true, message: "Your session disabled due to concurrent logins" });
                            }
                          }else{
                            res.setHeader('Authentication', true)
                            next();
                          }
                        }else{
                          res.setHeader('Authentication', true)
                          next();
                        }
                      }).catch((err) => {
                        res.setHeader('Authentication', true)
                        next();
                      })

                    }else{
                      res.setHeader('Authentication', true)
                      return res.json({ status: false, isblocked: true, message: "You are blocked by admin." });
                    }
                }else{
                  res.setHeader('Authentication', true)
                  next();
                }
            }).catch((err) => {
                res.setHeader('Authentication', true)
                next();
            })
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

router.post('/chekLoginToken', usercontroller.chekLoginToken, (req, res, next) => {
  res.json(req.response)
});

router.post('/clearLoginTokens', usercontroller.clearLoginTokens, (req, res, next) => {
  res.json(req.response)
});
router.get('/getUserInfo', usercontroller.getUserInfo, (req, res, next) => {
  res.json(req.response)
});
router.get('/getManagerInfo', usercontroller.getManagerInfo, (req, res, next) => {
  res.json(req.response)
});
router.post('/getUserResidentialDetails', usercontroller.getUserResidentialDetails, (req, res, next) => {
  res.json(req.response)
});


router.post('/autoLogin', usercontroller.autoLogin, usercontroller.checkUserAlreadyInlogin, (req, res, next) => {
  res.json(req.response)
});

// router.get('/getUserInfoNew', usercontroller.getUserInfoNew, (req, res, next) => {
//   res.json(req.response)
// });


router.post('/getSalesRepDetails', usercontroller.getSalesRepDetails, (req, res, next) => {
  res.json(req.response)
});



router.post('/getLocationDetails', usercontroller.getLocationDetails,usercontroller.getCustomersNew,usercontroller.getUniqueResidentailID,usercontroller.getCustomersNew,
usercontroller.getDetails, usercontroller.getLocationHistory,usercontroller.getAppointments,usercontroller.getNotes,usercontroller.checkMultiple, (req, res, next) => {
  res.json(req.response)
});
router.post('/getLocationDetailsnew', usercontroller.getLocationDetailsnew, usercontroller.getCustomersNew, usercontroller.getUniqueResidentailID, usercontroller.getDetails,usercontroller.getLocationHistory,usercontroller.getAppointments,usercontroller.getNotes,usercontroller.checkMultiple, (req, res, next) => {
  res.json(req.response)
});

router.post('/getLocationDetailsMultiple', usercontroller.getLocationDetailsnew, usercontroller.getLocationHistory,usercontroller.getAppointments,usercontroller.getNotes,usercontroller.getCustomers,usercontroller.checkMultiple, (req, res, next) => {
  res.json(req.response)
});

router.post('/getLocations', usercontroller.getLocations, (req, res, next) => {
  res.json(req.response)
});


router.post('/getNearestLocations', usercontroller.getNearestLocations, (req, res, next) => {
  //res.json(req.response)
});


router.post('/addLocations', usercontroller.addLocations, (req, res, next) => {
  res.json(req.response)
});



router.post('/saveAreaCoordinates',usercontroller.saveAreaCoordinates , (req, res, next) => {
  res.json(req.response)
});
router.post('/deleteAreaCoordinates',usercontroller.deleteAreaCoordinates , (req, res, next) => {
  res.json(req.response)
});


router.post('/saveResidentiaInArea',usercontroller.saveResidentiaInArea , (req, res, next) => {
  res.json(req.response)
});


router.post('/saveUserLatLng',usercontroller.saveUserLatLng , (req, res, next) => {
  res.json(req.response)
});



router.post('/getSaleRepLists', usercontroller.getSaleRepLists, (req, res, next) => {
  res.json(req.response)
});

router.post('/getAllSaleRepLists', usercontroller.getAllSaleRepLists, (req, res, next) => {
  res.json(req.response)
});


router.get('/getStatusTypes', usercontroller.getStatusTypes, (req, res, next) => {
  res.json(req.response)
});

router.post('/getFormBlocks', usercontroller.getFormBlocks,usercontroller.getParseFormBlocks, (req, res, next) => {
  res.json(req.response)
});

router.post('/addAddress', usercontroller.addAddress,usercontroller.getAddressDetailByID,usercontroller.addToMongo, (req, res, next) => {
  res.json(req.response)
});

router.post('/createCustomer', usercontroller.createCustomer, usercontroller.updateToMongo,(req, res, next) => {
  res.json(req.response)
});


router.post('/getAreaDetails', usercontroller.getAssignedRepslist, usercontroller.getAreaDetails, usercontroller.getAreaHistory,usercontroller.getOwnerInfo, (req, res, next) => {
  res.json(req.response)
});
router.post('/saveOpportunityData',usercontroller.checkEmailExistOrNot, usercontroller.checkCustomerExist, usercontroller.createOpportunityCustomer, usercontroller.saveOpportunity,usercontroller.saveOpportunityData, usercontroller.updateToMongoFromOpp,(req, res, next) => {
  res.json(req.response)
  request('http://3.215.218.183:3000/client/import', function (error, response, body) {})
  //request('https://node.nomodealerhub.com:3001/client/import', function (error, response, body) {})
});

router.post('/getUserProfileInfo', usercontroller.getUserProfileInfo, usercontroller.getCounts,usercontroller.getMyAppointments,usercontroller.getUserHistory,usercontroller.getAvailableAreas, (req, res, next) => {
  res.json(req.response)
});

router.post('/saveCustomerData',  usercontroller.saveCustomerData,usercontroller.getLocationDetails,usercontroller.getLocationHistory, (req, res, next) => {
  res.json(req.response)
});
router.post('/addAppointment',  usercontroller.getDealerInfo, usercontroller.addAppointment, (req, res, next) => {
  res.json(req.response)
});

// router.post('/addAppointment', usercontroller.createCustomerAppoinment, usercontroller.addAppointment, (req, res, next) => {
//   res.json(req.response)
// });
router.post('/addNotes',  usercontroller.addNotes, (req, res, next) => {
  res.json(req.response)
});

router.post('/assignSalesRepArea',  usercontroller.assignSalesRepArea, (req, res, next) => {
  res.json(req.response)
});
router.post('/deleteAssignArea',  usercontroller.deleteAssignArea,usercontroller.checkAssignedRepslist, (req, res, next) => {
  res.json(req.response)
});

router.post('/sendFeedback',  usercontroller.sendFeedback, (req, res, next) => {
  res.json(req.response)
});
router.post('/getUserDetails',  usercontroller.getUserDetails, usercontroller.getUserHistory,usercontroller.getAvailableAreas, (req, res, next) => {
  res.json(req.response)
});
router.post('/getVerticals',  usercontroller.getVerticals, (req, res, next) => {
  res.json(req.response)
});
router.post('/getAvailableOffices',  usercontroller.getAvailableOffices, (req, res, next) => {
  res.json(req.response)
});
router.get('/getManagersList',  usercontroller.getManagersList, (req, res, next) => {
  res.json(req.response)
});

router.post('/getMessages',  usercontroller.getMessages, (req, res, next) => {
  res.json(req.response)
});




router.post('/saveHomeOwnerData',  usercontroller.saveHomeOwnerData, (req, res, next) => {
  res.json(req.response)
});
router.post('/searchByStatus',  usercontroller.searchByStatus, (req, res, next) => {
  res.json(req.response)
});


router.post('/addNewCustomer',  usercontroller.addNewCustomer, (req, res, next) => {
  res.json(req.response)
});



router.post('/searchByAddress',  usercontroller.searchByAddress, (req, res, next) => {
  res.json(req.response)
});


router.post('/getAreas',  usercontroller.getAreas, (req, res, next) => {
  res.json(req.response)
});
router.post('/getManagerAreas',  usercontroller.getManagerAreas, (req, res, next) => {
  res.json(req.response)
});
router.get('/getStates',  usercontroller.getStates, (req, res, next) => {
  res.json(req.response)
});
router.post('/addAnalytics',  usercontroller.addAnalytics, (req, res, next) => {
  res.json(req.response)
});



router.post('/analaytics', usercontroller.analaytics, (req, res, next) => {
  res.json(req.response)
});

router.post('/checkOppEmailExistOrNot', usercontroller.checkOppEmailExistOrNot, (req, res, next) => {
  res.json(req.response)
});




// router.post('/saveOpportunityData', usercontroller.saveOpportunityData, (req, res, next) => {
//   res.json(req.response)
// });
router.post('/test', usercontroller.test, (req, res, next) => {
  res.json(req.response)
});
router.post('/user_logout', (req, res, next) => {
    console.log(req.body);
    let platform = 'prospect_web';
    if(req.body.platform != undefined && req.body.platform != ''){
      platform = req.body.platform;
    }
    request({
      //url: 'http://10.10.10.20:3000/client/user_logout',
      url: 'http://3.215.218.183:3000/client/user_logout',
      //url: 'https://node.nomodealerhub.com:5003/client/user_logout',
      method: 'POST',
      json: { session_id : req.headers['authtoken'] ,user_id : req.decoded.user_id , 'platform' : platform }
    }, function(error, response, body){

      res.json(response.body)
    });

});


//------------------------ V2 ----------------




router.post('/getTimeZoneList', usercontroller.getTimeZoneList, (req, res, next) => {
  res.json(req.response)
});


router.post('/momentTest', usercontroller.momentTest, (req, res, next) => {
  res.json(req.response)
});
router.post('/updateCustomerWithLatLong', usercontroller.updateCustomerWithLatLong, (req, res, next) => {
  res.json(req.response)
});
router.post('/deleteNotes', usercontroller.deleteNotes, (req, res, next) => {
  res.json(req.response)
});




module.exports = router;
