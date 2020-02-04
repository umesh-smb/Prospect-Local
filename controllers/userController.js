    let express = require('express');
    app = express();
    jwt = require('jsonwebtoken');
    user = require('.././models/userModel');
    functions = require('../helpers/functions');
    Password = require("node-php-password");
    config = require('.././server/config');
    var MongoClient = require('mongodb').MongoClient;
    //var mongourl = 'mongodb://10.10.11.254:27017';  // local
    var mongourl = 'mongodb://3.215.155.209:27077';  // test
    //var mongourl = 'mongodb://3.214.39.22:27077';  /// live
    var dbName  = 'prospect';
    const assert = require('assert');
    var request = require('request');
    moment = require('moment');
    var momenttimezone = require('moment-timezone');
    var md5 = require('md5');
    const zlib = require('zlib');

    var fs = require('fs');
    var parseString = require('xml2js').parseString;
    const { writeFileSync } = require('fs');
    const ics = require('ics');
    let consumerTableArray = { 
        'US-NJ':'consumer_data_nj',
        'US-IL':'consumer_data_il',
        'US-CA':'consumer_data_ca',
        'US-CT':'consumer_data_ct',
        'US-MA':'consumer_data_ma',
        'US-NY':'consumer_data_ny',
        'US-RI':'consumer_data_ri',
        'US-NV':'consumer_data_nv',
        'US-AZ':'consumer_data_az',
        'US-TX':'consumer_data_tx',
        'US-CO':'consumer_data_co',
        'US-UT':'consumer_data_ut',
        'US-ID':'consumer_data_id',
        'US-OK':'consumer_data_ok',
        'US-FL':'consumer_data_fl',
        'US-NC':'consumer_data_nc',
        'US-SC':'consumer_data_sc',
        'US-MO':'consumer_data_mo',
        'US-MN':'consumer_data_mn',
        'pr':'consumer_data_pr',
    };
    let stateNameArray = { 
        'US-NJ':'nj',
        'US-IL':'il',
        'US-CA':'ca',
        'US-CT':'ct',
        'US-MA':'ma',
        'US-NY':'ny',
        'US-RI':'ri',
        'US-NV':'nv',
        'US-AZ':'az',
        'US-TX':'tx',
        'US-CO':'co',
        'US-UT':'ut',
        'US-ID':'id',
        'US-OK':'ok',
        'US-FL':'fl',
        'US-NC':'nc',
        'US-SC':'sc',
        'US-MO':'mo',
        'US-MN':'mn',
        'pr':'pr',
    };
    let residentialTableArray = { 
        'US-NJ':'residential_data_nj',
        'US-IL':'residential_data_il',
        'US-CA':'residential_data_ca',
        'US-CT':'residential_data_ct',
        'US-MA':'residential_data_ma',
        'US-NY':'residential_data_ny',
        'US-RI':'residential_data_ri',
        'US-NV':'residential_data_nv',
        'US-AZ':'residential_data_az',
        'US-TX':'residential_data_tx',
        'US-CO':'residential_data_co',
        'US-UT':'residential_data_ut',
        'US-ID':'residential_data_id',
        'US-OK':'residential_data_ok',
        'US-FL':'residential_data_fl',
        'US-NC':'residential_data_nc',
        'US-SC':'residential_data_sc',
        'US-MO':'residential_data_mo',
        'US-MN':'residential_data_mn',
        'pr':'residential_data_pr',

        'NJ':'residential_data_nj',
        'IL':'residential_data_il',
        'CA':'residential_data_ca',
        'CT':'residential_data_ct',
        'MA':'residential_data_ma',
        'NY':'residential_data_ny',
        'RI':'residential_data_ri',
        'NV':'residential_data_nv',
        'AZ':'residential_data_az',
        'TX':'residential_data_tx',
        'CO':'residential_data_co',
        'UT':'residential_data_ut',
        'ID':'residential_data_id',
        'OK':'residential_data_ok',
        'FL':'residential_data_fl',
        'NC':'residential_data_nc',
        'SC':'residential_data_sc',
        'MN':'residential_data_mn',
        'MO':'residential_data_mo',
        'pr':'residential_data_pr',
    };
    let stateNameNewArray = { 
        'US-NJ':'NJ',
        'US-IL':'IL',
        'US-CA':'CA',
        'US-CT':'CT',
        'US-MA':'MA',
        'US-NY':'BY',
        'US-RI':'RI',
        'US-NV':'NV',
        'US-AZ':'AZ',
        'US-TX':'TX',
        'US-CO':'CO',
        'US-UT':'UT',
        'US-ID':'ID',
        'US-OK':'OK',
        'US-FL':'FL',
        'US-NC':'NC',
        'US-SC':'SC',
        'US-MN':'MN',
        'US-MO':'MO',
        'pr':'PR',
    };
    

let handler = {

    index(req, res, next) {
        next();
    },

    clearLoginTokens(req, res, next){
        if(req.decoded.user_id){

            // functions.get('user_login_collection', { "user_id": req.decoded.user_id })



            var sql = `SELECT * FROM user_login_collection WHERE user_id = ${req.decoded.user_id} AND(platform = 'prospect_ios' OR platform = 'prospect_web') `;
            functions.selectQuery(sql)
            .then((loginData) => {
                const example = async (result) => {
                    for (const num of result) {
                        await returnNum(num);
                    }
                    return;
                }
                const returnNum = details => {
                    let curtime = moment().format("YYYY-MM-DD H:mm:ss");
                    return new Promise((resolve, reject) => {
                        var x = new moment();
                        var y = new moment('2018-08-22 10:10:10')
                        var duration = moment.duration(x.diff(details.login_time)).as('seconds');
                        let result2 = {
                            'dealer_id':req.decoded.dealer_id,
                            'user_id' : req.decoded.user_id,
                            'session_id' : req.headers['authtoken'],
                            'ip_address' :  details.ip_address,
                            'deviceName' :  details.browser.split('(')[0],
                            'osVersion' :  details.browser.split(')')[1],
                            'browser' : details.browser,
                            'duration':duration,
                            'logout_time':moment().format("YYYY-MM-DD H:mm:ss"),
                            'login_time': details.login_time
                        };
                        // if(details.platform == 'prospect_web'){
                        //     result2['deviceName'] = details.deviceName+'('+details.osVersion+')';
                        // }else{
                        //     result2['deviceName'] = details.deviceName+'('+details.osVersion+')';
                        // }
                        if(req.headers['source'] != '' && req.headers['source'] != undefined){
                            result2['platform'] = 'prospect_web';
                        }else{
                            result2['platform'] = 'prospect_ios';
                            result2['browser'] = details.browser;
                            //result2['browser'] = details.deviceName+'('+details.osVersion+')';

                        }
                        let analylogoutarray = { 
                            'dealer_id':req.decoded.dealer_id,
                            'user_id' : req.decoded.user_id,
                            'action_type' : 'user_logout',
                            'new_value' : result2,
                            'action_file':  ''
                        }
                        if(req.headers['source'] != '' && req.headers['source'] != undefined){
                            analylogoutarray['platform'] = 'prospect_web';
                        }else{
                            analylogoutarray['platform'] = 'prospect_ios';
                        }
                        // functions.delete('user_login_collection', { "session_id": details.session_id })
                        // .then((resu) => {
                        // })
                        
                        // request.post({
                        //     headers: {'content-type' : 'application/json'},
                        //     url:     process.env.ANLYTICSURL,
                        //     body:    JSON.stringify(analylogoutarray)
                        // }, function(error, response, body){                                
                        // });

                        resolve();
                    });
                }

                example(loginData).then((result) => {
                    req.response.status = true;
                    req.response.message = "Session cleared successfully.";
                    next();
                    // next();
                })

            }).catch((err) => {
                next();
            });


            // functions.get('user_login_collection', { "session_id": req.headers['authtoken'] })
            // .then((loginData) => {
            //     let curtime = moment().format("YYYY-MM-DD H:mm:ss");
            //     if (loginData) {
            //         var x = new moment();
            //         var y = new moment('2018-08-22 10:10:10')
            //         var duration = moment.duration(x.diff(loginData[0].login_time)).as('seconds');
                    

            //         let result2 = {
            //             'dealer_id':req.decoded.dealer_id,
            //             'user_id' : req.decoded.user_id,
            //             'session_id' : req.headers['authtoken'],
            //             'ip_address' :  req.body.ipAddress,
            //             'deviceName' :  req.body.deviceName,
            //             'osVersion' :  req.body.osVersion,
            //             'browser' : req.body.browser,
            //             'duration':duration,
            //             'logout_time':moment().format("YYYY-MM-DD H:mm:ss"),
            //             'login_time': loginData[0].login_time
            //         };
                   
            //         if(req.headers['source'] != '' && req.headers['source'] != undefined){
            //             result2['platform'] = 'prospect_web';
            //         }else{
            //             result2['platform'] = 'prospect_ios';
            //             result2['browser'] = req.body.deviceName+'('+req.body.osVersion+')';
            //         }
            //         let analylogoutarray = { 
            //             'dealer_id':req.decoded.dealer_id,
            //             'user_id' : req.decoded.user_id,
            //             'action_type' : 'user_logout',
            //             'new_value' : result2,
            //             'action_file':  ''
            //         }
            //         if(req.headers['source'] != '' && req.headers['source'] != undefined){
            //             analylogoutarray['platform'] = 'prospect_web';
            //         }else{
            //             analylogoutarray['platform'] = 'prospect_ios';
            //         }

            //         functions.delete('user_login_collection', { "session_id": req.headers['authtoken'] })
            //         .then((resu) => {
            //         })
                    
            //         request.post({
            //             headers: {'content-type' : 'application/json'},
            //             url:     process.env.ANLYTICSURL,
            //             body:    JSON.stringify(analylogoutarray)
            //         }, function(error, response, body){                                
            //         });
            //     }
            // });


        // console.log("hereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
        // console.log(req.decoded.user_id);
        // if(req.decoded.user_id){
        //     console.log("hererererere");
        //     console.log(req.decoded.user_id);
        //     functions.delete('user_login_collection', { "user_id": req.decoded.user_id , "platform" :'prospect_web'})
        //     .then((resu) => {
        //         functions.delete('user_login_collection', { "user_id": req.decoded.user_id , "platform" :'prospect_ios'})
        //         .then((resu) => {
        //             req.response.status = true;
        //             req.response.message = "Session cleared successfully.";
        //             next();
        //         })
            
        //     })
            
        }else{
            next();
        }
    },
    chekLoginToken(req, res, next){
        req.response.isloggedIn =false;
        req.response.isloggedin =false;
        if (req.decoded.user_id) {
            //console.log(req.decoded.user_id);
            var sql = `SELECT * FROM user_login_collection WHERE user_id = ${req.decoded.user_id} AND(platform = 'prospect_ios' OR platform = 'prospect_web') `;
            functions.selectQuery(sql)
            .then((respon) =>{
                if (respon.length) {
                    var sql2 = `SELECT * FROM user_login_collection WHERE session_id = '`+req.headers['authtoken']+`' ) `;
                    functions.selectQuery(sql2)
                    .then((newresp) =>{
                        if (newresp.length) {
                            if(newresp[0].platform != 'panel_prospect'){
                                if(respon[0].session_id != req.headers['authtoken']){
                                    req.response.data =respon;
                                    req.response.isloggedIn =true;
                                    req.response.isloggedin =true;
                                    req.response.message = "Your session disabled due to concurrent logins.";
                                    next();
                                }else{
                                    req.response.status = true;
                                    next();
                                }
                            }else{
                                req.response.status = true;
                                next();
                            }
                        }else{
                            
                            req.response.status = true;
                            next();
                        }
                    }).catch((err) => {
                        req.response.status = true;
                        next();
                    });

                    
                }else{
                    req.response.status = true;
                    next();
                }
            }).catch((err) => {
                req.response.status = true;
                next();
            });
            
        }else{
            req.response.status = true;
            next();
        }
    },

    checkUserAlreadyInlogin(req, res, next){
        req.response.isloggedIn =false;
        if(req.response.user_id != '' && req.response.user_id != undefined){
            var sql = `SELECT * FROM user_login_collection WHERE user_id = ${req.response.user_id} AND(platform = 'prospect_ios' OR platform = 'prospect_web') `;
            functions.selectQuery(sql)
            .then((respon) =>{
                if (respon.length) {
                    req.response.isloggedIn =true;
                    req.response.isloggedInmessage = "You are already logged in on a different device, by clicking 'Ok' we will disable your concurrent logins and log you out of your previous session.";
                    next();
                }else{
                    next();
                }
            }).catch((err) => {
                next();
            });

            // functions.get('user_login_collection', { "user_id": req.response.user_id, })
            // .then((respon) => {
            //     if (respon) {
            //         if(respon[0].platform == 'prospect_ios'  || respon[0].platform == 'prospect_web'){
            //             req.response.isloggedIn =true;
            //             req.response.isloggedInmessage = "You are already logged in on a different device, by clicking 'Yes' we will disable your concurrent logins and logged you out of your previous session.";
            //             next();
            //         }else{
            //             next();
            //         }
            //     }else{
            //         next();
            //     }
                
            // }).catch((err) => {
            //     next();
            // })
        }else{
            next();
        }
       

    },


    login(req, res, next) {
       
        if (!req.body.email) {
            req.response.message = "Email is required.";
            next();
        } else if (!req.body.password) {
            req.response.message = "Password is required.";
            next();
        } else {
            user.getUserDetailsForLogin(req.body.email).then((result) => {
                if (result.length) {
                    if(result[0].dealeractive == 'Y'){
                        if(result[0].prospect_active == 'Y'){
                            if(result[0].verticalscount > 0){
                            
                                if(result[0].active == 'Y'){
                                    if(Password.verify( req.body.password , result[0].password)){ 

                                        req.response.user_id = result[0].user_id;
                                        var newtoken = jwt.sign({ "email": result[0].email, "user_id": result[0].user_id ,"office_id" : result[0].office_id , "region_id" : result[0].region_id , "division_id" : result[0].division_id, "dealer_id" : result[0].dealer_id , "user_type" : result[0].user_type ,"first_name": result[0].first_name,"last_name": result[0].last_name,"phone": result[0].phone,version : parseInt(process.env.VERSION)
                                        }, config.jwt_secret, {
                                            expiresIn: "6h"
                                        });
                                        var newrefreshtoken = jwt.sign({ "email": result[0].email, "user_id": result[0].user_id ,"office_id" : result[0].office_id , "region_id" : result[0].region_id , "division_id" : result[0].division_id, "dealer_id" : result[0].dealer_id ,"user_type" : result[0].user_type,"first_name": result[0].first_name,"last_name": result[0].last_name,"phone": result[0].phone, version : parseInt(process.env.VERSION) }, config.jwt_secret, {
                                            expiresIn: "12h"
                                        });
                                        res.setHeader('AuthToken', newtoken)
                                        res.setHeader('RefreshToken', newrefreshtoken)
                                        // let fcmArray = { "fcm_token": req.body.fcm_token, "time_zone": req.body.time_zone };
                                        // functions.update('fg_users', fcmArray, { user_id: result[0]['user_id'] })
                                        // .then((respo) => {
                                        // })
                                        delete result[0].password;
                                        
                                        result[0].distance = (process.env.DISTANCE * 50)/100000 ;
                                        req.response.data = result[0];
                                    
                                        req.response.status = true;
                                        req.response.message = "Logged In Successfully.";
                                        next();
                                    }else{
                                        req.response.message = "Incorrect password.";
                                        next();
                                    }
                                }else{
                                    req.response.message = "You are blocked by admin.";
                                    next();
                                }
                            }else{
                                req.response.message = "No vertcals are enabled for this dealer.";
                                next();
                            }
                        }else{
                            req.response.message = "Prospect is not activated for this dealer.";
                            next();
                        }
                    }else{
                        req.response.message = "This dealer is blocked by Super Admin.";
                        next();
                    }
                } else {
                    req.response.message = "Incorrect login credentials. Please retry.";
                    next();
                }
            }).catch((err) => {
                req.response.message = err + "Oops! something went wrong.";
                next();
            })
        }

    },

    autoLogin(req, res, next) {
        if (req.decoded.user_id) {
            user.getUserDetailsForautoLogin(req.decoded.user_id).then((result) => {
                if (result.length) {
                    if(result[0].dealeractive == 'Y'){
                        if(result[0].prospect_active == 'Y'){
                            if(result[0].verticalscount > 0){
                                if(result[0].active == 'Y'){
                                    var newtoken = jwt.sign({ "email": result[0].email, "user_id": result[0].user_id ,"office_id" : result[0].office_id , "region_id" : result[0].region_id , "division_id" : result[0].division_id, "dealer_id" : result[0].dealer_id , "user_type" : result[0].user_type ,version : parseInt(process.env.VERSION)
                                    }, config.jwt_secret, {
                                        expiresIn: "6h"
                                    });
                                    var newrefreshtoken = jwt.sign({ "email": result[0].email, "user_id": result[0].user_id ,"office_id" : result[0].office_id , "region_id" : result[0].region_id , "division_id" : result[0].division_id, "dealer_id" : result[0].dealer_id ,"user_type" : result[0].user_type, version : parseInt(process.env.VERSION) }, config.jwt_secret, {
                                        expiresIn: "12h"
                                    });
                                    res.setHeader('AuthToken', newtoken)
                                    res.setHeader('RefreshToken', newrefreshtoken)
                                    // let fcmArray = { "fcm_token": req.body.fcm_token, "time_zone": req.body.time_zone };
                                    // functions.update('fg_users', fcmArray, { user_id: result[0]['user_id'] })
                                    // .then((respo) => {
                                    // })
                                    delete result[0].password;
                                    result[0].distance = (process.env.DISTANCE * 50)/100000 ;
                                    req.response.data = result[0];
                                    
                                    req.response.status = true;
                                    req.response.message = "Logged In Successfully.";
                                    next();
                                    
                                }else{
                                    req.response.message = "You are blocked by admin.";
                                    next();
                                }
                            }else{
                                req.response.message = "No vertcals are enabled for this dealer.";
                                next();
                            }
                        }else{
                            req.response.message = "Prospect is not activated for this dealer.";
                            next();
                        }
                    }else{
                        req.response.message = "This dealer is blocked by Super Admin.";
                        next();
                    }
                } else {
                    req.response.message = "Incorrect login credentials. Please retry.";
                    next();
                }
            }).catch((err) => {
                req.response.message =  "Oops! something went wrong."+err;
                next();
            })

        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },




    userDetails(req, res, next) {
        user.getUserByEmail('user@prospect.com').then((result) => {
            req.response.data = result[0];
            req.response.status = true;
            req.response.message = "Logged In Successfully.";
            next();
        }).catch((err) => {
            req.response.message = err + "Oops! something went wrong.";
            next();
        })
    },


    forgotPassword(req, res, next) {

        if (!req.body.email) {
            req.response.message = "Email is required.";
            next();
        } else {
            user.getUserByEmail(req.body.email).then((result) => {
                if (result.length) {
                    var reset_code = Math.floor(1000 + Math.random() * 9000);
                    functions.update('user_master', { otp: reset_code }, { email: req.body.email })
                        .then((resu) => {
                            functions.get('general_emails', { "name": "prospect_forgot_password" })
                                .then((templateCode) => {
                                    if (templateCode) {
                                        var template = templateCode[0];
                                        template.email_template = template.email_template.replace("##CODE##", reset_code);
                                        template.email_template = template.email_template.replace("##NAME##", result[0].first_name+' '+result[0].last_name);
                                        var file_url = "";
                                        var email_subject = template.email_subject.replace('##APPNAME##', 'prospect+');
                                        functions.sendMail(result[0].email, "Verification Code", template, true, file_url,'', function(emailres) {
                                            if (emailres && emailres.status != undefined && emailres.status == 'success') {
                                                let array = {
                                                    type: 'email',
                                                    to: result[0].email,
                                                    message: template.email_template,
                                                    attachments: file_url,
                                                    subject: email_subject,
                                                    message_type: "verification_code",
                                                    from_email: emailres.from_email,
                                                    from_name: emailres.from_name,
                                                    created_at: moment().format("YYYY-MM-DD H:mm:ss"),
                                                    updated_at: moment().format("YYYY-MM-DD H:mm:ss")
                                                };
                                                functions.insert('log', array)
                                            }
                                            //console.log('emailres New Appointment', emailres)
                                        })
                                    }
                                });
                            req.response.status = true;
                            req.response.otp = reset_code;
                            req.response.message = "We have sent a verification code to the email.";
                            next();
                        }).catch((err) => {
                            req.response.message = "Oops! something went wrong.";
                            next();
                        })
                } else {
                    req.response.message = "Email does not exist.";
                    next();
                }
            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
        }
    },


    forgotPasswordOld(req, res, next) {

        if (!req.body.email) {
            req.response.message = "Email is required.";
            next();
        } else {
            user.getUserByEmail(req.body.email).then((result) => {
                if (result.length) {
                    var reset_code = Math.floor(1000 + Math.random() * 9000);
                    functions.update('user_master', { otp: reset_code }, { email: req.body.email })
                        .then((resu) => {
                            functions.get('general_emails', { "name": "prospect_forgot_password" })
                            .then((templateCode) => {
                                if (templateCode) {
                                    var template = templateCode[0];
                                    template.email_template = template.email_template.replace("##CODE##", reset_code);
                                    template.email_template = template.email_template.replace("##NAME##", result[0].first_name);
                                    var file_url="";
                                    functions.sendMail(result[0].email, "Verification Code", template, true,file_url,'', function (emailres) {
                                    })
                                }
                            });
                            req.response.status = true;
                            req.response.otp = reset_code;
                            req.response.message = "We have sent a verification code to the email.";
                            next();
                        }).catch((err) => {
                            req.response.message = "Oops! something went wrong.";
                            next();
                        })
                } else {
                    req.response.message = "Email does not exist.";
                    next();
                }
            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
        }
    },

    verifyResetCode(req, res, next) {
        if (req.body.email != '') {
            user.getUserByEmail(req.body.email)
                .then((details) => {
                  
                    if (details[0].otp == req.body.otp) {
                        req.response.message = "Email verified successfully.";
                        req.response.status = true;
                        next();
                    } else {
                        req.response.message = "Invalid verification code.";
                        next();
                    }
                }).catch((err) => {
                    req.response.message = "Oops! something went wrong.";
                    next();
                })
        } else {
            next();
        }
    },

    setPassword(req, res, next) {

        if (req.body.email) {
            if (!req.body.password) {
                req.response.message = "Password is required.";
                next();
            } else {
                user.getUserByEmail(req.body.email)
                .then((result) => {
                    if (result.length) {
                        if (result[0].otp == req.body.otp) {
                            var enc_pass = Password.hash(req.body.password, "PASSWORD_DEFAULT");
                            functions.update('user_master', { password: enc_pass }, { email: req.body.email })
                            .then((resu) => {


                                //-----------------------
                                
                                delete result[0].password;
                                delete result[0].otp;
                                let analyarray = { 
                                    'dealer_id':result[0].dealer_id,
                                    'user_id' : result[0].user_id,
                                    'action_type' : 'change_password',
                                    'new_value' : result[0],
                                    'action_file':  ''
                                }
                                if(req.headers['source'] != '' && req.headers['source'] != undefined){
                                    analyarray['platform'] = 'prospect_web';
                                }else{
                                    analyarray['platform'] = 'prospect_ios';
                                }
                                request.post({
                                    headers: {'content-type' : 'application/json'},
                                    url:     process.env.ANLYTICSURL,
                                    body:    JSON.stringify(analyarray)
                                }, function(error, response, body){                                
                                });
                                //-----------------------

                                req.response.status = true;
                                req.response.message = "Password reset successfully.";
                                next();

                            }).catch((err) => {
                                req.response.err = err;
                                req.response.message = "Oops! something went wrong."+err;
                                next();
                            })
                        }else{
                            req.response.message = "Invalid verification code.";
                            next();
                        }
                       
                    } else {
                        req.response.message = "User Does Not exist.";
                        next();
                    }
                }).catch((err) => {
                        req.response.message = "Oops! something went wrong.";
                        next();
                })
            }

        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },
    

    getLocations(req, res, next) {

        user.getLocations( req.body.latitude, req.body.longitude )
        .then((result) => {
            const getData = async (result) => {
                let retArray = [];
                for (const num of result) {
                    retArray.push(await returnData(num));
                }
                return retArray;
            }
            const returnData = details => {
                let insArray = { type: "Feature", properties : {}, geometry : {  type :"Point", coordinates : [] }};
                return new Promise((resolve, reject) => {
                    insArray.properties = details;
                    insArray.geometry.coordinates.push(parseFloat(details.longitude),parseFloat(details.latitude))
                    resolve(insArray);
                });
            }
            getData(result).then((result) => {
                let resdata = {};
                req.response.status = true;
                resdata.type = 'FeatureCollection';
                resdata.features = result;
                req.response.data = resdata;
                req.response.resdata = resdata;
                req.response.message = "Success";
                next();
            })
           
        }).catch((err) => {
            req.response.err = err;
            req.response.message = "Oops! something went wrong.";
            next();
        })
        // fs.readFile('locations_2.json', function(err, data) {	
		// 	//parseString(data, function (err, result) {
        //         // callback(result.preferences);
        //         req.response.data =  JSON.parse(data);
        //         req.response.message =  "Success";
        //         next();
		// 	//});
		// });
        
    },


    addLocations(req, res, next) {
        const getData = async (result) => {
            let insArray = {};
            
            for (const num of result) {
                insArray = {
                    address_line1 : num.properties.street,
                    address_line2 : '',
                    first_name :num.properties.first_name,
                    last_name : num.properties.last_name,
                    city : num.properties.city,
                    state : num.properties.state,
                    zip_code : num.properties.zip,
                    latitude : num.geometry.coordinates[1],
                    longitude : num.geometry.coordinates[0]
                };
                const resp = await returnData(insArray);
            }
            return true;
        }
        const returnData = detail => {
            return new Promise((resolve, reject) => {
               
                functions.insert('residential_demo_live', detail )
                .then((respo) => {
                    resolve(detail);
                })
                //resolve(detail);
            });
        }
        fs.readFile('locations.json', function(err, data) {
            addresses = JSON.parse(data);
            
            // address = addresses.addresses;
            getData(addresses).then((address) =>{
                next();
            })
        })
    },


    checkMultiple(req, res, next){
        let tableName = '';
        if(req.body.location != undefined && req.body.location != ''){
            if(consumerTableArray[req.body.location] != '' && consumerTableArray[req.body.location] != undefined){
                tableName = consumerTableArray[req.body.location];
            }else{
                tableName = 'consumer_data_nj';
            }
        }else{
            tableName = 'consumer_data_nj'; 
        }

        // let tableName ='';
        // if(req.body.location != undefined && req.body.location != ''){
        //     if(req.body.location == 'US-NJ'){
        //         tableName = 'consumer_data_nj';
        //     }else if(req.body.location == 'US-IL'){
        //         tableName = 'consumer_data_il';
        //     }else if(req.body.location == 'US-CA'){
        //         tableName = 'consumer_data_ca';
        //     }else if(req.body.location == 'US-CT'){
        //         tableName = 'consumer_data_ct';
        //     }else if(req.body.location == 'US-MA'){
        //         tableName = 'consumer_data_ma';
        //     }else if(req.body.location == 'US-NY'){
        //         tableName = 'consumer_data_ny';
        //     }else if(req.body.location == 'US-RI'){
        //         tableName = 'consumer_data_ri';
        //     }else if(req.body.location == 'US-NV'){
        //         tableName = 'consumer_data_nv';
        //     }else if(req.body.location == 'US-AZ'){
        //         tableName = 'consumer_data_az';
        //     }else if(req.body.location == 'US-TX'){
        //         tableName = 'consumer_data_tx';
        //     }else{
        //         tableName = 'consumer_data_nj';
        //     }
        // }else{
        //     tableName = 'consumer_data_nj';
        // }


        user.checkMultiple(req.body.latitude,req.body.longitude,tableName, req.response.data.details.address_line1)
        .then((result) => {
            
            req.response.ismultiple = result[0].multiple;
            next();
        }).catch((err) => {
           
            next();
        })
    },

    getLocationDetails(req, res, next){
        let tableName = '';
        if(req.body.location != undefined && req.body.location != ''){
            if(consumerTableArray[req.body.location] != '' && consumerTableArray[req.body.location] != undefined){
                tableName = consumerTableArray[req.body.location];
            }else{
                tableName = 'consumer_data_nj';
            }
        }else{
            tableName = 'consumer_data_nj'; 
        }
      

        // let tableName ='';
        // if(req.body.location != undefined && req.body.location != ''){
        //     if(req.body.location == 'US-NJ'){
        //         tableName = 'consumer_data_nj';
        //     }else if(req.body.location == 'US-IL'){
        //         tableName = 'consumer_data_il';
        //     }else if(req.body.location == 'US-CA'){
        //         tableName = 'consumer_data_ca';
        //     }else if(req.body.location == 'US-CT'){
        //         tableName = 'consumer_data_ct';
        //     }else if(req.body.location == 'US-MA'){
        //         tableName = 'consumer_data_ma';
        //     }else if(req.body.location == 'US-NY'){
        //         tableName = 'consumer_data_ny';
        //     }else if(req.body.location == 'US-RI'){
        //         tableName = 'consumer_data_ri';
        //     }else if(req.body.location == 'US-NV'){
        //         tableName = 'consumer_data_nv';
        //     }else if(req.body.location == 'US-AZ'){
        //         tableName = 'consumer_data_az';
        //     }else if(req.body.location == 'US-TX'){
        //         tableName = 'consumer_data_tx';
        //     }else{
        //         tableName = 'consumer_data_nj';
        //     }
        // }else{
        //     tableName = 'consumer_data_nj';
        // }
       
      
        if (!req.body.residential_id) {
            req.response.message = "Location is required.";
            next();
        } else {
            user.getLocationDetails(req.body.residential_id,tableName,req.decoded.dealer_id)
            .then((result) => {
                if(result.length > 0){
                //-----------------------
                // let analyarray = { 
                //     'dealer_id':req.decoded.dealer_id,
                //     'user_id' : req.decoded.user_id,
                //     'action_type' : 'pin_click',
                //     'new_value' : result[0],
                //     'action_file':  ''
                // }
                // if(req.headers['source'] != '' && req.headers['source'] != undefined){
                //     analyarray['platform'] = 'prospect_web';
                // }else{
                //     analyarray['platform'] = 'prospect_ios';
                // }
                // request.post({
                //     headers: {'content-type' : 'application/json'},
                //     url:     process.env.ANLYTICSURL,
                //     body:    JSON.stringify(analyarray)
                // }, function(error, response, body){                                
                // });
                //-----------------------
            

                req.response.data = {};
                req.response.status = true;
                req.response.data.details = result[0];
            }else{
                req.response.data = {};
                req.response.status = true; 
            }
                //req.response.data = result[0];
                
                ///req.response.message = "Success";
                next();
            }).catch((err) => {
                req.response.message = "Oops! something went wrong."+err;
                next();
            })
        }
       
    },
    getDetails(req, res, next){
        
        let tableName = '';
        if(req.body.location != undefined && req.body.location != ''){
            if(consumerTableArray[req.body.location] != '' && consumerTableArray[req.body.location] != undefined){
                tableName = consumerTableArray[req.body.location];
            }else{
                tableName = 'consumer_data_nj';
            }
        }else{
            tableName = 'consumer_data_nj'; 
        }

        // let tableName ='';
        // if(req.body.location != undefined && req.body.location != ''){
        //     if(req.body.location == 'US-NJ'){
        //         tableName = 'consumer_data_nj';
        //     }else if(req.body.location == 'US-IL'){
        //         tableName = 'consumer_data_il';
        //     }else if(req.body.location == 'US-CA'){
        //         tableName = 'consumer_data_ca';
        //     }else if(req.body.location == 'US-CT'){
        //         tableName = 'consumer_data_ct';
        //     }else if(req.body.location == 'US-MA'){
        //         tableName = 'consumer_data_ma';
        //     }else if(req.body.location == 'US-NY'){
        //         tableName = 'consumer_data_ny';
        //     }else if(req.body.location == 'US-RI'){
        //         tableName = 'consumer_data_ri';
        //     }else if(req.body.location == 'US-NV'){
        //         tableName = 'consumer_data_nv';
        //     }else if(req.body.location == 'US-AZ'){
        //         tableName = 'consumer_data_az';
        //     }else if(req.body.location == 'US-TX'){
        //         tableName = 'consumer_data_tx';
        //     }else{
        //         tableName = 'consumer_data_nj';
        //     }
        // }else{
        //     tableName = 'consumer_data_nj';
        // }
       
      
        if (!req.body.residential_id) {
            req.response.message = "Location is required.";
            next();
        } else {
            user.getLocationDetails(req.body.residential_id,tableName,req.decoded.dealer_id)
            .then((result) => {
                if(result.length > 0){
                   
                    if(req.body.log || req.body.log == 'true'){
                        //-----------------------
                        
                        let analyarray = { 
                            'dealer_id':req.decoded.dealer_id,
                            'user_id' : req.decoded.user_id,
                            'action_type' : 'pin_click',
                            'new_value' : result[0],
                            'action_file':  ''
                        }
                        if(req.headers['source'] != '' && req.headers['source'] != undefined){
                            analyarray['platform'] = 'prospect_web';
                        }else{
                            analyarray['platform'] = 'prospect_ios';
                        }
                        request.post({
                            headers: {'content-type' : 'application/json'},
                            url:     process.env.ANLYTICSURL,
                            body:    JSON.stringify(analyarray)
                        }, function(error, response, body){                                
                        });
                        //-----------------------
                    }

                req.response.data.details = result[0];
            }else{
              
                req.response.status = true; 
            }
                //req.response.data = result[0];
                
                ///req.response.message = "Success";
                next();
            }).catch((err) => {
                req.response.message = "Oops! something went wrong."+err;
                next();
            })
        }
       
    },
    getUniqueResidentailID(req, res, next){
        
        const example = async (result) => {
            let array =[];
            for (const num of result) {
                array.push(await returnNum(num));
            }
            return array;
        }
        const returnNum = details => {
            return new Promise((resolve, reject) => {
                resolve(details.residential_id);
            });
        }
        example(req.response.data.customers).then((array) => {
            
            //console.log(Math.min.apply(Math, array));
            if(Math.min.apply(Math, array) == 'Infinity' ){
                req.response.residential_id = req.body.residential_id;
                req.body.residential_id = req.body.residential_id;
            }else{
                req.response.residential_id = Math.min.apply(Math, array);
                req.body.residential_id = Math.min.apply(Math, array);
            }
            
            next();
        })
        
    },
    getLocationHistory(req, res, next){
        
        let tableName = '';
        if(req.body.location != undefined && req.body.location != ''){
            if(consumerTableArray[req.body.location] != '' && consumerTableArray[req.body.location] != undefined){
                tableName = consumerTableArray[req.body.location];
            }else{
                tableName = 'consumer_data_nj';
            }
        }else{
            tableName = 'consumer_data_nj'; 
        }
        // let tableName ='';
        // if(req.body.location != undefined && req.body.location != ''){
        //     if(req.body.location == 'US-NJ'){
        //         tableName = 'consumer_data_nj';
        //     }else if(req.body.location == 'US-IL'){
        //         tableName = 'consumer_data_il';
        //     }else if(req.body.location == 'US-CA'){
        //         tableName = 'consumer_data_ca';
        //     }else if(req.body.location == 'US-CT'){
        //         tableName = 'consumer_data_ct';
        //     }else if(req.body.location == 'US-MA'){
        //         tableName = 'consumer_data_ma';
        //     }else if(req.body.location == 'US-NY'){
        //         tableName = 'consumer_data_ny';
        //     }else if(req.body.location == 'US-RI'){
        //         tableName = 'consumer_data_ri';
        //     }else if(req.body.location == 'US-NV'){
        //         tableName = 'consumer_data_nv';
        //     }else if(req.body.location == 'US-AZ'){
        //         tableName = 'consumer_data_az';
        //     }else if(req.body.location == 'US-TX'){
        //         tableName = 'consumer_data_tx';
        //     }else{
        //         tableName = 'consumer_data_nj';
        //     }
        // }else{
        //     tableName = 'consumer_data_nj';
        // }


        let dealer_id = req.decoded.dealer_id;
        if (!req.body.residential_id) {
            req.response.message = "Location is required.";
            next();
        } else {
            user.getLocationHistory(req.body.residential_id, req.response.data.details.latitude,req.response.data.details.longitude,tableName,dealer_id)
            .then((result) => {
                req.response.status = true;
                if(result.length != 0)
                    req.response.data.history = result;
                else
                    req.response.data.history = [];
                //req.response.message = "Success";
                next();
            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
        }
       
    },


    getAreaHistory(req, res, next){
        let tableName = '';
        if(req.body.location != undefined && req.body.location != ''){
            if(consumerTableArray[req.body.location] != '' && consumerTableArray[req.body.location] != undefined){
                tableName = consumerTableArray[req.body.location];
            }else{
                tableName = 'consumer_data_nj';
            }
        }else{
            tableName = 'consumer_data_nj'; 
        }
        // let tableName ='';
        // if(req.body.location != undefined && req.body.location != ''){
        //     if(req.body.location == 'US-NJ'){
        //         tableName = 'consumer_data_nj';
        //     }else if(req.body.location == 'US-IL'){
        //         tableName = 'consumer_data_il';
        //     }else if(req.body.location == 'US-CA'){
        //         tableName = 'consumer_data_ca';
        //     }else if(req.body.location == 'US-CT'){
        //         tableName = 'consumer_data_ct';
        //     }else if(req.body.location == 'US-MA'){
        //         tableName = 'consumer_data_ma';
        //     }else if(req.body.location == 'US-NY'){
        //         tableName = 'consumer_data_ny';
        //     }else if(req.body.location == 'US-RI'){
        //         tableName = 'consumer_data_ri';
        //     }else if(req.body.location == 'US-NV'){
        //         tableName = 'consumer_data_nv';
        //     }else if(req.body.location == 'US-AZ'){
        //         tableName = 'consumer_data_az';
        //     }else if(req.body.location == 'US-TX'){
        //         tableName = 'consumer_data_tx';
        //     }else{
        //         tableName = 'consumer_data_nj';
        //     }
        // }else{
        //     tableName = 'consumer_data_nj';
        // }
      
        if (!req.body.area_id) {
            req.response.status = false;
            req.response.message = "Area is required.";
            next();
        } else {
            user.getAreaHistory(req.body.area_id,tableName ,req.decoded.dealer_id)
            .then((result) => {
                req.response.status = true;
                if(result.length != 0)
                    req.response.data.history = result;
                else
                    req.response.data.history = [];
                req.response.message = "Success";
                next();
            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
        }
       
    },

    getOwnerInfo(req, res, next){
        
      
        if (!req.body.area_id) {
            next();
        } else {
            user.getOwnerInfo(req.body.area_id)
            .then((result) => {
                req.response.status = true;
                if(result.length != 0)
                    req.response.data.owner = result[0];
                else
                    req.response.data.owner = [];
                req.response.message = "Success";
                next();
            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
        }
       
    },


    // getUserInfo(req, res, next){
    //     if (req.decoded.user_id) {
    //         user.getUserInfo(req.decoded.user_id)
    //         .then((result) => {
    //            
    //             if(result[0].area_coordinates != '' && result[0].area_coordinates != null ){
    //                 let area_coordinates = result[0].area_coordinates;
    //                 result[0].area_coordinates = JSON.parse(result[0].area_coordinates)[0];
    //                 //result[0].area_coordinates1 = area_coordinates;
    //                 //result[0].area_coordinates2 =  JSON.parse(area_coordinates);
    //                 req.response.status = true;
    //                 req.response.data = result[0];
    //                 req.response.message = "Success";
    //                 next();
    //             }else{
                    
    //                 result[0].area_coordinates = [];
    //                 req.response.status = true;
    //                 req.response.data = result[0];
    //                 req.response.message = "Success";
    //                 next();
    //             }
                
                
    //         }).catch((err) => {
    //            
    //             req.response.message = "Oops! something went wrong.";
    //             next();
    //         })
    //     } else {
    //         req.response.message = "Oops! something went wrong.";
    //         next();
    //     }
    // },
    getSalesRepDetails(req, res, next){
        if (req.decoded.user_id) {
            user.getUserInfo(req.body.user_id)
            .then((result) => {
                if(result[0].area_coordinates != '' && result[0].area_coordinates != null ){
                    result[0].area_coordinates = JSON.parse(result[0].area_coordinates)[0];
                }else{
                    result[0].area_coordinates = [];
                }
                
                req.response.status = true;
                req.response.data = result[0];
                req.response.message = "Success";
                next();
            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },



    updateToMongo(req, res, next){
        let tableName = '';
        if(req.body.location != undefined && req.body.location != ''){
            if(residentialTableArray[req.body.location] != '' && residentialTableArray[req.body.location] != undefined){
                tableName = residentialTableArray[req.body.location];
            }else{
                tableName = 'residential_data_nj';
            }
        }else{
            tableName = 'residential_data_nj'; 
        }

      
        // let tableName ='';
        // if(req.body.location != undefined && req.body.location != ''){
        //     if(req.body.location == 'US-NJ' ){
        //         tableName = 'residential_data_nj';
        //     }else if(req.body.location == 'US-IL'){
        //         tableName = 'residential_data_il';
        //     }else if(req.body.location == 'US-CA'){
        //         tableName = 'residential_data_ca';
        //     }else if(req.body.location == 'US-CT'){
        //         tableName = 'residential_data_ct';
        //     }else if(req.body.location == 'US-MA'){
        //         tableName = 'residential_data_ma';
        //     }else if(req.body.location == 'US-NY'){
        //         tableName = 'residential_data_ny';
        //     }else if(req.body.location == 'US-RI'){
        //         tableName = 'residential_data_ri';
        //     }else if(req.body.location == 'US-NV'){
        //         tableName = 'residential_data_nv';
        //     }else if(req.body.location == 'US-AZ'){
        //         tableName = 'residential_data_az';
        //     }else if(req.body.location == 'US-TX'){
        //         tableName = 'residential_data_tx';
        //     }else{
        //         tableName = 'residential_data_nj';
        //     }
        // }else{
        //     tableName = 'residential_data_nj';
        // }

        let dealerID = req.decoded.dealer_id;
        
       
        MongoClient.connect( mongourl ,{ useNewUrlParser: true }, function(err, client) {
            assert.equal(null, err);
            const db = client.db(dbName);
            const collection = db.collection(tableName);
            functions.get('customer_status_types', { id : req.body.status_type} )
            .then((respo) => {
              
                var myquery = { 'properties.consumer_id': parseInt(req.body.residential_id )};
              
                let field = {'type': respo[0].type, 'icon':  respo[0].icon, 'status': req.body.status_type }; 
                var newvalues = { $set: { ['properties.dealer_'+dealerID ] :  field  } };
                //var newvalues = { $set: { 'properties.type': respo[0].type, 'properties.icon':  respo[0].icon, 'properties.status': req.body.status_type } };
                collection.updateOne( myquery , newvalues ,function(err, res) {
                    if (err) throw err;
                });
                //req.response.data = respo;
                req.response.status = true;
                req.response.message = "Status changed successfully";
                next();
            }).catch((err) => {
                req.response.message = "Oops! something went wrong."+err;
                next();
            })
            
        });

    },

    updateToMongoFromOpp(req, res, next){
        if(req.response.status == true){
            let tableName = '';
            if(req.body.location != undefined && req.body.location != ''){
                if(residentialTableArray[req.body.location] != '' && residentialTableArray[req.body.location] != undefined){
                    tableName = residentialTableArray[req.body.location];
                }else{
                    tableName = 'residential_data_nj';
                }
            }else{
                tableName = 'residential_data_nj'; 
            }

            // let tableName ='';
            // if(req.body.location != undefined && req.body.location != ''){
            //     if(req.body.location == 'US-NJ'){
            //         tableName = 'residential_data_nj';
            //     }else if(req.body.location == 'US-IL'){
            //         tableName = 'residential_data_il';
            //     }else if(req.body.location == 'US-CA'){
            //         tableName = 'residential_data_ca';
            //     }else if(req.body.location == 'US-CT'){
            //         tableName = 'residential_data_ct';
            //     }else if(req.body.location == 'US-MA'){
            //         tableName = 'residential_data_ma';
            //     }else if(req.body.location == 'US-NY'){
            //         tableName = 'residential_data_ny';
            //     }else if(req.body.location == 'US-RI'){
            //         tableName = 'residential_data_ri';
            //     }else if(req.body.location == 'US-NV'){
            //         tableName = 'residential_data_nv';
            //     }else if(req.body.location == 'US-AZ'){
            //         tableName = 'residential_data_az';
            //     }else if(req.body.location == 'US-TX'){
            //         tableName = 'residential_data_tx';
            //     }else{
            //         tableName = 'residential_data_nj';
            //     }
            // }else{
            //     tableName = 'residential_data_nj';
            // }

            let dealerID = req.decoded.dealer_id;
        
            MongoClient.connect( mongourl ,{ useNewUrlParser: true }, function(err, client) {
                assert.equal(null, err);
                const db = client.db(dbName);
                const collection = db.collection(tableName);
                functions.get('customer_status_types', { id : req.body.customer.status_type} )
                .then((respo) => {
                    var myquery = { 'properties.consumer_id': parseInt(req.body.customer.residential_id) };
                    //var myquery = { 'properties.id': req.body.residential_id };
                    let array = [];
                    let vaal = "dealer."+dealerID;
                    let field = {'type': respo[0].type, 'icon':  respo[0].icon, 'status': req.body.customer.status_type }; 
                    var newvalues = { $set: { ['properties.dealer_'+dealerID] :  field  } };
                    //var newvalues = { $set: { 'properties.type': respo[0].type, 'properties.icon':  respo[0].icon, 'properties.status': req.body.status_type } };
                    collection.updateOne( myquery , newvalues ,function(err, res) {
                        if (err) throw err;
                    
                    
                    });
                    //req.response.data = respo;
                    req.response.status = true;
                    req.response.message = "Opportunity added successfully.";
                    next();
                }).catch((err) => {
                    req.response.message = "Oops! something went wrong.";
                    next();
                })
                
            });
        }else{
           
            next();
        }

    },
    
    getNearestLocations(req, res, next){
        // Use connect method to connect to the server
        let tableName = '';
        if(req.body.location != undefined && req.body.location != ''){
            if(residentialTableArray[req.body.location] != '' && residentialTableArray[req.body.location] != undefined){
                tableName = residentialTableArray[req.body.location];
            }else{
                tableName = 'residential_data_nj';
            }
        }else{
            tableName = 'residential_data_nj'; 
        }
        // let tableName ='';
        // if(req.body.location != undefined && req.body.location != ''){
        //     if(req.body.location == 'US-NJ'){
        //         tableName = 'residential_data_nj';
        //     }else if(req.body.location == 'US-IL'){
        //         tableName = 'residential_data_il';
        //     }else if(req.body.location == 'US-CA'){
        //         tableName = 'residential_data_ca';
        //     }else if(req.body.location == 'US-CT'){
        //         tableName = 'residential_data_ct';
        //     }else if(req.body.location == 'US-MA'){
        //         tableName = 'residential_data_ma';
        //     }else if(req.body.location == 'US-NY'){
        //         tableName = 'residential_data_ny';
        //     }else if(req.body.location == 'US-RI'){
        //         tableName = 'residential_data_ri';
        //     }else if(req.body.location == 'US-NV'){
        //         tableName = 'residential_data_nv';
        //     }else if(req.body.location == 'US-AZ'){
        //         tableName = 'residential_data_az';
        //     }else if(req.body.location == 'US-TX'){
        //         tableName = 'residential_data_tx';
        //     }else{
        //         tableName = 'residential_data_nj';
        //     }
        // }else{
        //     tableName = 'residential_data_nj';
        // }

        let distance = parseInt(process.env.DISTANCE);
       
        
        let dealerID = req.decoded.dealer_id;
        MongoClient.connect(mongourl,{ useNewUrlParser: true }, function(err, client) {
           
            assert.equal(null, err);
            const db = client.db(dbName);
            const collection = db.collection(tableName);
            collection.createIndex({ geometry: "2dsphere" });
            collection.find(
                {
                    geometry:
                    { 
                       $near:
                       {
                         $geometry: { type: "Point",  coordinates: [parseFloat(req.body.longitude),parseFloat(req.body.latitude)] },
                         $maxDistance: distance
                       }
                    },
                    $or: [{
                            'properties.dealer_id': {
                                    $eq: req.decoded.dealer_id
                            }
                        },
                        {
                            'properties.dealer_id': {
                                $exists: false
                            }
                        },
                    	{
                            'properties.dealer_id': {
                                    $eq: 0
                            }
                    }	],
                },
                { projection: {  type : 1, geometry : 1 ,'properties.multiple': 1, 'properties.consumer_id':1,'properties.Latitude': 1, 'properties.icon':1,'properties.status':1, 'properties.Longitude':1, dealer : 1,
               
                [ 'properties.dealer_'+dealerID+'.icon' ]: 1,[ 'properties.dealer_'+dealerID+'.status' ]: 1 , _id : 0 } }
             ).toArray(function(err, docs) {
                let rsp = {}
                let resdata = {};
                rsp.status = true;
                resdata.type = 'FeatureCollection';
                resdata.features = docs;
                rsp.message = "Success";
                res.writeHead(200, {'Content-Type': 'application/json', 'Content-Encoding': 'gzip'}); 
                rsp.data = resdata;
                zlib.gzip(JSON.stringify(rsp), function (_, result){  res.end(result);
               
                });
               
                // let rsp = {}
                // let resdata = {};
                // req.response.status = true;
                // resdata.type = 'FeatureCollection';
                // resdata.features = docs;
                // req.response.data = resdata;
               
                
               
                // req.response.message = "Success";
                // next();
                
            })
        });
    },
    //------------------------
    checkLatLong(req, res, next){
        
        req.response.isAvailable = false;
        if (req.decoded.user_id) {
            if (!req.body.latitude) {
                req.response.message = "Latitude is required.";
                next();
            } else {
                user.getDistance(req.body.latitude,req.body.longitude,req.decoded.user_id)
                .then((result) => {
                   
                    if (result.length > 0) {
                   
                        if(result[0].distance >= 0.5 ){
                   
                            let array2 = { latitude : req.body.latitude ,longitude : req.body.longitude};
                            functions.update('user_latlng_log', array2 ,  { user_id: req.decoded.user_id } )
                            .then((respo) => {
                            })
                            req.response.isAvailable = true;
                            next();
                        }else{
                            next();
                        }
                        
                    }else{
                        req.response.isAvailable = true;
                        let array = { user_id : req.decoded.user_id, latitude : req.body.latitude ,longitude : req.body.longitude};
                        functions.insert('user_latlng_log', array )
                        .then((respo) => {
                        })
                        next();
                    }
                });
            }

        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }

    },

    getLocationDetailsnew(req, res, next){
      
        let tableName = '';
        if(req.body.location != undefined && req.body.location != ''){
            if(consumerTableArray[req.body.location] != '' && consumerTableArray[req.body.location] != undefined){
                tableName = consumerTableArray[req.body.location];
            }else{
                tableName = 'consumer_data_nj';
            }
        }else{
            tableName = 'consumer_data_nj'; 
        }
        // let tableName ='';
        // if(req.body.location != undefined && req.body.location != ''){
        //     if(req.body.location == 'US-NJ'){
        //         tableName = 'consumer_data_nj';
        //     }else if(req.body.location == 'US-IL'){
        //         tableName = 'consumer_data_il';
        //     }else if(req.body.location == 'US-CA'){
        //         tableName = 'consumer_data_ca';
        //     }else if(req.body.location == 'US-CT'){
        //         tableName = 'consumer_data_ct';
        //     }else if(req.body.location == 'US-MA'){
        //         tableName = 'consumer_data_ma';
        //     }else if(req.body.location == 'US-NY'){
        //         tableName = 'consumer_data_ny';
        //     }else if(req.body.location == 'US-RI'){
        //         tableName = 'consumer_data_ri';
        //     }else if(req.body.location == 'US-NV'){
        //         tableName = 'consumer_data_nv';
        //     }else if(req.body.location == 'US-AZ'){
        //         tableName = 'consumer_data_az';
        //     }else if(req.body.location == 'US-TX'){
        //         tableName = 'consumer_data_tx';
        //     }else{
        //         tableName = 'consumer_data_nj';
        //     }
        // }else{
        //     tableName = 'consumer_data_nj';
        // }
       
      
        if (!req.body.residential_id) {
            req.response.message = "Location is required.";
            next();
        } else {
            user.getLocationDetails(req.body.residential_id,tableName,req.decoded.dealer_id)
            .then((result) => {
                if(result.length > 0){
                    req.response.data = {};
                    req.response.status = true;
                    req.response.data.details = result[0];
                }else{
                    req.response.data = {};
                    req.response.status = true; 
                }
                    
                next();
            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
        }
    },

    // getLocationDetailsnew(req, res, next){
    //     if (!req.body.residential_id) {
    //         req.response.message = "Location is required.";
    //         next();
    //     } else {
    //         MongoClient.connect(mongourl,{ useNewUrlParser: true }, function(err, client) {
    //             assert.equal(null, err);
                
    //             const db = client.db(dbName);
    //             const collection = db.collection('residential_data_nj');

    //             collection.findOne({ 'properties.consumer_id' : parseInt(req.body.residential_id)}, function(err, docs) {
    //                 console.log(err);
    //                 if (err) throw err;
                    
    //                 docs.properties.address_line1 = docs.properties.Address;
    //                 docs.properties.city = docs.properties.City;
    //                 docs.properties.state = docs.properties.State; 
    //                 docs.properties.zip_code = docs.properties.ZIP_Code ;
    //                 req.response.data = {};
    //                 req.response.status = true;
    //                 req.response.data.details = docs.properties;
    //                 req.response.message = "Success";
    //                 next();
    //                 //db.close();
    //               });
    //             // collection.findOne( {"properties.id": req.body.residential_id}).toArray(function(err, docs) {
    //             //     req.response.data = {};
    //             //     req.response.status = true;
    //             //     req.response.data.details = docs;
    //             //     req.response.message = "Success";
    //             //     next();
    //             // })
    //          })
    //     }
    // },


    deleteAreaCoordinates(req, res, next){
        if (req.decoded.user_id) {
            functions.delete('manager_regions', { area_id: req.body.area_id })
            .then((resu) => {
                req.response.status = true;
                req.response.message = "Area deleted successfully.";
                next();
            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },

    saveAreaCoordinates(req, res, next){
       
        
        if(req.body.area_coordinates == ''){
            req.response.message = "Area coordinates required.";
            next();
        }else{
            if (req.decoded.user_id) {
                user.getUserCoordinates(req.decoded.user_id)
                .then((result) => {
                   
                    if(req.body.area_id != '' && req.body.area_id != undefined && req.body.area_id != null){
                        let array = { 
                            area_coordinates: req.body.area_coordinates,
                            
                        };
                        functions.update('manager_regions', array ,  { area_id: req.body.area_id  } )
                        .then((respo) => {
                            req.response.data = req.body.area_id;
                            req.response.status = true;
                            req.response.message = "Success";
                            next();
                        })
                    }else{
                        let array2 = { 
                            manager_id :req.decoded.user_id,
                            area_coordinates: req.body.area_coordinates,
                            area_name : req.body.area_name  
                        };
                        functions.insert('manager_regions', array2 )
                        .then((respo) => {

                            //-----------------------
                            let analyarray = { 
                                'dealer_id':req.decoded.dealer_id,
                                'user_id' : req.decoded.user_id,
                                'action_type' : 'create_new_area',
                                'new_value' : array2,
                                'action_file':  ''
                            }
                            if(req.headers['source'] != '' && req.headers['source'] != undefined){
                                analyarray['platform'] = 'prospect_web';
                            }else{
                                analyarray['platform'] = 'prospect_ios';
                            }
                            request.post({
                                headers: {'content-type' : 'application/json'},
                                url:     process.env.ANLYTICSURL,
                                body:    JSON.stringify(analyarray)
                            }, function(error, response, body){                                
                            });
                            //-----------------------


                            let insVal = '';
                            if(result.length > 0){
                                insVal = result[0].area_id.concat(','+respo.insertId);
                                let areaArray = { area_id : insVal };
                                // functions.update('sales_rep_regions', areaArray ,  { user_id: req.decoded.user_id  } )
                                // .then((resppp) => {
                                    req.response.data = respo.insertId;
                                    req.response.status = true;
                                    req.response.message = "Success";
                                    next();
                                //})
                            }else{
                                insVal = respo.insertId;
                                
                                let areaArray2 = { 
                                    dealer_id : req.decoded.dealer_id,
                                    user_id : req.decoded.user_id,
                                    manager_id : req.decoded.user_id,
                                    area_id : insVal,
                                    created_at:  moment().format("YYYY-MM-DD H:mm:ss")
                                };

                                // functions.insert('sales_rep_regions', areaArray2)
                                // .then((resppp) => {
                                    req.response.data = respo.insertId;
                                    req.response.status = true;
                                    req.response.message = "Success";
                                    next();
                                //})
                            }
                            
                        })
                    }
                }).catch((err) => {
                    req.response.message = "Oops! something went wrong.";
                    next();
                })
            } else {
                req.response.message = "Oops! something went wrong.";
                next();
            }
        }
        
    },

    saveResidentiaInArea(req, res, next){

        let tableName = '';
        if(req.body.location != undefined && req.body.location != ''){
            if(residentialTableArray[req.body.location] != '' && residentialTableArray[req.body.location] != undefined){
                tableName = residentialTableArray[req.body.location];
            }else{
                tableName = 'residential_data_nj';
            }
        }else{
            tableName = 'residential_data_nj'; 
        }

        // let tableName ='';
        // if(req.body.location != undefined && req.body.location != ''){
        //     if(req.body.location == 'US-NJ'){
        //         tableName = 'residential_data_nj';
        //     }else if(req.body.location == 'US-IL'){
        //         tableName = 'residential_data_il';
        //     }else if(req.body.location == 'US-CA'){
        //         tableName = 'residential_data_ca';
        //     }else if(req.body.location == 'US-CT'){
        //         tableName = 'residential_data_ct';
        //     }else if(req.body.location == 'US-MA'){
        //         tableName = 'residential_data_ma';
        //     }else if(req.body.location == 'US-NY'){
        //         tableName = 'residential_data_ny';
        //     }else if(req.body.location == 'US-RI'){
        //         tableName = 'residential_data_ri';
        //     }else if(req.body.location == 'US-NV'){
        //         tableName = 'residential_data_nv';
        //     }else if(req.body.location == 'US-AZ'){
        //         tableName = 'residential_data_az';
        //     }else if(req.body.location == 'US-TX'){
        //         tableName = 'residential_data_tx';
        //     }else{
        //         tableName = 'residential_data_nj';
        //     }
        // }else{
        //     tableName = 'residential_data_nj';
        // }
        
        let area_coordinates = JSON.parse(req.body.area_coordinates);
       
        let areaID = req.body.area_id;
        MongoClient.connect(mongourl,{ useNewUrlParser: true }, function(err, client) {
            assert.equal(null, err);
            const db = client.db(dbName);
            const collection = db.collection(tableName);
            collection.find(
                {
                    geometry:
                    { $geoWithin:
                       {
                         $geometry: { type: "Polygon",  coordinates: area_coordinates }
                       }
                    }
                }
             ).toArray(function(err, docs) {
           
                functions.get('residential_in_area', { area_id : areaID} )
                .then((resp) => {

                    const getData = async (results) => {
                        let retArray = [];
                        for (const num of docs) {
                            obj = await returnData(num);
                            //num.area_coordinates = obj;
                            retArray.push(obj);
                        }
                        var newArray = retArray.join();
                        return newArray;
                    }
                    const returnData = details => {
                        return new Promise((resolve, reject) => {
                            resolve(details.properties.consumer_id);
                        })
                    }
                    getData(docs).then((respo) => {
                        if(resp.length > 0){
                            updateArray = { 
                                residential_id : respo , 
                                user_id : req.decoded.user_id,
                                created_at : moment().format("YYYY-MM-DD H:mm:ss")
                            };
                            functions.update('residential_in_area', updateArray  ,  { area_id: areaID } )
                            .then((respo) => {
                            })
                        }else{
                            insArray = { 
                                area_id : areaID , 
                                residential_id : respo , 
                                user_id : req.decoded.user_id,
                                created_at : moment().format("YYYY-MM-DD H:mm:ss")
                            };
                            functions.insert('residential_in_area', insArray  )
                            .then((respo) => {
                            })
                        }
                        req.response.status = true;
                        req.response.message = "Success";
                        next();
                    })
                
                    
                    
                    
                    
                    
                    
                   
                })
                //req.response.data = docs;
               
                
            })
        });
        
        
        
    },

    

    getSaleRepLists(req, res, next){
        if (req.decoded.user_id) {
            //if( (req.body.office_id != '' && req.body.office_id != undefined) || (req.decoded.user_type == 3 )){
                user.getSaleRepLists(req.body.office_id,req.body.division_id,req.body.region_id,req.decoded.user_type,req.decoded.dealer_id)
                .then((result) => {
                    const getData = async (results) => {
                        let retArray = [];
                        for (const num of results) {
                            obj = await returnData(num);
                            retArray.push(obj);
                        }
                        return retArray;
                    }
                    const returnData = details => {
                        return new Promise((resolve, reject) => {
                            if(details.area_coordinates != null && details.area_coordinates != undefined && details.area_coordinates != ''){
                                details.area_coordinates = JSON.parse(details.area_coordinates)[0];
                            }
                            resolve(details);
                        })
                    }
                    getData(result).then((respo) => {
                        req.response.status = true;
                        req.response.data = respo;
                        req.response.message = "Success";
                        next();
                    })
                }).catch((err) => {
                    req.response.message = "Oops! something went wrong.";
                    next();
                })
            // }else{
            //     req.response.status = true;
            //     req.response.data = [];
            //     req.response.message = "Success";
            //     next();
            // }
            
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },

    getAllSaleRepLists(req, res, next){
        if (req.decoded.user_id) {
            if( (req.body.office_id != '' && req.body.office_id != undefined) || (req.decoded.user_type == 3 )){
                user.getAllSaleRepLists(req.body.office_id,req.body.division_id,req.body.region_id,req.decoded.user_type,req.decoded.dealer_id)
                .then((result) => {
                    const getData = async (results) => {
                        let retArray = [];
                        for (const num of results) {
                            obj = await returnData(num);
                            retArray.push(obj);
                        }
                        return retArray;
                    }
                    const returnData = details => {
                        return new Promise((resolve, reject) => {
                            if(details.area_coordinates != null && details.area_coordinates != undefined && details.area_coordinates != ''){
                                details.area_coordinates = JSON.parse(details.area_coordinates)[0];
                            }
                            resolve(details);
                        })
                    }
                    getData(result).then((respo) => {
                        req.response.status = true;
                        req.response.data = respo;
                        req.response.message = "Success";
                        next();
                    })
                }).catch((err) => {
                    req.response.message = "Oops! something went wrong.";
                    next();
                })
            }else{
                req.response.status = true;
                req.response.data = [];
                req.response.message = "Success";
                next();
            }
            
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },


    
    saveUserLatLng(req, res, next){
        if (req.decoded.user_id) {
            let array = { 
                latitude : req.body.latitude ,
                longitude: req.body.longitude 
            };
            functions.update('residential_data_master', array ,  { residential_id: req.body.residential_id } )
            .then((respo) => {
                req.response.status = true;
                req.response.message = "Success";
                next();
            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
            
            
    
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },

    getStatusTypes(req, res, next){
        if (req.decoded.user_id) {
            
            functions.get('customer_status_types', {} )
            .then((respo) => {
                req.response.data = respo;
                req.response.status = true;
                req.response.message = "Success";
                next();
            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },
    getFormBlocks(req, res, next){

        //let fulfilment_partner_id =  2;
        let fulfilment_partner_id =  req.body.fulfilment_partner_id;
        
        if (req.decoded.user_id) {
            user.getFormBlocks(fulfilment_partner_id)
            .then((result) => {
                const getData = async (results) => {
                    let resultObj = {'block_data': '' , 'fields' : ''};
                    let retArray = [];
                    let obj = '';
                    for (const num of results) {
                        obj = await returnData(num);
                        resultObj = {'block_data': num , 'fields' : obj};
                        retArray.push(resultObj);
                    }
                    return retArray;
                }
                const returnData = details => {
                    return new Promise((resolve, reject) => {
                        user.getOpportunityFields(details.block_id)
                        .then((resp) => {
                           
                            resolve(resp);
                        }).catch((err) => {
                            req.response.message = "Oops! something went wrong.";
                            next();
                        })
                    })
                }
                getData(result).then((respo) => {
                    req.response.data = respo;
                    req.response.blocks = result;
                    req.response.status = true;
                    req.response.message = "Success";
                    next();
                })

            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },

    getParseFormBlocks(req, res, next){
        
       
        if (req.decoded.user_id) {
                const getData = async (results) => {
                    let retArray = [];
                    for (const num of results) {
                        for (var i =0; i < num.fields.length;i++ ) {
                            obj = await returnData(num.fields[i]);
                           
                            if(obj.link_key == 'first_name'){
                                if(req.body.residential_id.first_name != '' && req.body.residential_id.first_name != undefined){
                                    obj.value = req.body.residential_id.first_name;
                                }
                            }
                            if(obj.link_key == 'last_name'){
                                if(req.body.residential_id.last_name != '' && req.body.residential_id.last_name != undefined){
                                    obj.value = req.body.residential_id.last_name;
                                }
                            }
                            if(obj.link_key == 'phone_number'){
                                if(req.body.residential_id.phone_number != '' && req.body.residential_id.phone_number != undefined){
                                    obj.value = req.body.residential_id.phone_number;
                                }
                            }
                            if(obj.link_key == 'email'){
                                if(req.body.residential_id.email != '' && req.body.residential_id.email != undefined){
                                    obj.value = req.body.residential_id.email;
                                }
                            }
                            if(obj.link_key == 'secondary_phone_number'){
                                if(req.body.residential_id.secondary_phone_number != '' && req.body.residential_id.secondary_phone_number != undefined){
                                    obj.value = req.body.residential_id.secondary_phone_number;
                                }
                            }
                            if(obj.link_key == 'address'){
                                if(req.body.residential_id.address != '' && req.body.residential_id.address != undefined){
                                    obj.value = req.body.residential_id.address;
                                }
                            }
                            if(obj.link_key == 'city'){
                                if(req.body.residential_id.city != '' && req.body.residential_id.city != undefined){
                                    obj.value = req.body.residential_id.city;
                                }
                            }
                            if(obj.link_key == 'state'){
                                if(req.body.residential_id.state != '' && req.body.residential_id.state != undefined){
                                    obj.value = req.body.residential_id.state;
                                }
                            }
                            if(obj.link_key == 'zipcode'){
                                if(req.body.residential_id.zipcode != '' && req.body.residential_id.zipcode != undefined){
                                    obj.value = req.body.residential_id.zipcode;
                                }
                            }
                            //console.log(obj);
                            ///obj.value = 'sds';
                            if(obj.unsetField == 'N'){
                                num.fields.splice(i, 1);
                                //delete num.fields[i];
                            }else{
                                num.fields.field_options = obj;
                            }
                           
                        }
                       
                        retArray.push(num);
                      
                       
                    }
                    return retArray;
                }
                const returnData = details => {
                    return new Promise((resolve, reject) => {
                        if(details.field_options != null && details.field_options != undefined && details.field_options != ''){
                            details.field_options = JSON.parse(details.field_options);
                        }
                        if(details.link_key == 'is_touch_points_enabled'){
                           
                            functions.get('dealer_master', {"dealer_id": req.decoded.dealer_id})
                            .then((ressss) => {
                                
                                let dealer_info = ressss[0];
                                if (dealer_info['customer_touch_points_enabled'] == 'N') {
                                    details.unsetField = 'N';
                                }else{
                                    details.unsetField = 'Y';
                                }
                                resolve(details);
                                
                            });
                               
                        }else{
                            resolve(details);
                        }
                        
                        
                    })
                }
                getData(req.response.data).then((respo) => {
                   
                    req.response.data = respo;
                    req.response.status = true;
                    req.response.message = "Success";
                    next();
                })
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },
    addAddress(req, res, next){
        let tableName = '';
        if(req.body.location != undefined && req.body.location != ''){
            if(consumerTableArray[req.body.location] != '' && consumerTableArray[req.body.location] != undefined){
                tableName = consumerTableArray[req.body.location];
            }else{
                tableName = 'consumer_data_nj';
            }
        }else{
            tableName = 'consumer_data_nj'; 
        }
        // let tableName ='';
        // if(req.body.location != undefined && req.body.location != ''){
        //     if(req.body.location == 'US-NJ'){
        //         tableName = 'consumer_data_nj';
        //     }else if(req.body.location == 'US-IL'){
        //         tableName = 'consumer_data_il';
        //     }else if(req.body.location == 'US-CA'){
        //         tableName = 'consumer_data_ca';
        //     }else if(req.body.location == 'US-CT'){
        //         tableName = 'consumer_data_ct';
        //     }else if(req.body.location == 'US-MA'){
        //         tableName = 'consumer_data_ma';
        //     }else if(req.body.location == 'US-NY'){
        //         tableName = 'consumer_data_ny';
        //     }else if(req.body.location == 'US-RI'){
        //         tableName = 'consumer_data_ri';
        //     }else if(req.body.location == 'US-NV'){
        //         tableName = 'consumer_data_nv';
        //     }else if(req.body.location == 'US-AZ'){
        //         tableName = 'consumer_data_az';
        //     }else if(req.body.location == 'US-TX'){
        //         tableName = 'consumer_data_tx';
        //     }else{
        //         tableName = 'consumer_data_nj';
        //     }
        // }else{
        //     tableName = 'consumer_data_nj';
        // }

       
        if (req.decoded.user_id) {
            let insArray = {
                Address : req.body.address,
                City : req.body.city,
                ZIP_Code : req.body.zip,
                State : req.body.state,
                First_Name : req.body.first_name,
                Last_Name : req.body.last_name,
                Latitude : req.body.latitude,
                Longitude : req.body.longitude,
                dealer_id : req.decoded.dealer_id,
            };
           
            functions.insert( tableName , insArray )
            .then((respo) => {

                //-----------------------
                let analyarray = { 
                    'dealer_id':req.decoded.dealer_id,
                    'user_id' : req.decoded.user_id,
                    'action_type' : 'add_new_address',
                    'new_value' : insArray,
                    'action_file':  ''
                }
                if(req.headers['source'] != '' && req.headers['source'] != undefined){
                    analyarray['platform'] = 'prospect_web';
                }else{
                    analyarray['platform'] = 'prospect_ios';
                }
                request.post({
                    headers: {'content-type' : 'application/json'},
                    url:     process.env.ANLYTICSURL,
                    body:    JSON.stringify(analyarray)
                }, function(error, response, body){                                
                });
                //-----------------------

              
                req.response.data = {};
                req.response.data.residential_id = respo.insertId;
                req.response.status = true;
                req.response.message = "New Address Added Successfully.";
                next();
            }).catch((err) => {
               
                req.response.message = "Oops! something went wrong."+err;
                next();
            })
        } else {
          
            req.response.message = "Oops! something went wrong."+err;
            next();
        }
    },
    addToMongo(req, res, next) {
        let tableName = '';
        if(req.body.location != undefined && req.body.location != ''){
            if(residentialTableArray[req.body.location] != '' && residentialTableArray[req.body.location] != undefined){
                tableName = residentialTableArray[req.body.location];
            }else{
                tableName = 'residential_data_nj';
            }
        }else{
            tableName = 'residential_data_nj'; 
        }
        
        // let tableName ='';
        // if(req.body.location != undefined && req.body.location != ''){
        //     if(req.body.location == 'US-NJ'){
        //         tableName = 'residential_data_nj';
        //     }else if(req.body.location == 'US-IL'){
        //         tableName = 'residential_data_il';
        //     }else if(req.body.location == 'US-CA'){
        //         tableName = 'residential_data_ca';
        //     }else if(req.body.location == 'US-CT'){
        //         tableName = 'residential_data_ct';
        //     }else if(req.body.location == 'US-MA'){
        //         tableName = 'residential_data_ma';
        //     }else if(req.body.location == 'US-NY'){
        //         tableName = 'residential_data_ny';
        //     }else if(req.body.location == 'US-RI'){
        //         tableName = 'residential_data_ri';
        //     }else if(req.body.location == 'US-NV'){
        //         tableName = 'residential_data_nv';
        //     }else if(req.body.location == 'US-AZ'){
        //         tableName = 'residential_data_az';
        //     }else if(req.body.location == 'US-TX'){
        //         tableName = 'residential_data_tx';
        //     }else{
        //         tableName = 'residential_data_nj';
        //     }
        // }else{
        //     tableName = 'residential_data_nj';
        // }



        let dealerID = req.decoded.dealer_id;

        let insArray = { type: "Feature", properties : {}, geometry : {  type :"Point", coordinates : [] }};
        let details = { 
            consumer_id : req.response.data.properties.consumer_id,
            Address : req.response.data.properties.address_line1 ,
            First_Name : req.response.data.properties.first_name,
            Last_Name : req.response.data.properties.last_name,
            City : req.response.data.properties.city,
            State : req.response.data.properties.state,
            ZIP_Code : req.response.data.properties.zip_code,
            Latitude : parseFloat(req.response.data.properties.latitude),
            Longitude : parseFloat(req.response.data.properties.longitude),
            status: 1,
            icon: 'notcontacted',
            dealer_id : req.decoded.dealer_id,
            ['dealer_'+dealerID] : {
                status: 1,
                icon: 'custom',
                type : 'Not Contacted'
            }
        };

        insArray.properties = details;
        insArray.geometry = req.response.data.geometry;
       

        MongoClient.connect(mongourl,{ useNewUrlParser: true }, function(err, client) {
            assert.equal(null, err);
            const db = client.db(dbName);
            const collection = db.collection(tableName);
            collection.insert(insArray);
            let details2 = {
                ['dealer_'+dealerID] : {
                    status: 1,
                    icon: 'custom',
                    type : 'Not Contacted'
                },
                consumer_id:req.response.data.properties.consumer_id,
                Latitude:req.response.data.properties.latitude,
                Longitude:req.response.data.properties.longitude,
                
            };
            req.response.data.properties = details2;
            next();
        });
        
            // const getData = async (result) => {
            //     let retArray = [];
            //     //for (const num of result) {
            //         retArray.push(await returnData(result[0]));
            //     //}
            //     return retArray;
            // }
            // const returnData = details => {
            //     let insArray = { type: "Feature", properties : {}, geometry : {  type :"Point", coordinates : [] }};
            //     return new Promise((resolve, reject) => {
            
                    
            //         insArray.properties = details;
            //         insArray.geometry.coordinates.push(parseFloat(details.longitude),parseFloat(details.latitude))
            //         resolve(insArray);
            //     });
            // }
            // getData(result).then((result) => {
           
            //     let arrayNew = {
            //         consumer_id : result.properties.consumer_id,
            //         Address : result.properties.address_line1 ,
            //         First_Name : result.properties.first_name,
            //         Last_Name : result.properties.last_name,
            //         City : result.properties.city,
            //         State : result.properties.state,
            //         ZIP_Code : result.properties.zip_code,
            //         Latitude : result.properties.latitude,
            //         Longitude : result.properties.longitude,
            //         status: 1,
            //         icon: 'notcontacted',
            //      };


            //     MongoClient.connect(mongourl,{ useNewUrlParser: true }, function(err, client) {
            //         assert.equal(null, err);
            //         const db = client.db(dbName);
            //         const collection = db.collection('residential_data_nj');
            //         collection.insert(result);
            //     });
               
            //     req.response.status = true;
            //     req.response.message = "Success";
            //     next();
            // })
           
        
    },

    getAddressDetailByID(req, res, next) {
        let tableName = '';
        if(req.body.location != undefined && req.body.location != ''){
            if(consumerTableArray[req.body.location] != '' && consumerTableArray[req.body.location] != undefined){
                tableName = consumerTableArray[req.body.location];
            }else{
                tableName = 'consumer_data_nj';
            }
        }else{
            tableName = 'consumer_data_nj'; 
        }
        // let tableName ='';
        // if(req.body.location != undefined && req.body.location != ''){
        //     if(req.body.location == 'US-NJ'){
        //         tableName = 'consumer_data_nj';
        //     }else if(req.body.location == 'US-IL'){
        //         tableName = 'consumer_data_il';
        //     }else if(req.body.location == 'US-CA'){
        //         tableName = 'consumer_data_ca';
        //     }else if(req.body.location == 'US-CT'){
        //         tableName = 'consumer_data_ct';
        //     }else if(req.body.location == 'US-MA'){
        //         tableName = 'consumer_data_ma';
        //     }else if(req.body.location == 'US-NY'){
        //         tableName = 'consumer_data_ny';
        //     }else if(req.body.location == 'US-RI'){
        //         tableName = 'consumer_data_ri';
        //     }else if(req.body.location == 'US-NV'){
        //         tableName = 'consumer_data_nv';
        //     }else if(req.body.location == 'US-AZ'){
        //         tableName = 'consumer_data_az';
        //     }else if(req.body.location == 'US-TX'){
        //         tableName = 'consumer_data_tx';
        //     }else{
        //         tableName = 'consumer_data_nj';
        //     }
        // }else{
        //     tableName = 'consumer_data_nj';
        // }
        
       
        user.getAddressDetailByID( req.response.data.residential_id, tableName )
        .then((result) => {
            const getData = async (result) => {
                let retArray = [];
                //for (const num of result) {
                    retArray.push(await returnData(result[0]));
                //}
                return retArray;
            }
            const returnData = details => {
                let insArray = { type: "Feature", properties : {}, geometry : {  type :"Point", coordinates : [] }};
                return new Promise((resolve, reject) => {
                    details.longitude = parseFloat(details.longitude); 
                    details.latitude = parseFloat(details.latitude);
                    insArray.properties = details;
                    insArray.geometry.coordinates.push(parseFloat(details.longitude),parseFloat(details.latitude))
                    resolve(insArray);
                });
            }
            getData(result).then((result) => {
                let resdata = {};
                req.response.status = true;
                resdata.features = result;
                req.response.data = result[0];
               // req.response.message = "Success";
                next();
            })
           
        }).catch((err) => {
            req.response.err = err;
            req.response.message = "Oops! something went wrong.";
            next();
        })
       
        
    },



  
    createCustomerAppoinment(req, res, next){
       
        if (req.decoded.user_id) {
            let insArray = {
                dealer_id : req.decoded.dealer_id,
                residential_id : req.body.residential_id,
                user_id : req.decoded.user_id,
                first_name : req.body.first_name,
                last_name : req.body.last_name,
                phone_number : req.body.phone_number,
                secondary_phone_number : req.body.secondary_phone_number,
                address : req.body.address,
                city : req.body.city,
                state : req.body.state,
                zipcode : req.body.zipcode,
                email : req.body.email,
                vertical_ids : 1,
                is_profile_completed : 'N',
                created_at : moment().format("YYYY-MM-DD H:mm:ss")
            };
           
            if(req.body.customer_id != '' && req.body.customer_id != undefined && req.body.customer_id != null){
                req.response.customer_id = req.body.customer_id;
                req.response.status = true;
                req.response.message = "Status changed successfully.";
                next();
            }else{
                functions.insert('customer_master', insArray )
                .then((respo) => {
                    functions.update('customer_master', { unique_id :md5(respo.insertId)}, { customer_id :respo.insertId })
                    .then(() => {
                    })
                    
                    let myListArray = {
                        user_id : req.decoded.user_id,
                        customer_id : respo.insertId,
                        created_at : moment().format("YYYY-MM-DD H:mm:ss")
                    };
                    req.response.customer_id = respo.insertId;
                    functions.insert('my_customer_list', myListArray )
                    .then(() => {
                    })
                    req.response.status = true;
                    req.response.message = "Status changed successfully.";
                    next();
                    
                }).catch((err) => {
                    req.response.message = "Oops! something went wrong.";
                    next();
                })
            }
            
            
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },

    createCustomer(req, res, next){
        
        
        if (req.decoded.user_id) {

            let insArray = {
                dealer_id : req.decoded.dealer_id,
                residential_id : req.body.residential_id,
                user_id : req.decoded.user_id,
                first_name : req.body.first_name,
                last_name : req.body.last_name,
                phone_number : req.body.phone_number,
                secondary_phone_number : req.body.secondary_phone_number,
                address : req.body.address,
                city : req.body.city,
                state : req.body.state,
                zipcode : req.body.zipcode,
                email : req.body.email,
                vertical_ids : 1,
                is_profile_completed : 'N',
                latitude : req.body.latitude,
                longitude : req.body.longitude,
                location : req.body.location,
                created_at : moment().utc().format("YYYY-MM-DD H:mm:ss")
            };
            
            if(req.body.customer_id != '' && req.body.customer_id != undefined && req.body.customer_id != null  ){
                if(req.body.status_type != 0 && req.body.status_type != undefined && req.body.status_type != ''){
                
                    let statusArray = {
                        user_id : req.decoded.user_id,
                        vertical_id : 1 ,
                        customer_id : req.body.customer_id,
                        visited_date : moment().utc().format("YYYY-MM-DD H:mm:ss"),
                        status_type : req.body.status_type,
                        sub_status : req.body.sub_status,

                    };
                
                    req.response.customer_id = req.body.customer_id;

                    functions.insert('customer_updates', statusArray )
                    .then((respo) => {


                                //-----------------------
                                let analyarray = { 
                                    'dealer_id':req.decoded.dealer_id,
                                    'user_id' : req.decoded.user_id,
                                    'action_type' : 'change_pin_status',
                                    'new_value' : statusArray,
                                    'action_file':  ''
                                }
                                if(req.headers['source'] != '' && req.headers['source'] != undefined){
                                    analyarray['platform'] = 'prospect_web';
                                }else{
                                    analyarray['platform'] = 'prospect_ios';
                                }
                                request.post({
                                    headers: {'content-type' : 'application/json'},
                                    url:     process.env.ANLYTICSURL,
                                    body:    JSON.stringify(analyarray)
                                }, function(error, response, body){                                
                                });
                                //-----------------------

                        req.response.status = true;
                        req.response.message = "Status updated successfully.";
                        next();
                    }).catch((err) => {
                        req.response.message = "Oops! something went wrong.";
                        next();
                    })
                }else{
                    req.response.message = "Oops! something went wrong.Please try again.";
                    next();
                }

            }else{
                if(req.body.status_type != 0 && req.body.status_type != undefined && req.body.status_type != ''){
                    functions.insert('customer_master', insArray )
                    .then((respo) => {
                        functions.update('customer_master', { unique_id :md5(respo.insertId)}, { customer_id :respo.insertId })
                        .then(() => {
                        })
                       
                        let statusArray = {
                            user_id : req.decoded.user_id,
                            vertical_id : 1 ,
                            customer_id : respo.insertId,
                            visited_date : moment().utc().format("YYYY-MM-DD H:mm:ss"),
                            status_type : req.body.status_type,
                            sub_status : req.body.sub_status,
                        };
                        let myListArray = {
                            user_id : req.decoded.user_id,
                            customer_id : respo.insertId,
                            created_at : moment().utc().format("YYYY-MM-DD H:mm:ss")
                        };
                        req.response.customer_id = respo.insertId;
    
                        functions.insert('my_customer_list', myListArray )
                        .then(() => {
                        })
    
                        functions.insert('customer_updates', statusArray )
                        .then((respo) => {
    
                                //-----------------------
                                let analyarray = { 
                                    'dealer_id':req.decoded.dealer_id,
                                    'user_id' : req.decoded.user_id,
                                    'action_type' : 'change_pin_status',
                                    'new_value' : statusArray,
                                    'action_file':  ''
                                }
                                if(req.headers['source'] != '' && req.headers['source'] != undefined){
                                    analyarray['platform'] = 'prospect_web';
                                }else{
                                    analyarray['platform'] = 'prospect_ios';
                                }
                                request.post({
                                    headers: {'content-type' : 'application/json'},
                                    url:     process.env.ANLYTICSURL,
                                    body:    JSON.stringify(analyarray)
                                }, function(error, response, body){                                
                                });
                                //-----------------------
    
                            req.response.status = true;
                            req.response.message = "Status updated successfully.";
                            next();
                        }).catch((err) => {
                            req.response.message = "Oops! something went wrong."+err;
                            next();
                        })
                    }).catch((err) => {
                        req.response.message = "Oops! something went wrong.";
                        next();
                    })
                }else{
                    req.response.message = "Oops! something went wrong.Please try again.";
                    next();
                }
                
            }
            
            
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },
    getAssignedRepslist(req, res, next){
        if (req.decoded.user_id) {
            user.getAssignedRepslist(req.body.area_id)
            .then((result) => {
                req.response.data ={};
                req.response.data.users = result;
                req.response.status = true;
                req.response.message = "Success";
                next();
            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
            
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },
    
    getAreaDetails(req, res, next){
        req.response.area_id = req.body.area_id;
        if (req.decoded.user_id) {
            user.getAreaDetails(req.body.area_id,req.decoded.dealer_id)
            .then((result) => {
                req.response.data.details = { 'address' : result[0].area_name , 'total_home' : result[0].total_home, 'home_interacted': result[0].home_interacted,'knocked' :  Math.round((result[0].home_interacted /  result[0].total_home)*100)};
                req.response.status = true;
                req.response.message = "Success";
                next();
            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
            
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },
    checkEmailExistOrNot(req, res, next){
        let opdata = '';
        if(req.body.fromtype == 'ios'){
            opdata = JSON.parse(req.body.data);
        }else{
            opdata = req.body.data;
        }
        let customerArray = { updated_at : moment().format("YYYY-MM-DD H:mm:ss") };
        const getData = async (resp) => {
            for (const val of resp.fields) {
                if(val.link_table ==  "customer_master"){
                    customerArray[val.link_key] = val.value;
                }
                obj = await returnData(val);
            }
            return customerArray;
        }
        const returnData = details => {
            return new Promise((resolve, reject) => {
                resolve(details);
            })
        }
        getData(opdata[0]).then((respo) => {
            var first_name = respo.first_name;
            var last_name = respo.last_name;
            functions.get('customer_master', { "email": respo.email  })
            .then((result) => {
                if(result.length > 0){
                    if(first_name == result[0].first_name && last_name == result[0].last_name){
                        req.response.status = true;
                        next();
                    }else{
                        req.response.status = false;
                        req.response.message = "Email already exist.";
                        next();
                    }
                }else{
                    req.response.status = true;
                    req.response.message = "";
                    next();
                }
            }).catch((err) => {
                next();
            })
        })
    },

    checkCustomerExist(req, res, next){
        //req.response.status = true;
        if(req.response.status == true){ 
            let opdata = '';
            if(req.body.fromtype == 'ios'){
                opdata = JSON.parse(req.body.data);
            }else{
                opdata = req.body.data;
            }
        
            let customerArray = { updated_at : moment().format("YYYY-MM-DD H:mm:ss") };
            const getData = async (resp) => {
                for (const val of resp.fields) {
                    if(val.link_table ==  "customer_master"){
                        customerArray[val.link_key] = val.value;
                    }
                    obj = await returnData(val);
                }
                return customerArray;
            }
            const returnData = details => {
                return new Promise((resolve, reject) => {
                    resolve(details);
                })
            }

            getData(opdata[0]).then((respo) => {
                
                user.checkCustomerExist(respo.email,respo.phone_number,respo.first_name,respo.last_name,req.decoded.dealer_id)
                .then((resp) =>{
                    if(resp.length > 0 ){
                        req.response.status = false;
                        req.response.message = "This user already has an opportunity.";
                        next();
                    }else{
                        user.checkCustomerExistorNot(respo.email,respo.phone_number,respo.first_name,respo.last_name,req.decoded.dealer_id)
                        .then((respo) =>{
                            if(respo.length > 0 ){
                                req.body.customer.customer_id = respo[0].customer_id;
                                req.response.status = true;
                                req.response.message = "Success";
                                next();
                            }else{
                                req.response.status = true;
                                req.response.message = "Success";
                                next();
                            }
                            
                        }).catch((err) => {
                            req.response.status = true;
                            req.response.message = "Success";
                            next();
                        })
                        
                        
                    }
                    
                }).catch((err) => {
                    req.response.message = "Oops! something went wrong.";
                    next();
                })
            })
        }else{
            next();
        }
    },

    createOpportunityCustomer(req, res, next){
        if(req.response.status == true){
            if (req.decoded.user_id) {
                let insArray = {
                    dealer_id : req.decoded.dealer_id,
                    residential_id : req.body.customer.residential_id,
                    user_id : req.decoded.user_id,
                    unique_id : md5(req.decoded.user_id),
                    first_name : req.body.customer.first_name,
                    last_name : req.body.customer.last_name,
                    phone_number : req.body.customer.phone_number,
                    secondary_phone_number : req.body.customer.secondary_phone_number,
                    address : req.body.customer.address,
                    city : req.body.customer.city,
                    state : req.body.customer.state,
                    zipcode : req.body.customer.zipcode,
                    email : req.body.customer.email,
                    latitude : req.body.customer.latitude,
                    longitude : req.body.customer.longitude,
                    location : req.body.customer.location,
                    vertical_ids : 1,
                    created_at : moment().format("YYYY-MM-DD H:mm:ss")
                };
                if(req.body.customer.customer_id != '' && req.body.customer.customer_id != undefined){
                    
                    let statusArray = {
                        user_id : req.decoded.user_id,
                        vertical_id : 1 ,
                        customer_id : req.body.customer.customer_id,
                        visited_date : moment().format("YYYY-MM-DD H:mm:ss"),
                        status_type : req.body.customer.status_type
                    };
                    
                    req.response.customer_id = req.body.customer.customer_id;

                    let updateArray = {
                        residential_id : req.body.customer.residential_id,
                        first_name : req.body.customer.first_name,
                        last_name : req.body.customer.last_name,
                        phone_number : req.body.customer.phone_number,
                        secondary_phone_number : req.body.customer.secondary_phone_number,
                        address : req.body.customer.address,
                        city : req.body.customer.city,
                        state : req.body.customer.state,
                        zipcode : req.body.customer.zipcode,
                        email : req.body.customer.email,
                        latitude : req.body.customer.latitude,
                        longitude : req.body.customer.longitude,
                        location : req.body.customer.location,
                        vertical_ids : 1,
                    };
                    functions.update('customer_master', updateArray , { customer_id : req.response.customer_id })
                    .then((respo) => {
                    })

                    functions.delete('my_customer_list', { "user_id": req.decoded.user_id,"customer_id": req.response.customer_id })
                    .then(() => {
                        let myListArray = {
                            user_id : req.decoded.user_id,
                            customer_id :  req.response.customer_id,
                            created_at : moment().format("YYYY-MM-DD H:mm:ss")
                        };
                        functions.insert('my_customer_list', myListArray )
                        .then(() => {
                        })
                    })

                    
    
                    functions.insert('customer_updates', statusArray )
                    .then((respo) => {
                        req.response.status = true;
                        req.response.message = "Status updated successfully.";
                        next();
                    }).catch((err) => {
                        req.response.message = "Oops! something went wrong.";
                        next();
                    })
    
                }else{

                    functions.insert('customer_master', insArray )
                    .then((respo) => {
                        functions.update('customer_master', { unique_id : md5(respo.insertId)}, { customer_id :respo.insertId })
                        .then((respo) => {
                        })
                        let statusArray = {
                            user_id : req.decoded.user_id,
                            vertical_id : 1 ,
                            customer_id : respo.insertId,
                            visited_date : moment().format("YYYY-MM-DD H:mm:ss"),
                            status_type : req.body.customer.status_type
                        };
                        let myListArray = {
                            user_id : req.decoded.user_id,
                            customer_id : respo.insertId,
                            created_at : moment().format("YYYY-MM-DD H:mm:ss")
                        };
                        req.response.customer_id = respo.insertId;
    
                        functions.insert('my_customer_list', myListArray )
                        .then(() => {
                        })
    
                        functions.insert('customer_updates', statusArray )
                        .then((respo) => {
                            req.response.status = true;
                            req.response.message = "Status updated successfully.";
                            next();
                        }).catch((err) => {
                            req.response.message = "Oops! something went wrong.";
                            next();
                        })
                    }).catch((err) => {
                        req.response.message = "Oops! something went wrong.";
                        next();
                    })
                }
                
                
            } else {
                req.response.message = "Oops! something went wrong.";
                next();
            }
        }else{
            next();
        }
        
    },

    getUserInfo(req, res, next){
       
        if (req.decoded.user_id) {
            user.getUserInfo(req.decoded.user_id)
            .then((result) => {
                return result;
            }).then((result) => {
                if(result[0].area_id != '' && result[0].area_id != undefined){
                    user.getCoordinates(result[0].area_id)
                    .then((resp) =>{
                        
                         const getData = async (resp) => {
                             let retArray =[];
                             let objArray = {'key':'','value':''};
                            for (const num of resp) {
                                obj = await returnData(num);
                                objArray = {'key':num.area_id,'value':obj}
                                retArray.push(objArray);
                            }
                            return retArray;
                        }
                        const returnData = details => {
                            return new Promise((resolve, reject) => {
                                let array = '';
                                array = JSON.parse(details.area_coordinates)[0];
                                resolve(array);
                            })
                        }
                        getData(resp).then((respo) => {
                            result[0].area_coordinates = respo
                            req.response.data =result[0] ;
                            req.response.status = true;
                            req.response.message = "Success";
                            next();
                        })
                        
                    }).catch((err)=>{
                        req.response.message = "Oops! something went wrong.";
                        next();
                    });
                }else{
                    result[0].area_coordinates = '';
                    req.response.data =result[0] ;
                    req.response.status = true;
                    req.response.message = "Success";
                    next();
                }
                
            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },
    getManagerInfo(req, res, next){
      
        if (req.decoded.user_id) {
            user.getManagerInfo(req.decoded.user_id,req.decoded.office_id)
            .then((result) => {
                return result;
            }).then((result) => {
                user.getManagerCoordinates(req.decoded.user_id,req.decoded.office_id,req.decoded.region_id,req.decoded.division_id,req.decoded.user_type,req.decoded.dealer_id)
                .then((resp) =>{
                    
                     const getData = async (resp) => {
                         let retArray =[];
                         let objArray = {'key':'','value':''};
                        for (const num of resp) {
                            obj = await returnData(num);
                            objArray = {'key':num.area_id,'value':obj}
                            retArray.push(objArray);
                        }
                        return retArray;
                    }
                    const returnData = details => {
                        return new Promise((resolve, reject) => {
                            let array = '';
                            array = JSON.parse(details.area_coordinates)[0];
                            resolve(array);
                        })
                    }
                    getData(resp).then((respo) => {
                        result[0].area_coordinates = respo
                        req.response.data =result[0] ;
                        req.response.status = true;
                        req.response.message = "Success";
                        next();
                    })
                    
                }).catch((err)=>{
                    req.response.message = "Oops! something went wrong.";
                    next();
                });
            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },
    saveOpportunityData(req, res, next){
        if(req.response.status == true){
            if (req.decoded.user_id) {
                let data = '';
                if(req.body.fromtype == 'ios'){
                    data = JSON.parse(req.body.data);
                }else{
                    data = req.body.data;
                }
                console.log(req.body.data);
                let customerArray = { updated_at : moment().format("YYYY-MM-DD H:mm:ss")};
                const getData = async (resp) => {
                for (const num of resp) {
                    for (const val of num.fields) {
                        if(val.link_table ==  "customer_master"){
                            customerArray[val.link_key] = val.value;
                        }
                        obj = await returnData(val);
                    }
                }

                    functions.update('customer_master', customerArray, { customer_id : req.response.customer_id })
                    .then((respo) => {
                    })
                return;
            }
            const returnData = details => {
                return new Promise((resolve, reject) => {
                        //if(details.value != ''){
                        if(details.field_id == 409 && (details.value == "1" || details.value == "2" || details.value == "3" )){
                            details.value = 1;
                        }
                        let array = {
                            opportunity_id : req.response.opportunity_id, 
                            field_id : details.field_id,
                            field_value : details.value,
                            //files :JSON.stringify( details.files);,
                            created_at : moment().utc().format("YYYY-MM-DD H:mm:ss")
                        };
                        //new for freedom
                        if(details.type == 'file'){
                            if(details.files != '' && details.files != undefined){
                                array.field_value = JSON.stringify(details.files); 
                            }
                        }
                    
                        
                        if(details.field_id == 31 ){
                            array.field_value = JSON.stringify(req.body.files);
                            functions.insert('opportunity_data', array )
                            .then((respo) => {
                                resolve(details);
                            })
                        }else{

                            functions.insert('opportunity_data', array )
                            .then((respo) => {
                                resolve(details);
                            })
                        }
                        
                        // }else{
                        //     resolve(array);
                        // }
                    
                })
            }
                getData(data).then((respo) => {
                    req.response.data = req.body.customer.residential_id ;
                    req.response.status = true;
                    req.response.message = "Opportunity added successfully.";
                    next();
                })
                
            } else {
                req.response.message = "Oops! something went wrong.";
                next();
            }
        }else{
           
            next();
        }
    },
    saveOpportunity(req, res, next){
        if(req.response.status == true){
            let source = '';
            if((req.body.source != '' && req.body.source != undefined) || ( req.body.fromtype != undefined && req.body.fromtype == 'ios')){
                source  = 'prospect_ios';
            }else{
                source  = 'prospect_web';
            }
            let fulfilment_partner_id = 1;
            if(req.body.fulfilment_partner_id != '' && req.body.fulfilment_partner_id != undefined){
                fulfilment_partner_id =  req.body.fulfilment_partner_id;
            }
            

            if (req.decoded.user_id) {
                user.getOppotunityCode().then((result) => {
                    let array = {
                        opportunity_code : result[0].opportunity_code,
                        opportunity_unique_id : '',
                        user_id : req.decoded.user_id,
                        dealer_id : req.decoded.dealer_id,
                        fulfilment_partner_id : fulfilment_partner_id,
                        vertical_id : 1,
                        customer_id : req.response.customer_id,
                        sales_rep_user_id:req.decoded.user_id,
                        created_at:  moment().utc().format("YYYY-MM-DD H:mm:ss"),
                        source : source,
                    };
                    functions.insert('opportunity_master', array )
                    .then((respo) => {

                        //-----------------------
                        let analyarray = { 
                            'dealer_id':req.decoded.dealer_id,
                            'user_id' : req.decoded.user_id,
                            'action_type' : 'opportunity_submission',
                            'new_value' : array,
                            'action_file':  ''
                        }
                        if(req.headers['source'] != '' && req.headers['source'] != undefined){
                            analyarray['platform'] = 'prospect_web';
                        }else{
                            analyarray['platform'] = 'prospect_ios';
                        }
                        request.post({
                            headers: {'content-type' : 'application/json'},
                            url:     process.env.ANLYTICSURL,
                            body:    JSON.stringify(analyarray)
                        }, function(error, response, body){                                
                        });
                        //-----------------------

                        functions.update('opportunity_master', { opportunity_unique_id:md5(respo.insertId)}, { opportunity_id : respo.insertId })
                        .then(() => {
                        })

                        
                        req.response.opportunity_id = respo.insertId;
                        req.response.status = true;
                        req.response.message = "Opportunity added successfully.";
                        next();
                    }).catch((err) => {
                        req.response.message = "Oops! something went wrong.";
                        next();
                    })  
                }).catch((err) => {
                    req.response.message = "Oops! something went wrong.";
                    next();
                })
            } else {
                req.response.message = "Oops! something went wrong.";
                next();
            }
        }else {
            
            next();
        }
    },

    getUserResidentialDetails(req, res, next){
        if (req.decoded.user_id) {
            user.getUserResidentialDetails(req.body.residential_id).then((result) => {
                req.response.data = result;
                req.response.status = true;
                req.response.message = "Success";
                next();
            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },
    getCounts(req, res, next){
        if (req.decoded.user_id) {
            user.getCounts(req.decoded.user_id).then((result) => {
                req.response.data.counts = result; 
                req.response.data.areas = [];
                req.response.status = true;
                req.response.message = "Success";
                next();
            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },
    getUserProfileInfo(req, res, next){
        req.response.data = {};
        if (req.decoded.user_id) {
            user.getUserProfileInfo(req.decoded.user_id).then((result) => {
                req.response.data.profile = result[0];
                req.response.status = true;
                req.response.message = "Success";
                next();
            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },
    saveCustomerData(req, res, next){
        if (req.decoded.user_id) {
            let array = { 
                user_id : req.decoded.user_id,
                dealer_id : req.decoded.dealer_id,
                first_name : req.body.first_name , 
                last_name: req.body.last_name,
                phone_number :req.body.phone_no,
                email: req.body.email,
                secondary_phone_number : req.body.secondary_phone_no,
                city: req.body.city,
                state:req.body.state,
                zipcode: req.body.zip_code,
                vertical_ids : 1,
                residential_id:req.body.residential_id
            };
            if(req.body.customer_id != '' && req.body.customer_id != undefined && req.body.customer_id != null){
                functions.update('customer_master', array, { customer_id : req.body.customer_id })
                .then((respo) => {
                    functions.update('customer_master', { unique_id :md5(req.body.customer_id)}, { customer_id :req.body.customer_id })
                    .then(() => {
                    })

                    req.response.status = true;
                    req.response.message = "User data added successfully.";
                    next();
                })
            }else{
                functions.insert('customer_master', array )
                .then((respo) => {
                    functions.update('customer_master', { unique_id :md5(respo.insertId)}, { customer_id :respo.insertId })
                    .then(() => {
                    })
                    req.response.status = true;
                    req.response.message = "Success";
                    next();
                })
            }
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },

    addAppointment(req, res, next){
        if(req.response.dealer_name != '' && req.response.dealer_name != undefined){
            
        }else{
            req.response.dealer_name = 'Nomo';
        }
        
        function sendSms(phone_number,message){
            functions.get('general_config','').then((settings)=>{
                const accountSid = settings.find(x=> x.field == "twilio_sid").value;
                const authToken = settings.find(x=> x.field == "twilio_token").value;
                const client = require('twilio')(accountSid, authToken);
                let twilio_from_number = settings.find(x=> x.field == "twilio_from_number").value;
                client.messages.create({
                    body: message,
                    from: twilio_from_number,
                    to: "+1" + phone_number.toString()
                })
                .then(res =>{
                    let array = {
                        phone: "1" + phone_number,
                        message: message,
                        status: 'Y',
                        is_resent: 'N',
                        accountSid: accountSid,
                        created_at: moment().format("YYYY-MM-DD H:mm:ss"),
                        updated_at: moment().format("YYYY-MM-DD H:mm:ss")
                    };
                    functions.insert('log_message_list', array)
                })
                .catch(err => {
                    let array = {
                        phone: "1" + phone_number,
                        message: message,
                        status: 'N',
                        error: err,
                        is_resent: 'N',
                        accountSid: accountSid,
                        created_at: moment().format("YYYY-MM-DD H:mm:ss"),
                        updated_at: moment().format("YYYY-MM-DD H:mm:ss")
                    };
                    functions.insert('log_message_list', array)
                })
            })
        }

        // console.log(req.decoded);
       
        if (req.decoded.user_id) {
            let array = { 
                user_id : req.decoded.user_id,
                residential_id : req.body.residential_id,
                start_date : req.body.date_time , 
                created_date:  moment().format("YYYY-MM-DD H:mm:ss"),
                //customer_id : req.response.customer_id,
                dealer_id : req.decoded.dealer_id,
                notes : req.body.notes,
                address : req.body.address +', '+req.body.city +', '+ req.body.state +' '+ req.body.zipcode,
                first_name : req.body.first_name,
                last_name : req.body.last_name,
                latitude : req.body.latitude,
                longitude : req.body.longitude,
                location : req.body.location,
                customer_name : req.body.customer_name,
                customer_email : req.body.customer_email,
                customer_phone : req.body.customer_phone,
                selected_date : req.body.local_date,
                timezone : req.body.timezone,
                
            };
            let date_time=moment(req.body.date_time, 'YYYY-MM-DD H:mm:ss').format('MMMM Do YYYY, h:mm a');
            let time_zone_date_time=moment(req.body.local_date, 'YYYY-MM-DD H:mm:ss').format('MMMM Do YYYY, h:mm a')+' ('+req.body.timezone+')';
            let time_zone_date_display=moment(req.body.local_date, 'YYYY-MM-DD H:mm:ss').format('MMMM Do YYYY, h:mm a');

            functions.insert('customer_appointments', array )
            .then((respo) => {

                //-----------------------
                let analyarray = { 
                    'dealer_id':req.decoded.dealer_id,
                    'user_id' : req.decoded.user_id,
                    'action_type' : 'add_appointment',
                    'new_value' : array,
                    'action_file':  ''
                }
                if(req.headers['source'] != '' && req.headers['source'] != undefined){
                    analyarray['platform'] = 'prospect_web';
                }else{
                    analyarray['platform'] = 'prospect_ios';
                }
                request.post({
                    headers: {'content-type' : 'application/json'},
                    url:     process.env.ANLYTICSURL,
                    body:    JSON.stringify(analyarray)
                }, function(error, response, body){                                
                });
                //-----------------------
                req.response.status = true;
                
                req.response.timezone_date = time_zone_date_display;
                req.response.appointment_id = respo.insertId;
                req.response.message = "Your appointment has been saved.";

                if(req.body.customer_name!='' && req.body.customer_name!=undefined)
                {   

                    //------------------

                    let timezoneArray = {
                        'EST' : "America/New_York",
                        'CST' : "America/Chicago",
                        'MST' : "America/Boise",
                        'PST' : "America/Los_Angeles",
                    }
                    let event_date_time='';
                    
                    let local_date = req.body.local_date;
                    let timezone = '';
                    if(timezoneArray[req.body.timezone] != '' && timezoneArray[req.body.timezone] != undefined){
                        timezone = timezoneArray[req.body.timezone];
                    }else{
                        timezone = 'UTC';
                    }
                    if(timezone != 'UTC'){
                        var a = moment.tz(local_date, timezone);
                        //console.log(a.format('MMMM Do YYYY, h:mm a'));
                        a.format(); // 2013-11-18T11:55:00+08:00
                        a.utc().format(); // 2013-11-18T03:55Z
                        //console.log(a.utc().format('YYYY, MM, DD, H, mm'));
                        //event_date_time=moment(req.body.local_date, 'YYYY-MM-DD H:mm:ss').format('YYYY, MM, DD, H, mm');
                        event_date_time=a.utc().format('YYYY, MM, DD, H, mm');
                        //console.log(event_date_time);
                    }else{
                        //event_date_time=moment(req.body.local_date, 'YYYY-MM-DD H:mm:ss').format('YYYY, MM, DD, H, mm');
                        event_date_time=moment(req.body.local_date, 'YYYY-MM-DD H:mm:ss').format('YYYY, MM, DD, H, mm');
                    }
                    ///console.log(event_date_time);
                    //------------------

                    //let event_date_time=moment(req.body.date_time, 'YYYY-MM-DD H:mm:ss').format('YYYY, MM, DD, H, mm');
                    //let event_date_time=moment(req.body.local_date, 'YYYY-MM-DD H:mm:ss').format('YYYY, MM, DD, H, mm');

                    //console.log("event_date_time");
                    //console.log(event_date_time);
                   // var strVale = "130,235,342,124";
                    var strArr = event_date_time.split(',');
                    var intArr = [];
                    for(i=0; i < strArr.length; i++)
                    intArr.push(parseInt(strArr[i]));

                    let event = {
                        //start: [event_date_time],
                        start: intArr,
                        startInputType: 'utc',
                        duration: { hours: 1, minutes: 00 },
                        title: req.response.dealer_name+' - Appointment',
                        description: req.body.notes,
                        location: req.body.address +', '+req.body.city +', '+ req.body.state +' '+ req.body.zipcode,
                        //url: 'http://www.bolderboulder.com/',
                        geo: { lat: req.body.latitude, lon: req.body.longitude },
                        //categories: ['10k races', 'Memorial Day Weekend', 'Boulder CO'],
                        status: 'CONFIRMED',
                        organizer: { name: req.decoded.first_name+' '+req.decoded.last_name, email: req.decoded.email },
                        attendees: [
                          { name: req.body.customer_name, email: req.body.customer_email, rsvp: true, partstat: 'ACCEPTED', role: 'REQ-PARTICIPANT' },
                        //  { name: 'Brittany Seaton', email: 'brittany@example2.org', dir: 'https://linkedin.com/in/brittanyseaton', role: 'OPT-PARTICIPANT' }
                        ]
                      }
                   // console.log(event);
                    let event_calender_name=moment().format('YYYYMMDDHmmss');
                    ics.createEvent(event, (error, value) => {
                    if (error) {
                        console.log(error)
                    }
                    //console.log(value);
                    
                    writeFileSync(`${__dirname}/../public/${event_calender_name}.ics`, value)
                    });
                    
                    var file_url=`${__dirname}/../public/${event_calender_name}.ics`;

                    let otherOpptions = {
                        "fromname" :req.decoded.first_name+' '+req.decoded.last_name,
                        "replyTo" :req.decoded.email
                    };
                      
                    functions.get('general_emails', { "name": 'book_appointment_customer'}).then((result1)=>{
                        if(result1.length>0) {
                        // functions.get('general_config',{'field':'ticket_notification_email'}).then((result2)=>{
                            let email_template = result1[0].email_template;
                            email_template = email_template.replace("##FULL_NAME##", req.body.customer_name);
                            email_template = email_template.replace("##NAME##", req.decoded.first_name+' '+req.decoded.last_name);
                            //email_template = email_template.replace("##DATE##", date_time);
                            email_template = email_template.replace("##DATE##", time_zone_date_time);

                            var to_email=req.body.customer_email;
                            var email_subject = result1[0].email_subject.replace('##APPNAME##', 'prospect+');
                            console.log("11111111111");
                            functions.sendMail(to_email, email_subject, email_template , false, file_url, otherOpptions ,function (emailres1) {
                                console.log("11111111111");
                                if(emailres1 && emailres1.status != undefined && emailres1.status == 'success'){
                                    console.log("11111111111",emailres1);
                                    let array = {
                                        type:'email',
                                        to:to_email,
                                        message:email_template,
                                        attachments:file_url,
                                        subject:email_subject,
                                        from_email: emailres1.from_email,
                                        //from_name: emailres1.from_name,
                                        from_name: req.decoded.first_name+' '+req.decoded.last_name,
                                        message_type:"book_appointment_customer",
                                        created_at: moment().format("YYYY-MM-DD H:mm:ss"),
                                        updated_at: moment().format("YYYY-MM-DD H:mm:ss")
                                    };
                                    functions.insert('log', array )
                                }
                                console.log('emailres New Appointment', emailres)
                            })

                            let sms_template = result1[0].sms_template;
                            sms_template = sms_template.replace("##SALES_REP##", req.decoded.first_name+' '+req.decoded.last_name);
                            //sms_template = sms_template.replace("##DATE_TIME##", date_time);
                            sms_template = sms_template.replace("##DATE_TIME##", time_zone_date_time);
                            sendSms(req.body.customer_phone,sms_template);

                            // let array = {
                            //     type:'message',
                            //     to:req.body.customer_phone,
                            //     message:sms_template,
                            //     attachments:'',
                            //     subject:email_subject,
                            //     message_type:"book_appointment_customer",
                            //     created_at: moment().format("YYYY-MM-DD H:mm:ss"),
                            //     updated_at: moment().format("YYYY-MM-DD H:mm:ss")
                            // };
                            // functions.insert('log', array )
                        }
                    })
                    functions.get('general_emails', { "name": 'book_appointment_rep'}).then((result1)=>{
                        if(result1.length>0) {
                        // functions.get('general_config',{'field':'ticket_notification_email'}).then((result2)=>{
                            let email_template = result1[0].email_template;

                            email_template = email_template.replace("##FULL_NAME##", req.decoded.first_name+' '+req.decoded.last_name);
                            email_template = email_template.replace("##NAME##", req.body.customer_name);
                            //email_template = email_template.replace("##DATE##", date_time);
                            email_template = email_template.replace("##DATE##", time_zone_date_time);


                            var to_email=req.decoded.email;
                            var email_subject = result1[0].email_subject.replace('##APPNAME##', 'prospect+');
                            functions.sendMail(to_email, email_subject, email_template , false,file_url,'', function (emailres2) {
                                if(emailres2 && emailres2.status != undefined && emailres2.status == 'success'){

                                    let array = {
                                        type:'email',
                                        to:to_email,
                                        message:email_template,
                                        attachments:file_url,
                                        subject:email_subject,
                                        from_email: emailres2.from_email,
                                        from_name: emailres2.from_name,
                                        message_type:"book_appointment_rep",
                                        created_at: moment().format("YYYY-MM-DD H:mm:ss"),
                                        updated_at: moment().format("YYYY-MM-DD H:mm:ss")
                                    };
                                        functions.insert('log', array )
                                }
                                console.log('emailres New Appointment', emailres)
                            })

                            let sms_template = result1[0].sms_template;
                            sms_template = sms_template.replace("##CUSTOMER_NAME##", req.body.customer_name);
                            //sms_template = sms_template.replace("##DATE_TIME##", date_time);
                            sms_template = sms_template.replace("##DATE_TIME##", time_zone_date_time);
                            sendSms(req.decoded.phone, sms_template);

                            // let array = {
                            //     type:'message',
                            //     to:req.decoded.phone,
                            //     message:sms_template,
                            //     attachments:'',
                            //     subject:email_subject,
                            //     message_type:"book_appointment_rep",
                            //     created_at: moment().format("YYYY-MM-DD H:mm:ss"),
                            //     updated_at: moment().format("YYYY-MM-DD H:mm:ss")
                            // };
                            // functions.insert('log', array )
                        
                        }
                    })
                }else{
                    //new mail for appointment
                    functions.get('general_emails', { "name": 'book_appointment_rep'}).then((result1)=>{
                        if(result1.length>0) {
                            let email_template = result1[0].email_template;
                            email_template = email_template.replace("##FULL_NAME##", req.decoded.first_name+' '+req.decoded.last_name);
                            email_template = email_template.replace("##NAME##", req.body.first_name+' '+req.body.last_name);
                            //email_template = email_template.replace("##DATE##", date_time);
                            email_template = email_template.replace("##DATE##", time_zone_date_time);
                            var to_email=req.decoded.email;
                            var email_subject = result1[0].email_subject.replace('##APPNAME##', 'prospect+');
                            functions.sendMail(to_email, email_subject, email_template , false,file_url,'', function (emailres2) {
                                if(emailres2 && emailres2.status != undefined && emailres2.status == 'success'){
                                    let array = {
                                        type:'email',
                                        to:to_email,
                                        message:email_template,
                                        attachments:file_url,
                                        subject:email_subject,
                                        from_email: emailres2.from_email,
                                        from_name: emailres2.from_name,
                                        message_type:"book_appointment_rep",
                                        created_at: moment().format("YYYY-MM-DD H:mm:ss"),
                                        updated_at: moment().format("YYYY-MM-DD H:mm:ss")
                                    };
                                        functions.insert('log', array )
                                }
                                console.log('emailres New Appointment', emailres)
                            })
                            let sms_template = result1[0].sms_template;
                            sms_template = sms_template.replace("##CUSTOMER_NAME##", req.body.first_name+' '+req.body.last_name);
                            //sms_template = sms_template.replace("##DATE_TIME##", date_time);
                            sms_template = sms_template.replace("##DATE_TIME##", time_zone_date_time);
                            sendSms(req.decoded.phone, sms_template);
                        }
                    })
                }

            


                next();
            })
            
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },
    addNotes(req, res, next){
      
        let statename = '';
        if(req.body.location != undefined && req.body.location != ''){
            if(stateNameArray[req.body.location] != '' && stateNameArray[req.body.location] != undefined){
                statename = stateNameArray[req.body.location];
            }else{
                statename = 'nj';
            }
        }else{
            statename = 'nj'; 
        }
        let platformVal = '';
        if(req.headers['source'] != '' && req.headers['source'] != undefined){
            platformVal = 'prospect_web';
        }else{
            platformVal = 'prospect_ios';
        }
        
        
        if (req.decoded.user_id) {

            if(req.body.note_id != '' && req.body.note_id != undefined){
                let array = { 
                    notes : req.body.notes , 
                    updated_at:  moment().format("YYYY-MM-DD H:mm:ss")
                };
                functions.update('customer_notes', array, { id: req.body.note_id })
                .then((result) => {
                    req.response.note_id= req.body.note_id
                })

                let array2 = { 
                    user_id : req.decoded.user_id,
                    residential_id : req.body.residential_id,
                    dealer_id : req.decoded.dealer_id,
                    notes : req.body.notes , 
                    state : statename,
                    created_at:  moment().format("YYYY-MM-DD H:mm:ss"),
                    created_date:  moment().format("YYYY-MM-DD H:mm:ss")
                };

                let analyarray = { 
                    'dealer_id':req.decoded.dealer_id,
                    'user_id' : req.decoded.user_id,
                    'action_type' : 'add_note',
                    'new_value' : array2,
                    'action_file':  ''
                }
                if(req.headers['source'] != '' && req.headers['source'] != undefined){
                    analyarray['platform'] = 'prospect_web';
                }else{
                    analyarray['platform'] = 'prospect_ios';
                }
                request.post({
                    headers: {'content-type' : 'application/json'},
                    url:     process.env.ANLYTICSURL,
                    body:    JSON.stringify(analyarray)
                }, function(error, response, body){ 
                                          
                });


                req.response.status = true;
                req.response.message = "Notes updated successfully.";
                next();
            }else{
                let array = { 
                    user_id : req.decoded.user_id,
                    residential_id : req.body.residential_id,
                    dealer_id : req.decoded.dealer_id,
                    notes : req.body.notes , 
                    state : statename,
                    platform : platformVal,
                    created_at:  moment().format("YYYY-MM-DD H:mm:ss"),
                    created_date:  moment().format("YYYY-MM-DD H:mm:ss")
                };
                functions.insert('customer_notes', array )
                .then((respo) => {
                    req.response.note_id= respo.insertId       
                    //-----------------------
                    let analyarray = { 
                        'dealer_id':req.decoded.dealer_id,
                        'user_id' : req.decoded.user_id,
                        'action_type' : 'add_note',
                        'new_value' : array,
                        'action_file':  ''
                    }
                    if(req.headers['source'] != '' && req.headers['source'] != undefined){
                        analyarray['platform'] = 'prospect_web';
                    }else{
                        analyarray['platform'] = 'prospect_ios';
                    }
                    request.post({
                        headers: {'content-type' : 'application/json'},
                        url:     process.env.ANLYTICSURL,
                        body:    JSON.stringify(analyarray)
                    }, function(error, response, body){ 
                                              
                    });

                    //-----------------------
    
                    req.response.status = true;
                    req.response.message = "Notes added successfully.";
                    next();
                })
            }


        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },
    getAppointments(req, res, next){
        let statename ='';
        if(req.body.location != undefined && req.body.location != ''){
            // if(req.body.location == 'US-NJ'){
            //     statename = 'US-NJ';
            // }else if(req.body.location == 'US-IL'){
            //     statename = 'US-IL';
            // }else if(req.body.location == 'US-CA'){
            //     statename = 'US-CA';
            // }else if(req.body.location == 'US-CT'){
            //     statename = 'US-CT';
            // }else if(req.body.location == 'US-MA'){
            //     statename = 'US-MA';
            // }else if(req.body.location == 'US-NY'){
            //     statename = 'US-NY';
            // }else if(req.body.location == 'US-RI'){
            //     statename = 'US-RI';
            // }else if(req.body.location == 'US-NV'){
            //     statename = 'US-NV';
            // }else if(req.body.location == 'US-AZ'){
            //     statename = 'US-AZ';
            // }else if(req.body.location == 'US-TX'){
            //     statename = 'US-TX';
            // }else{
            //     statename = 'US-NJ';
            // }
            statename = req.body.location;
        }else{
            statename = 'US-NJ';
        }

        if (!req.body.residential_id) {
            req.response.message = "Location is required.";
            next();
        } else {
            user.getAppointments(req.body.residential_id,req.decoded.dealer_id,statename)
            .then((result) => {
                req.response.status = true;
                if(result.length != 0)
                    req.response.data.appointments = result;
                else
                    req.response.data.appointments = [];
                req.response.message = "Success";
                next();
            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
        }


    },
    getNotes(req, res, next){

        let statename = '';
        if(req.body.location != undefined && req.body.location != ''){
            if(stateNameArray[req.body.location] != '' && stateNameArray[req.body.location] != undefined){
                statename = stateNameArray[req.body.location];
            }else{
                statename = 'nj';
            }
        }else{
            statename = 'nj'; 
        }

        // let statename ='';
        // if(req.body.location != undefined && req.body.location != ''){
        //     if(req.body.location == 'US-NJ'){
        //         statename = 'nj';
        //     }else if(req.body.location == 'US-IL'){
        //         statename = 'il';
        //     }else if(req.body.location == 'US-CA'){
        //         statename = 'ca';
        //     }else if(req.body.location == 'US-CT'){
        //         statename = 'ct';
        //     }else if(req.body.location == 'US-MA'){
        //         statename = 'ma';
        //     }else if(req.body.location == 'US-NY'){
        //         statename = 'ny';
        //     }else if(req.body.location == 'US-RI'){
        //         statename = 'ri';
        //     }else if(req.body.location == 'US-NV'){
        //         statename = 'nv';
        //     }else if(req.body.location == 'US-AZ'){
        //         statename = 'az';
        //     }else if(req.body.location == 'US-TX'){
        //         statename = 'tx';
        //     }else{
        //         statename = 'nj';
        //     }
        // }else{
        //     statename = 'nj';
        // }
       

        
        let dealer_id = req.decoded.dealer_id;
        if (!req.body.residential_id) {
            req.response.message = "Location is required.";
            next();
        } else {
            user.getNotes(req.body.residential_id, dealer_id,statename)
            .then((result) => {
                req.response.status = true;
                if(result.length != 0)
                    req.response.data.notes = result;
                else
                    req.response.data.notes = [];
                req.response.message = "Success";
                next();
            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
        }
    },
    getCustomers(req, res, next){
        
        let tableName = '';
        if(req.body.location != undefined && req.body.location != ''){
            if(consumerTableArray[req.body.location] != '' && consumerTableArray[req.body.location] != undefined){
                tableName = consumerTableArray[req.body.location];
            }else{
                tableName = 'consumer_data_nj';
            }
        }else{
            tableName = 'consumer_data_nj'; 
        }
        // let tableName ='';
        // if(req.body.location != undefined && req.body.location != ''){
        //     if(req.body.location == 'US-NJ'){
        //         tableName = 'consumer_data_nj';
        //     }else if(req.body.location == 'US-IL'){
        //         tableName = 'consumer_data_il';
        //     }else if(req.body.location == 'US-CA'){
        //         tableName = 'consumer_data_ca';
        //     }else if(req.body.location == 'US-CT'){
        //         tableName = 'consumer_data_ct';
        //     }else if(req.body.location == 'US-MA'){
        //         tableName = 'consumer_data_ma';
        //     }else if(req.body.location == 'US-NY'){
        //         tableName = 'consumer_data_ny';
        //     }else if(req.body.location == 'US-RI'){
        //         tableName = 'consumer_data_ri';
        //     }else if(req.body.location == 'US-NV'){
        //         tableName = 'consumer_data_nv';
        //     }else if(req.body.location == 'US-AZ'){
        //         tableName = 'consumer_data_az';
        //     }else if(req.body.location == 'US-TX'){
        //         tableName = 'consumer_data_tx';
        //     }else{
        //         tableName = 'consumer_data_nj';
        //     }
        // }else{
        //     tableName = 'consumer_data_nj';
        // }
       
        if (!req.body.residential_id) {
            req.response.message = "Location is required.";
            next();
        } else {
            user.getCustomers(req.response.data.details.latitude,req.response.data.details.longitude,tableName,req.decoded.dealer_id,req.body.residential_id)
            .then((result) => {
                req.response.status = true;

       
                if(result.length != 0)
                    req.response.data.customers = result;
                else
                    req.response.data.customers = [];
                req.response.message = "Success";
                next();
            }).catch((err) => {
                req.response.message = "Oops! something went wrong."+err;
                next();
            })
        }
    },

    getCustomersNew(req, res, next){
        
        let tableName = '';
        if(req.body.location != undefined && req.body.location != ''){
            if(consumerTableArray[req.body.location] != '' && consumerTableArray[req.body.location] != undefined){
                tableName = consumerTableArray[req.body.location];
            }else{
                tableName = 'consumer_data_nj';
            }
        }else{
            tableName = 'consumer_data_nj'; 
        }
        let stateName = '';
        if(req.body.location != undefined && req.body.location != ''){
            if(stateNameNewArray[req.body.location] != '' && stateNameNewArray[req.body.location] != undefined){
                stateName = stateNameNewArray[req.body.location];
            }else{
                stateName = 'NJ';
            }
        }else{
            stateName = 'NJ'; 
        }


        
        
        // let tableName ='';
        // if(req.body.location != undefined && req.body.location != ''){
        //     if(req.body.location == 'US-NJ'){
        //         tableName = 'consumer_data_nj';
        //     }else if(req.body.location == 'US-IL'){
        //         tableName = 'consumer_data_il';
        //     }else if(req.body.location == 'US-CA'){
        //         tableName = 'consumer_data_ca';
        //     }else if(req.body.location == 'US-CT'){
        //         tableName = 'consumer_data_ct';
        //     }else if(req.body.location == 'US-MA'){
        //         tableName = 'consumer_data_ma';
        //     }else if(req.body.location == 'US-NY'){
        //         tableName = 'consumer_data_ny';
        //     }else if(req.body.location == 'US-RI'){
        //         tableName = 'consumer_data_ri';
        //     }else if(req.body.location == 'US-NV'){
        //         tableName = 'consumer_data_nv';
        //     }else if(req.body.location == 'US-AZ'){
        //         tableName = 'consumer_data_az';
        //     }else if(req.body.location == 'US-TX'){
        //         tableName = 'consumer_data_tx';
        //     }else{
        //         tableName = 'consumer_data_nj';
        //     }
        // }else{
        //     tableName = 'consumer_data_nj';
        // }
       
        if (!req.body.residential_id) {
            req.response.message = "Location is required.";
            next();
        } else {
           
            //console.log(req.response.data);
            user.getCustomersNew(req.response.data.details.latitude,req.response.data.details.longitude,tableName,req.decoded.dealer_id,req.body.residential_id,req.response.data.details.address_line1,stateName)
            .then((result) => {
               
                req.response.status = true;

       
                if(result.length != 0)
                    req.response.data.customers = result;
                else
                    req.response.data.customers = [];
                req.response.message = "Success";
                next();
            }).catch((err) => {
                req.response.message = "Oops! something went wrong."+err;
                next();
            })
        }
    },



    getMyAppointments(req, res, next){
        let tableName = '';
        if(req.body.location != undefined && req.body.location != ''){
            if(consumerTableArray[req.body.location] != '' && consumerTableArray[req.body.location] != undefined){
                tableName = consumerTableArray[req.body.location];
            }else{
                tableName = 'consumer_data_nj';
            }
        }else{
            tableName = 'consumer_data_nj'; 
        }
        // let tableName ='';
        // if(req.body.location != undefined && req.body.location != ''){
        //     if(req.body.location == 'US-NJ'){
        //         tableName = 'consumer_data_nj';
        //     }else if(req.body.location == 'US-IL'){
        //         tableName = 'consumer_data_il';
        //     }else if(req.body.location == 'US-CA'){
        //         tableName = 'consumer_data_ca';
        //     }else if(req.body.location == 'US-CT'){
        //         tableName = 'consumer_data_ct';
        //     }else if(req.body.location == 'US-MA'){
        //         tableName = 'consumer_data_ma';
        //     }else if(req.body.location == 'US-NY'){
        //         tableName = 'consumer_data_ny';
        //     }else if(req.body.location == 'US-RI'){
        //         tableName = 'consumer_data_ri';
        //     }else if(req.body.location == 'US-NV'){
        //         tableName = 'consumer_data_nv';
        //     }else if(req.body.location == 'US-AZ'){
        //         tableName = 'consumer_data_az';
        //     }else if(req.body.location == 'US-TX'){
        //         tableName = 'consumer_data_tx';
        //     }else{
        //         tableName = 'consumer_data_nj';
        //     }
        // }else{
        //     tableName = 'consumer_data_nj';
        // }
       
        req.body.user_id = req.decoded.user_id;
        user.getMyAppointments(req.decoded.user_id,tableName)
        .then((result) => {
            req.response.status = true;
            if(result.length != 0)
                req.response.data.appointments = result;
            else
                req.response.data.appointments = [];
            req.response.message = "Success";
            next();
        }).catch((err) => {
            req.response.message = "Oops! something went wrong.";
            next();
        })
    },

    assignSalesRepArea(req, res, next){
        req.response.data = {};
        if (!req.body.area_id) {
            req.response.message = "Area is required.";
            next();
        }else if (!req.body.user_id) {
            req.response.message = "User is required.";
            next();
        } else {

        functions.update('manager_regions', { "area_name": req.body.area_name, "status":'Y'}, { area_id: req.body.area_id })
        .then((result) => {
            const getData = async (resp) => {
                var idArr = resp.split(',');
                for (const num of idArr) {
                    obj = await returnData(num);
                }
                return;
            }
            const returnData = details => {
                return new Promise((resolve, reject) => {
                    
                        let array = { 
                            dealer_id : req.decoded.dealer_id,
                            user_id : details,
                            manager_id : req.decoded.user_id,
                            area_id : req.body.area_id , 
                            created_at:  moment().format("YYYY-MM-DD H:mm:ss")
                        };
                        

                        //functions.get('sales_rep_regions', { "user_id": details ,"manager_id": req.decoded.user_id  })
                        functions.get('sales_rep_regions', { "user_id": details  })
                        .then((result) => {
                            if (result.length > 0) {
                                
                                var str = result[0].area_id;
                                var split_str = str.split(",");
                                
                                if (split_str.indexOf(String(req.body.area_id)) !== -1) {
                                    
                                    resolve(details);
                                }else{
                                    var areaID = '';
                                    if(result[0].area_id != ''){
                                        areaID = result[0].area_id + ',' + req.body.area_id;
                                    }else{
                                        areaID = req.body.area_id;
                                    }
                                    functions.update('sales_rep_regions', { area_id: areaID }, { "user_id": details })
                                    .then((result) => {
                                        resolve(details);
                                    })
                                    
                                    // functions.update('sales_rep_regions', { area_id: areaID }, { "user_id": details ,"manager_id": req.decoded.user_id  })
                                    // .then((result) => {
                                    //     resolve(details);
                                    // })
                                }
                            }else{
                                functions.insert('sales_rep_regions', array )
                                .then((respo) => {
                                    resolve(details);
                                })
                            }
                        });
                })
            }
            getData(req.body.user_id).then((respo) => {
                req.response.data = respo ;
                req.response.status = true;
                req.response.message = "Area assigned successfully.";
                next();
            })
        })
        .catch((err) => {
            console.log(err);
        })



        }
        
    },



    deleteAssignArea(req, res, next){
        if (req.decoded.user_id) {
           
            //functions.get('sales_rep_regions', { "user_id": req.body.user_id ,"manager_id": req.decoded.user_id  })
            functions.get('sales_rep_regions', { "user_id": req.body.user_id  })
            .then((result) => {
                console.log(result);
                if (result.length > 0) {
                    var str = result[0].area_id;
                    var split_str = str.split(",");
                    console.log(split_str);
                    if (split_str.indexOf(String(req.body.area_id)) !== -1) {
                        split_str.splice(split_str.indexOf(String(req.body.area_id)), 1);
                        split_str = split_str.join(',');
                        console.log(split_str);
                        functions.update('sales_rep_regions', { area_id: split_str }, { "user_id": req.body.user_id })
                        .then((result) => {
                            req.response.status = true;
                            req.response.message = "You have successfully removed the rep.";
                            next();
                        })
                        // functions.update('sales_rep_regions', { area_id: split_str }, { "user_id": req.body.user_id ,"manager_id": req.decoded.user_id })
                        // .then((result) => {
                        //     req.response.status = true;
                        //     req.response.message = "Area deleted successfully.";
                        //     next();
                        // })
                    }else{
                        req.response.status = false;
                        req.response.message = "Oops! something went wrong.";
                        next();
                    }
                }else{
                    
                    req.response.status = true;
                    req.response.message = "User does not exist.";
                    next();
                }
            });
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },
    tessssssssstttt(req, res, next){
        req.body.area_id = 755;
           
        var str = '622,629,733,736,775,755,772,809,811,816,817,820,828';
        var split_str = str.split(",");
        console.log(split_str);
        if (split_str.indexOf(String(req.body.area_id)) !== -1) {
            split_str.splice(split_str.indexOf(String(req.body.area_id)), 1);
            console.log(split_str.indexOf(String(req.body.area_id)));
            split_str2 = split_str.join(',');
            console.log(split_str2);
            // functions.update('sales_rep_regions', { area_id: split_str }, { "user_id": req.body.user_id })
            // .then((result) => {
            //     req.response.status = true;
            //     req.response.message = "You have successfully removed the rep.";
            //     next();
            // })
            //req.response.status = true;
            req.response.message = "You have successfully removed the rep.";
            next();
            
        }else{
            //req.response.status = false;
            req.response.message = "Oops! something went wrong.";
            next();
        }
               
            
       
    },
    sendFeedback(req, res, next){
        //console.log(req.body);
        //console.log(req.decoded);
        if (req.decoded.user_id) {

            functions.get('dealer_master',{'dealer_id':req.decoded.dealer_id}).then((dealer)=>{ 
                functions.get('user_master', { "user_id": req.decoded.user_id}).then((userinfo)=>{
                    //console.log(userinfo[0].first_name);
                    //console.log(userinfo[0].last_name);
                    functions.get('general_emails', { "name": 'prospect_feedback'}).then((result1)=>{
                        if(result1.length>0) {
                            functions.get('general_config',{'field':'admin_email'}).then((result2)=>{
                                let email_template = result1[0].email_template;
                                email_template = email_template.replace("##FEEDBACK##", req.body.feedback);
                                //email_template = email_template.replace("##USER_NAME##", req.decoded.first_name+' '+req.decoded.last_name);
                                email_template = email_template.replace("##USER_NAME##", userinfo[0].first_name+' '+userinfo[0].last_name);
                                email_template = email_template.replace("##DEALER_NAME##",dealer[0].dealer_name);

                                    if(result2.length>0) {
                                        let emails = result2[0].value.split(',');
                                        for(let i=0;i<emails.length;i++) {
                                            var file_url="";
                                            var email_subject = result1[0].email_subject.replace('##APPNAME##', 'prospect+');

                                            functions.sendMail(emails[i], "Prospect Feedback", email_template , false,file_url,'', function (emailres3) {
                                                if (emailres3 && emailres3.status != undefined && emailres3.status == 'success') {
                                                    let array = {
                                                        type: 'email',
                                                        to: emails[i],
                                                        message: email_template,
                                                        attachments: file_url,
                                                        subject: email_subject,
                                                        message_type: "prospect_feedback",
                                                        from_email: emailres3.from_email,
                                                        from_name: emailres3.from_name,
                                                        created_at: moment().format("YYYY-MM-DD H:mm:ss"),
                                                        updated_at: moment().format("YYYY-MM-DD H:mm:ss")
                                                    };
                                                    functions.insert('log', array)
                                                }
                                            })
                                            if(i == emails.length -1) {

                                            let feedbackArray = {
                                                user_id : req.decoded.user_id,
                                                dealer_id : req.decoded.dealer_id,
                                                feedback : req.body.feedback,
                                                platform : req.body.platform,                                   
                                                created_at : moment().format("YYYY-MM-DD H:mm:ss")
                                            };
                                            functions.insert('feedback_log', feedbackArray);

                                                req.response.status = true;
                                                req.response.message = "Feedback send successfully.";
                                                next();
                                            }
                                        }
                                    }
                            })
                        }
                    })
                })

            })
            // prospect_feedback
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },


    getUserDetails(req, res, next){
        
        req.response.data = {};
        if (req.decoded.user_id) {
            user.getUserDetails(req.body.user_id).then((result) => {

                //-----------------------
                let analyarray = { 
                    'dealer_id':req.decoded.dealer_id,
                    'user_id' : req.decoded.user_id,
                    'action_type' : 'view_profile',
                    'new_value' : result[0],
                    'action_file':  ''
                }
                if(req.headers['source'] != '' && req.headers['source'] != undefined){
                    analyarray['platform'] = 'prospect_web';
                }else{
                    analyarray['platform'] = 'prospect_ios';
                }
                request.post({
                    headers: {'content-type' : 'application/json'},
                    url:     process.env.ANLYTICSURL,
                    body:    JSON.stringify(analyarray)
                }, function(error, response, body){                                
                });
                //-----------------------


                req.response.data.profile = result[0];
                req.response.status = true;
                req.response.message = "Success";
                next();
            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },
    getUserHistory(req, res, next){
        
        if (req.decoded.user_id) {
            let tableName = '';
            if(req.body.location != undefined && req.body.location != ''){
                if(consumerTableArray[req.body.location] != '' && consumerTableArray[req.body.location] != undefined){
                    tableName = consumerTableArray[req.body.location];
                }else{
                    tableName = 'consumer_data_nj';
                }
            }else{
                tableName = 'consumer_data_nj'; 
            }
            // let tableName ='';
            // if(req.body.location != undefined && req.body.location != ''){
            //     if(req.body.location == 'US-NJ'){
            //         tableName = 'consumer_data_nj';
            //     }else if(req.body.location == 'US-IL'){
            //         tableName = 'consumer_data_il';
            //     }else if(req.body.location == 'US-CA'){
            //         tableName = 'consumer_data_ca';
            //     }else if(req.body.location == 'US-CT'){
            //         tableName = 'consumer_data_ct';
            //     }else if(req.body.location == 'US-MA'){
            //         tableName = 'consumer_data_ma';
            //     }else if(req.body.location == 'US-NY'){
            //         tableName = 'consumer_data_ny';
            //     }else if(req.body.location == 'US-RI'){
            //         tableName = 'consumer_data_ri';
            //     }else if(req.body.location == 'US-NV'){
            //         tableName = 'consumer_data_nv';
            //     }else if(req.body.location == 'US-AZ'){
            //         tableName = 'consumer_data_az';
            //     }else if(req.body.location == 'US-TX'){
            //         tableName = 'consumer_data_tx';
            //     }else{
            //         tableName = 'consumer_data_nj';
            //     }
            // }else{
            //     tableName = 'consumer_data_nj';
            // }


            user.getUserHistory(req.body.user_id,tableName)
            .then((result) => {
                req.response.status = true;
                if(result.length != 0)
                    req.response.data.history = result;
                else
                    req.response.data.history = [];
                req.response.message = "Success";
                next();
            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
       
    },

   
    getVerticals(req, res, next){
        if (req.decoded.user_id) {
            user.getVerticals(req.decoded.dealer_id)
            .then((result) => {
                req.response.status = true;
                req.response.data = result;
                req.response.message = "Success";
                next();
            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },
    getAvailableOffices(req, res, next){
        if (req.decoded.user_id) {
            user.getAvailableOffices(req.decoded.user_id,req.decoded.dealer_id , req.decoded.office_id,req.decoded.division_id,req.decoded.region_id,req.decoded.user_type)
            .then((result) => {
                req.response.status = true;
                req.response.data = result;
                req.response.message = "Success";
                next();
            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },
    getManagersList(req, res, next){
        if (req.decoded.user_id) {
            user.getManagersList(req.decoded.office_id)
            .then((result) => {
                req.response.status = true;
                req.response.data = result;
                req.response.message = "Success";
                next();
            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },


    


    getMessages(req, res, next){
       
        if (req.decoded.user_id) {
            if(req.body.user_id != '' && req.body.user_id != undefined){
                user.getMessages(req.body.user_id,req.decoded.user_id)
                .then((result) => {
                    req.response.status = true;
                    req.response.data = result;
                    req.response.message = "Success";
                    next();
                }).catch((err) => {
                    req.response.message = "Oops! something went wrong."+err;
                    next();
                })
            }else{
                req.response.message = "Oops! something went wrong.";
                next();
            }
           
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },

    saveHomeOwnerData(req, res, next){
        
  

        if(req.body.residential_id == ''){
            req.response.message = "Residential data is required.";
            next();
        }else{
            if (req.decoded.user_id) {
                user.getHomeOwnerData(req.body.residential_id,req.body.latitude,req.body.longitude, req.decoded.dealer_id )
                .then((result) => {
                   
                    if(result.length > 0 ){
                        
                        let array1 = { 
                            residential_id :req.body.residential_id,
                            dealer_id : req.decoded.dealer_id,
                            user_id : req.decoded.user_id,
                            residential_customer_id: req.body.residential_customer_id,  
                            home_owner_id: req.body.customer_id,
                            first_name : req.body.first_name,
                            last_name : req.body.last_name
                        };
                        functions.update('customer_homeowner_master', array1 ,  { latitude: req.body.latitude ,longitude: req.body.longitude } )
                        .then((respo) => {
                            let insArray2 = {
                                user_id : req.decoded.user_id ,
                                residential_id : req.body.residential_id,latitude : req.body.latitude,longitude : req.body.longitude,residential_customer_id : req.body.residential_customer_id,dealer_id : req.decoded.dealer_id,
                                home_owner_id: req.body.customer_id ,
                                first_name : req.body.first_name,
                                last_name : req.body.last_name,
                                created_at : moment().format("YYYY-MM-DD H:mm:ss")
                            };
                            functions.insert('customer_homeowner_history', insArray2 )
                            .then((respo) => {
                            })
                            req.response.status = true;
                            req.response.message = "Home Owner data saved successfully.";
                            //-----------------------
                            let analyarray = { 
                                'dealer_id':req.decoded.dealer_id,
                                'user_id' : req.decoded.user_id,
                                'action_type' : 'confirm_home_owner',
                                'new_value' : insArray2,
                                'action_file':  ''
                            }
                            if(req.headers['source'] != '' && req.headers['source'] != undefined){
                                analyarray['platform'] = 'prospect_web';
                            }else{
                                analyarray['platform'] = 'prospect_ios';
                            }
                            request.post({
                                headers: {'content-type' : 'application/json'},
                                url:     process.env.ANLYTICSURL,
                                body:    JSON.stringify(analyarray)
                            }, function(error, response, body){                                
                            });
                            //-----------------------
                            next();
                        }).catch((err) => {
                            req.response.message = "Oops! something went wrong."+err;
                            next();
                        })
                    }else{
                        let array2 = { 
                            residential_id :req.body.residential_id,
                            latitude: req.body.latitude,
                            longitude : req.body.longitude , 
                            dealer_id : req.decoded.dealer_id,
                            user_id : req.decoded.user_id ,
                            residential_customer_id: req.body.residential_customer_id,
                            home_owner_id: req.body.customer_id,
                            first_name : req.body.first_name,
                            last_name : req.body.last_name    
                        };
                        functions.insert('customer_homeowner_master', array2 )
                        .then((respo) => {
                            let insArray1 = {
                                user_id: req.decoded.user_id ,
                                residential_id : req.body.residential_id,
                                latitude : req.body.latitude,
                                longitude : req.body.longitude,
                                residential_customer_id : req.body.residential_customer_id,
                                dealer_id : req.decoded.dealer_id,
                                home_owner_id: req.body.customer_id  ,
                                first_name : req.body.first_name,
                                last_name : req.body.last_name,
                                created_at: moment().format("YYYY-MM-DD H:mm:ss")
                            };
                            functions.insert('customer_homeowner_history', insArray1 )
                            .then((respo) => {
                            })
                            req.response.status = true;
                            req.response.message = "Home Owner data saved successfully.";

                            //-----------------------
                            let analyarray = { 
                                'dealer_id':req.decoded.dealer_id,
                                'user_id' : req.decoded.user_id,
                                'action_type' : 'confirm_home_owner',
                                'new_value' : insArray1,
                                'action_file':  ''
                            }
                            if(req.headers['source'] != '' && req.headers['source'] != undefined){
                                analyarray['platform'] = 'prospect_web';
                            }else{
                                analyarray['platform'] = 'prospect_ios';
                            }
                            request.post({
                                headers: {'content-type' : 'application/json'},
                                url:     process.env.ANLYTICSURL,
                                body:    JSON.stringify(analyarray)
                            }, function(error, response, body){                                
                            });
                            //-----------------------
                            
                            next();
                            
                        })
                    }
                }).catch((err) => {
                    req.response.message = "Oops! something went wrong.";
                    next();
                })
            } else {
                req.response.message = "Oops! something went wrong.";
                next();
            }
        }
        
    },



    searchByStatus(req, res, next){
        // Use connect method to connect to the server
      
        dealerID = req.decoded.dealer_id;
        MongoClient.connect(mongourl,{ useNewUrlParser: true }, function(err, client) {
            assert.equal(null, err);
            const db = client.db(dbName);
            const collection = db.collection('residential_data_master');
            collection.createIndex({ geometry: "2dsphere" });
            let condition = '';
            if(req.body.status == '1' || req.body.status == 1){
                condition = {
                    'geometry':
                    { 
                        $near:
                         {
                             $geometry: { type: "Point",  coordinates: [parseFloat(req.body.longitude),parseFloat(req.body.latitude)]  },
                             $maxDistance: 1000
                         }
                    },
                    ['dealer.'+dealerID+'.status'] : { $ne: 2 } 
                }
            }else if(req.body.status == '2' || req.body.status == 2 || req.body.status == '3' || req.body.status == 3 || req.body.status == '4' || req.body.status == 4 ||req.body.status == '5' || req.body.status == 5 || req.body.status == '6' || req.body.status == 6 ){
               
                condition = {
                    'geometry':
                    { 
                        $near:
                         {
                             $geometry: { type: "Point",  coordinates: [parseFloat(req.body.longitude),parseFloat(req.body.latitude)]  },
                             $maxDistance: 1000
                         }
                    },
                    ['dealer.'+dealerID+'.status'] : parseInt(req.body.status)
                     
                }
            }else {
                condition = {};
            }
            collection.find( condition ).toArray(function(err, docs) {

                const getData = async (result) => {
                  
                    let retArray = [];
                    for (const num of result) {
                        if(num.dealer == undefined || num.dealer == ''){
                            num.properties.icon = "notcontacted";
                            num.properties.type = "Not Contacted";
                            num.properties.status = 1;
                        }else{
                            if(num.dealer[dealerID] ==  undefined || num.dealer[dealerID] == '' ){
                                num.properties.icon = "notcontacted";
                                num.properties.type = "Not Contacted";
                                num.properties.status = 1;
                            }else{
                                num.properties.icon = num.dealer[dealerID].icon;
                                num.properties.type = num.dealer[dealerID].type;
                                num.properties.status =num.dealer[dealerID].status;
                            }
                        }
                        num.properties = await returnData(num.properties);
                        retArray.push(num);
                    }
                    return retArray;
                }
                const returnData = details => {
                    return new Promise((resolve, reject) => {
                        details.residential_id = details.id;
                        details.latitude = details.Latitude;
                        details.longitude = details.Longitude;
                        resolve(details);
                    });
                }
                getData(docs).then((result) => {
                    let resdata = {};
                    req.response.status = true;
                    resdata.type = 'FeatureCollection';
                    resdata.features = result;
                    req.response.data = resdata;
                    req.response.message = "Success";
                    next();
                })
            })
        });
    },
    
    addNewCustomer(req, res, next){
      
        if (req.decoded.user_id) {
            if(req.body.residential_customer_id != '' && req.body.residential_customer_id != undefined  ){
                let array = { 
                    residential_id : req.body.residential_id, 
                    user_id : req.decoded.user_id, 
                    first_name : req.body.first_name ,
                    last_name : req.body.last_name ,
                    phone_number : req.body.phone_no ,
                    email : req.body.email ,
                    secondory_phone_number : req.body.secondary_phone_no ,
                    address : req.body.address ,
                    state : req.body.state ,
                    city : req.body.city ,
                    zipcode : req.body.zip_code ,
                    latitude : req.body.latitude,
                    longitude : req.body.longitude,
                    Age : req.body.Age,
                    Gender : req.body.Gender,
                    NumMbrs_HH : req.body.NumMbrs_HH,
                    Income_Code : req.body.Income_Code,
                    Length_Of_Residence : req.body.Length_Of_Residence,
                    Own_Rent : req.body.own_Rent,
                    Location_Type_Code : req.body.Location_Type_Code,
                    Home_Size : req.body.Home_Size,
                    WEALTHFINDER_DESCRIPTION : req.body.WEALTHFINDER_DESCRIPTION,
                    dealer_id :req.decoded.dealer_id,
                };
                functions.update('residential_customers',array, { residential_customer_id: req.body.residential_customer_id })
                .then((result) => {
                    req.response.data = req.body;
                    req.response.status = true;
                    req.response.message = "New customer added successfully";
                    next();

                }).catch((err) => {
                    req.response.err = err;
                    req.response.message = "Oops! something went wrong.";
                    next();
                })
            }else{
                let array = { 
                    residential_id : req.body.residential_id, 
                    user_id : req.decoded.user_id, 
                    first_name : req.body.first_name ,
                    last_name : req.body.last_name ,
                    phone_number : req.body.phone_no ,
                    email : req.body.email ,
                    secondory_phone_number : req.body.secondary_phone_no ,
                    address : req.body.address ,
                    state : req.body.state ,
                    city : req.body.city ,
                    zipcode : req.body.zip_code ,
                    latitude : req.body.latitude ,
                    longitude : req.body.longitude,
                    Age : req.body.Age,
                    Gender : req.body.Gender,
                    NumMbrs_HH : req.body.NumMbrs_HH,
                    Income_Code : req.body.Income_Code,
                    Length_Of_Residence : req.body.Length_Of_Residence,
                    Location_Type_Code : req.body.Location_Type_Code,
                    Own_Rent : req.body.own_Rent,
                    Home_Size : req.body.Home_Size,
                    WEALTHFINDER_DESCRIPTION : req.body.WEALTHFINDER_DESCRIPTION,
                    dealer_id :req.decoded.dealer_id,
                    created_at : moment().format("YYYY-MM-DD H:mm:ss")
                };
                functions.insert('residential_customers', array )
                .then((respo) => {
                    req.body.residential_customer_id = respo.insertId;
                    req.response.data = req.body;
                    req.response.status = true;
                    req.response.message = "New customer added successfully";
                    next();
                }).catch((err) => {
                    req.response.err = err;
                    req.response.message = "Oops! something went wrong."+err;
                    next();
                })

            }
            
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },

    getAreas(req, res, next){
        if (req.decoded.user_id) {
            user.getAvailableAreas(req.decoded.user_id,req.decoded.dealer_id)
            .then((result) => {

                const getData = async (result) => {
                    let retArray = [];
                    var polygon = '';
                    //var polygon = [[-74.704689025878906,40.375736236572266],[-74.692970275878906,40.381187438964844],[-74.692970275878906,40.373447418212891],[-74.703506469726562,40.364707946777344],[-74.704689025878906,40.375736236572266]];
                   
                    for (const num of result) {
                        
                        polygon = JSON.parse(num.area_coordinates.substr(1).slice(0, -1));
                      
                        //retArray.push(await returnData(polygon));
                        num.latlng = await returnData(polygon);
                        
                        retArray.push(num);
                    }
                    return result;
                }
                const returnData = details => {

                
                    function Point(x, y) {
                        this.x = x;
                        this.y = y;
                    }
    
                    function Region(points) {
                        this.points = points || [];
                        this.length = points.length;
                    }
    
                    Region.prototype.area = function () {
                        var area = 0,i,j,point1,point2;
                        for (i = 0, j = this.length - 1; i < this.length; j = i, i += 1) {
                            point1 = this.points[i];
                            point2 = this.points[j];
                            area += point1[0] * point2[1];
                            area -= point1[1] * point2[0];
                        }
                        area /= 2;
                        return area;
                    };
    
                    Region.prototype.centroid = function () {
                    var x = 0,y = 0,i,j,f,point1,point2;
        
                        for (i = 0, j = this.length - 1; i < this.length; j = i, i += 1) {
                          
                            point1 = this.points[i];
                            point2 = this.points[j];
                            f = point1[0] * point2[1] - point2[0] * point1[1];
                            x += (point1[0] + point2[0]) * f;
                            y += (point1[1] + point2[1]) * f;
                        }
        
                        f = this.area() * 6;
        
                        return new Point(x / f, y / f);
                    };

                    let insArray = '';
                    return new Promise((resolve, reject) => {
                     
                        region = new Region(details);
                        insArray=region.centroid();
                        
                        resolve(insArray);
                    });
                }
                getData(result).then((result) => {
                    req.response.status = true;
                    if(result.length != 0)
                        req.response.data = result;
                    else
                        req.response.data = [];
                    req.response.message = "Success";
                    next();
                })
           






               
            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
       
    },
    getAvailableAreas(req, res, next){
        if (req.decoded.user_id) {
            user.getAvailableAreas(req.body.user_id,req.decoded.dealer_id)
            .then((result) => {

                //--------------
                const getData = async (result) => {
                    let retArray = [];
                    var polygon = '';
                    //var polygon = [[-74.704689025878906,40.375736236572266],[-74.692970275878906,40.381187438964844],[-74.692970275878906,40.373447418212891],[-74.703506469726562,40.364707946777344],[-74.704689025878906,40.375736236572266]];
                   
                    for (const num of result) {
                        
                        polygon = JSON.parse(num.area_coordinates.substr(1).slice(0, -1));
                      
                        //retArray.push(await returnData(polygon));
                        num.latlng = await returnData(polygon);
                        
                        retArray.push(num);
                    }
                    return result;
                }
                const returnData = details => {

                
                    function Point(x, y) {
                        this.x = x;
                        this.y = y;
                    }
    
                    function Region(points) {
                        this.points = points || [];
                        this.length = points.length;
                    }
    
                    Region.prototype.area = function () {
                        var area = 0,i,j,point1,point2;
                        for (i = 0, j = this.length - 1; i < this.length; j = i, i += 1) {
                            point1 = this.points[i];
                            point2 = this.points[j];
                            area += point1[0] * point2[1];
                            area -= point1[1] * point2[0];
                        }
                        area /= 2;
                        return area;
                    };
    
                    Region.prototype.centroid = function () {
                    var x = 0,y = 0,i,j,f,point1,point2;
        
                        for (i = 0, j = this.length - 1; i < this.length; j = i, i += 1) {
                          
                            point1 = this.points[i];
                            point2 = this.points[j];
                            f = point1[0] * point2[1] - point2[0] * point1[1];
                            x += (point1[0] + point2[0]) * f;
                            y += (point1[1] + point2[1]) * f;
                        }
        
                        f = this.area() * 6;
        
                        return new Point(x / f, y / f);
                    };

                    let insArray = '';
                    return new Promise((resolve, reject) => {
                     
                        region = new Region(details);
                        insArray=region.centroid();
                        
                        resolve(insArray);
                    });
                }
                getData(result).then((resultNew) => {
                    req.response.status = true;
                    if(resultNew.length != 0){
                        req.response.data.areas = resultNew;
                    }
                    else
                        req.response.data.areas = [];
                    req.response.message = "Success";
                    next();
                })
                //--------------
                
                
            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
       
    },
    getManagerAreas(req, res, next){
        if (req.decoded.user_id) {
            user.getManagerAreas(req.decoded.user_id,req.decoded.dealer_id,req.decoded.office_id,req.decoded.region_id,req.decoded.division_id,req.decoded.user_type )
            .then((result) => {


                const getData = async (result) => {
                    let retArray = [];
                    var polygon = '';
                    //var polygon = [[-74.704689025878906,40.375736236572266],[-74.692970275878906,40.381187438964844],[-74.692970275878906,40.373447418212891],[-74.703506469726562,40.364707946777344],[-74.704689025878906,40.375736236572266]];
                   
                    for (const num of result) {
                        
                        polygon = JSON.parse(num.area_coordinates.substr(1).slice(0, -1));
                      
                        //retArray.push(await returnData(polygon));
                        num.latlng = await returnData(polygon);
                        
                        retArray.push(num);
                    }
                    return result;
                }
                const returnData = details => {

                
                    function Point(x, y) {
                        this.x = x;
                        this.y = y;
                    }
    
                    function Region(points) {
                        this.points = points || [];
                        this.length = points.length;
                    }
    
                    Region.prototype.area = function () {
                        var area = 0,i,j,point1,point2;
                        for (i = 0, j = this.length - 1; i < this.length; j = i, i += 1) {
                            point1 = this.points[i];
                            point2 = this.points[j];
                            area += point1[0] * point2[1];
                            area -= point1[1] * point2[0];
                        }
                        area /= 2;
                        return area;
                    };
    
                    Region.prototype.centroid = function () {
                    var x = 0,y = 0,i,j,f,point1,point2;
        
                        for (i = 0, j = this.length - 1; i < this.length; j = i, i += 1) {
                          
                            point1 = this.points[i];
                            point2 = this.points[j];
                            f = point1[0] * point2[1] - point2[0] * point1[1];
                            x += (point1[0] + point2[0]) * f;
                            y += (point1[1] + point2[1]) * f;
                        }
        
                        f = this.area() * 6;
        
                        return new Point(x / f, y / f);
                    };

                    let insArray = '';
                    return new Promise((resolve, reject) => {
                     
                        region = new Region(details);
                        insArray=region.centroid();
                        
                        resolve(insArray);
                    });
                }
                getData(result).then((result) => {
                    req.response.status = true;
                    if(result.length != 0)
                        req.response.data = result;
                    else
                        req.response.data = [];
                    req.response.message = "Success";
                    next();
                })
           

            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
       
    },

    getStates(req, res, next){
        if (req.decoded.user_id) {
            functions.get('state_master', { "is_customer_allow": "Y" })
            .then((result) => {
                req.response.data = result;
                req.response.status = true;
                req.response.message = "Success";
                next();
            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },

    searchByAddress(req, res, next){
        let tableName = '';
        if(req.body.location != undefined && req.body.location != ''){
            if(residentialTableArray[req.body.location] != '' && residentialTableArray[req.body.location] != undefined){
                tableName = residentialTableArray[req.body.location];
            }else{
                tableName = 'residential_data_nj';
            }
        }else{
            tableName = 'residential_data_nj'; 
        }

        // let tableName ='';
        // if(req.body.location != undefined && req.body.location != ''){
        //     if(req.body.location == 'NJ'){
        //         tableName = 'residential_data_nj';
        //     }else if(req.body.location == 'IL'){
        //         tableName = 'residential_data_il';
        //     }else if(req.body.location == 'CA'){
        //         tableName = 'residential_data_ca';
        //     }else if(req.body.location == 'CT'){
        //         tableName = 'residential_data_ct';
        //     }else if(req.body.location == 'MA'){
        //         tableName = 'residential_data_ma';
        //     }else if(req.body.location == 'NY'){
        //         tableName = 'residential_data_ny';
        //     }else if(req.body.location == 'RI'){
        //         tableName = 'residential_data_ri';
        //     }else if(req.body.location == 'NV'){
        //         tableName = 'residential_data_nv';
        //     }else if(req.body.location == 'AZ'){
        //         tableName = 'residential_data_az';
        //     }else if(req.body.location == 'TX'){
        //         tableName = 'residential_data_tx';
        //     }else{
        //         tableName = 'residential_data_nj';
        //     }
        // }else{
        //     tableName = 'residential_data_nj';
        // }

        if (req.decoded.user_id) {
           
            MongoClient.connect(mongourl,{ useNewUrlParser: true }, function(err, client) {
                assert.equal(null, err);
                const db = client.db(dbName);
                const collection = db.collection(tableName);
                collection.find(
                    { 'properties.Address': new RegExp(req.body.keyword, 'i') ,
                        $or: [{
                            'properties.dealer_id': {
                                $eq: req.decoded.dealer_id
                            }
                        },
                        {
                            'properties.dealer_id': {
                                $exists: false
                            }
                        },
                        {
                            'properties.dealer_id': {
                                    $eq: 0
                            }
                        }],
                    },
                    { 
                        projection: {
                            'properties.consumer_id':1,'properties.Latitude':1, 'properties.Longitude':1,
                        _id:0,'properties.Address':1,'properties.City':1,'properties.State':1
                        } 
                    },
                 ).limit(50).toArray(function(err, docs) {
                  
                    req.response.data = docs;
                    req.response.status = true;
                    req.response.message = "Success";
                    next();
                    
                })
            });

            
            // user.searchByAddress(req.body.keyword,tableName)
            // .then((result) =>{
            //     req.response.data = result;
            //     req.response.status = true;
            //     req.response.message = "Success";
            //     next();
            // }).catch((err) => {
            //     req.response.message = "Oops! something went wrong.";
            //     next();
            // })

            
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },

    test(req, res, next){
        var first_name = 'Christopher';
        var last_name = 'Walker';
        functions.get('customer_master', { "email": 'asd@asd.com'  })
        .then((result) => {
            if(result.length > 0){
                console.log("hhaa");
                if(first_name == result[0].first_name && last_name == result[0].last_name){
                    console.log("hhaa");
                    req.response.data = result[0];
                    req.response.status = true;
                    req.response.message = "Success";
                    next();
                }else{
                    req.response.status = false;
                    req.response.message = "Email already exist.";
                    next();
                }
            }else{
                req.response.status = false;
                req.response.message = "Email already exist.";
                next();
            }
        }).catch((err) => {
            next();
        })
    },

    addAnalytics(req, res, next){
        if (req.decoded.user_id) {
            //console.log(req.headers['source']);
            let array = { 
                'dealer_id':req.decoded.dealer_id,
                'user_id' : req.decoded.user_id,
                'action_type' : 'user login',
                'new_value' : '',
                'action_file':  ''
            }
            if(req.headers['source'] != '' && req.headers['source'] != undefined){
                array['platform'] = 'prospect_web';
            }else{
                array['platform'] = 'prospect_ios';
            }
           // console.log(JSON.stringify(array));
            request.post({
                headers: {'content-type' : 'application/json'},
                //url:     'http://10.10.10.39:3000/users/test',
                url:     process.env.ANLYTICSURL,
                body:    JSON.stringify(array)
                
            }, function(error, response, body){
                //console.log(body);
            });
            //request(process.env.ANLYTICSURL, function (error, response, body) {})
            req.response.status = true;
            req.response.message = "Success";
            next();
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },
    analaytics(req, res, next){
        let platform = '';
        if(req.headers['source'] != '' && req.headers['source'] != undefined){
            platform = 'prospect_web';
        }else{
            platform = 'prospect_ios';
        }
       
        if(req.body.type == 'open'){
            let logArray = {
                dealer_id:req.decoded.dealer_id,
                user_id : req.decoded.user_id,
                session_id  : req.headers['authtoken'],
                login_time : moment().format("YYYY-MM-DD H:mm:ss") ,
                ip_address  :  req.body.ipAddress,
                browser : req.body.browser,
                platform : platform
            };
            if(req.headers['source'] != '' && req.headers['source'] != undefined){
                logArray['browser'] = req.body.browser;
            }else{
                logArray['browser'] = req.body.deviceName+'('+req.body.osVersion+')';
            }

            

            // functions.insert('user_login_collection', logArray )
            // .then(() => {
            // })

            let result = {
                'dealer_id':req.decoded.dealer_id,
                'user_id' : req.decoded.user_id,
                'session_id' : req.headers['authtoken'],
                'ip_address' :  req.body.ipAddress,
                'deviceName' :  req.body.deviceName,
                'osVersion' :  req.body.osVersion,
                'browser' : req.body.browser,
                'login_time':  moment().format("YYYY-MM-DD H:mm:ss")
            };
            let analyloginarray = { 
                'dealer_id':req.decoded.dealer_id,
                'user_id' : req.decoded.user_id,
                'action_type' : 'user_login',
                'new_value' : result,
                'action_file':  ''
            }
            if(req.headers['source'] != '' && req.headers['source'] != undefined){
                analyloginarray['platform'] = 'prospect_web';
            }else{
                analyloginarray['platform'] = 'prospect_ios';
            }
           
            request.post({
                headers: {'content-type' : 'application/json'},
                url:     process.env.ANLYTICSURL,
                body:    JSON.stringify(analyloginarray)
            }, function(error, response, body){                                
            });
        }else{

            functions.get('user_login_collection', { "session_id": req.headers['authtoken'] })
            .then((loginData) => {
                let curtime = moment().format("YYYY-MM-DD H:mm:ss");
                if (loginData) {
                    console.log(loginData);
                    var x = new moment();
                    var y = new moment('2018-08-22 10:10:10')
                    var duration = moment.duration(x.diff(loginData[0].login_time)).as('seconds');
                    

                    let result2 = {
                        'dealer_id':req.decoded.dealer_id,
                        'user_id' : req.decoded.user_id,
                        'session_id' : req.headers['authtoken'],
                        'ip_address' :  req.body.ipAddress,
                        'deviceName' :  req.body.deviceName,
                        'osVersion' :  req.body.osVersion,
                        'browser' : req.body.browser,
                        'duration':duration,
                        'logout_time':moment().format("YYYY-MM-DD H:mm:ss"),
                        'login_time': loginData[0].login_time
                    };
                   
                    if(req.headers['source'] != '' && req.headers['source'] != undefined){
                        result2['platform'] = 'prospect_web';
                    }else{
                        result2['platform'] = 'prospect_ios';
                        result2['browser'] = req.body.deviceName+'('+req.body.osVersion+')';
                    }
                    let analylogoutarray = { 
                        'dealer_id':req.decoded.dealer_id,
                        'user_id' : req.decoded.user_id,
                        'action_type' : 'user_logout',
                        'new_value' : result2,
                        'action_file':  ''
                    }
                    if(req.headers['source'] != '' && req.headers['source'] != undefined){
                        analylogoutarray['platform'] = 'prospect_web';
                    }else{
                        analylogoutarray['platform'] = 'prospect_ios';
                    }

                    // functions.delete('user_login_collection', { "session_id": req.headers['authtoken'] })
                    // .then((resu) => {
                    // })
                    
                    request.post({
                        headers: {'content-type' : 'application/json'},
                        url:     process.env.ANLYTICSURL,
                        body:    JSON.stringify(analylogoutarray)
                    }, function(error, response, body){                                
                    });
                }
            });

            
        }
        
        
        req.response.status = true;
        req.response.message = "Success";
        next();
    },

    checkAssignedRepslist(req, res, next){
        if (req.decoded.user_id) {
            user.getAssignedRepslist(req.body.area_id)
            .then((result) => {
                console.log(result.length);
                if(result.length > 0){
                    next();
                }else{
                    functions.update('manager_regions', { "status":'N'}, { area_id: req.body.area_id })
                    .then((result) => {
                    });
                    next();
                }
                
            }).catch((err) => {
                next();
            })
        } else {
            next();
        }
    },

    checkUserIsBlockedOrNot(req, res, next){
        if (req.decoded.user_id) {
            functions.get('user_master', { "user_id": req.decoded.user_id })
            .then((result) => {
                if (result) {
                    req.response.datas = result
                }
            });
        } else {
            next();
        }
    },

    checkOppEmailExistOrNot(req, res, next){
        console.log(req.body);
        var first_name = req.body.first_name;
        var last_name = req.body.last_name;
        functions.get('customer_master', { "email": req.body.email  })
        .then((result) => {
            if(result.length > 0){
                if(first_name == result[0].first_name && last_name == result[0].last_name){
                    req.response.status = true;
                    next();
                }else{
                    req.response.status = false;
                    req.response.message = "Email already exist.";
                    next();
                }
            }else{
                req.response.status = true;
                req.response.message = "";
                next();
            }
        }).catch((err) => {
            next();
        })
    
    },

    //--------------------------------------------------------------


    
    prospectKeyLogin(req, res, next) {

        let date_time=moment('2020-01-21 12:30:00', 'YYYY-MM-DD H:mm:ss').format('MMMM Do YYYY, h:mm a');
        console.log(date_time);
        if (!req.body.login_token) {
            req.response.message = "Token is required.";
            next();
        }else {
            user.getUserDetailsForLoginByToken(req.body.login_token).then((result) => {
                if (result.length) {
                    if(result[0].dealeractive == 'Y'){
                        if(result[0].prospect_active == 'Y'){
                            if(result[0].verticalscount > 0){
                                if(result[0].active == 'Y'){
                                    req.response.user_id = result[0].user_id;
                                    var newtoken = jwt.sign({ "email": result[0].email, "user_id": result[0].user_id ,"office_id" : result[0].office_id , "region_id" : result[0].region_id , "division_id" : result[0].division_id, "dealer_id" : result[0].dealer_id , "user_type" : result[0].user_type ,"first_name": result[0].first_name,"last_name": result[0].last_name,"phone": result[0].phone,version : parseInt(process.env.VERSION)
                                    }, config.jwt_secret, {
                                        expiresIn: "6h"
                                    });
                                    var newrefreshtoken = jwt.sign({ "email": result[0].email, "user_id": result[0].user_id ,"office_id" : result[0].office_id , "region_id" : result[0].region_id , "division_id" : result[0].division_id, "dealer_id" : result[0].dealer_id ,"user_type" : result[0].user_type,"first_name": result[0].first_name,"last_name": result[0].last_name,"phone": result[0].phone, version : parseInt(process.env.VERSION) }, config.jwt_secret, {
                                        expiresIn: "12h"
                                    });
                                    res.setHeader('AuthToken', newtoken)
                                    res.setHeader('RefreshToken', newrefreshtoken)
                                   
                                    delete result[0].password;
                                    
                                    result[0].distance = (process.env.DISTANCE * 50)/100000 ;
                                    req.response.data = result[0];
                                
                                    req.response.status = true;
                                    req.response.message = "Logged In Successfully.";
                                    next();
                                    
                                }else{
                                    req.response.message = "You are blocked by admin.";
                                    next();
                                }
                            }else{
                                req.response.message = "No vertcals are enabled for this dealer.";
                                next();
                            }
                        }else{
                            req.response.message = "Prospect is not activated for this dealer.";
                            next();
                        }
                    }else{
                        req.response.message = "This dealer is blocked by Super Admin.";
                        next();
                    }
                } else {
                    req.response.message = "Incorrect login credentials. Please retry.";
                    next();
                }
            }).catch((err) => {
                req.response.message = err + "Oops! something went wrong.";
                next();
            })
        }

    },


    getTimeZoneList(req, res, next){
        if (req.decoded.user_id) {
            functions.get('time_zones', { "status": "Y" })
            .then((result) => {
                req.response.data = result;
                req.response.status = true;
                req.response.message = "Success";
                next();
            }).catch((err) => {
                req.response.message = "Oops! something went wrong.";
                next();
            })
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },


    momentTest(req, res, next) {

        let timezoneArray = {
            'EST' : "America/New_York",
            'CST' : "America/Chicago",
            'MST' : "America/Boise",
            'PST' : "America/Los_Angeles",
        }
        req.body.timezone = 'EST';
        let local_date = '2020-01-21 09:00:00';
        let timezone = '';
        if(timezoneArray[req.body.timezone] != '' && timezoneArray[req.body.timezone] != undefined){
            timezone = timezoneArray[req.body.timezone];
        }else{
            timezone = 'UTC';
        }
        if(timezone != 'UTC'){
            var a = moment.tz(local_date, timezone);
            console.log(a.format('MMMM Do YYYY, h:mm a'));
            a.format(); // 2013-11-18T11:55:00+08:00
            a.utc().format(); // 2013-11-18T03:55Z
            console.log(a.utc().format('MMMM Do YYYY, h:mm a'));
            console.log(a.utc().format('YYYY, MM, DD, H, mm'));

            
        }else{

        }
        console.log(timezone);
        
        //console.log(b);

        req.response.status = true;
        next();
        

    },

    updateCustomerWithLatLong(req, res, next){

        user.getCustomersWithNoLatitude()
        .then((result) => {
            if (result.length > 0) {

                const example = async () => {
                    for (const num of result) {
                        await returnNum(num);
                    }
                    return result;
                }
                const returnNum = details => {
                    return new Promise((resolve, reject) => {
                        //console.log(details);
                        functions.get('consumer_data_tx', { "consumer_id":details.residential_id })
                        .then((result) => {
                            //console.log(result[0].Latitude);
                            functions.update('customer_master', { latitude: result[0].Latitude , longitude: result[0].Longitude }, { residential_id: details.residential_id,state:'TX' })
                            .then((resu) => {
                                resolve(details);
                            }).catch((err) => {
                                resolve(details);
                            })
                            //resolve(details);

                        }).catch((err) => {
                            resolve(details);
                        })
                    });
                }

                example(result).then((result) => {
                    req.response.data = result;
                    req.response.status = true;
                    req.response.message = "Success";
                    next();
                })

               
            }else{
                req.response.status = false;
                req.response.message = "No Records";
                next();
            }
        }).catch((err) => {
            req.response.message = "Oops! something went wrong."+err;
            next();
        })
    
    },
    getDealerInfo(req, res, next){
        console.log("heeeeeeee");
        functions.get('dealer_master', { "dealer_id": req.decoded.dealer_id })
        .then((resu) => {
            //console.log(resu);
            req.response.dealer_name = resu[0].dealer_name
            next();
        }).catch((err) => {
            next();
        })
       
    },
    deleteNotes(req, res, next) {
        if (req.decoded.user_id) {
            if (!req.body.note_id) {
                req.response.message = "Note Id is required.";
                next();
            } else {
                functions.delete('customer_notes',{ id: req.body.note_id })
                .then((resu) => {
                    req.response.status = true;
                    req.response.message = "Notes deleted.";
                    next();
                }).catch((err) => {
                    // console.log(err);
                    req.response.message = "Oops! something went wrong.";
                    next();
                })

                // functions.update('customer_notes', { deleted_at: moment().format("YYYY-MM-DD H:mm:ss") }, { id: req.body.note_id })
                //     .then((result) => {
                //         // console.log(result);
                //         req.response.status = true;
                //         req.response.message = "Notes deleted.";
                //         next();
                //     }).catch((err) => {
                //         // console.log(err);
                //         req.response.message = "Oops! something went wrong.";
                //         next();
                //     })

            }
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },

}

module.exports = handler;
