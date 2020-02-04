let express = require('express');
app = express();
service = require('.././models/serviceModel');
functions = require('../helpers/functions');
config = require('.././server/config');
const assert = require('assert');
var request = require('request');
moment = require('moment');
var md5 = require('md5');
const zlib = require('zlib');

var fs = require('fs');
var parseString = require('xml2js').parseString;


let handler = {

    index(req, res, next) {
        next();
    },




    getGuides(req, res, next) {

        if (req.decoded.user_id) {
            service.getGuides(req.decoded.user_type, req.body.platform, req.body.category_id, req.body.search_key)
                .then((result) => {
                    //return result;
                    req.response.data = result;
                    req.response.status = true;
                    req.response.message = "Success";
                    next();
                }).catch((err) => {
                    console.log("err", err);
                    req.response.message = "Oops! something went wrong.";
                    next();
                })
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },

    getGuideCategories(req, res, next) {

        if (req.decoded.user_id) {
            service.getGuideCategories()
                .then((result) => {
                    req.response.data = result;
                    req.response.status = true;
                    req.response.message = "Success";
                    next();
                }).catch((err) => {
                    console.log("err", err);
                    req.response.message = "Oops! something went wrong.";
                    next();
                })
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },

    createTicket(req, res, next) {
        //console.log(req.body);
        let ticket_info = {};
        if (req.decoded.user_id) {

            service.getTicketCode()
                .then((ticketCode) => {

                    let insert_data = {
                        user_id: req.decoded.user_id,
                        title: req.body.title,
                        description: req.body.description,
                        filename: req.body.imagename,
                        file: req.body.file,
                        image_url: req.body.image_url,
                        // file_type : req.body.type,
                        platform: req.body.platform,
                        ticket_code: ticketCode[0].ticket_code,
                        created_at: moment().format("YYYY-MM-DD H:mm:ss"),
                        updated_at: moment().format("YYYY-MM-DD H:mm:ss"),
                    };
                    if (req.body.type != undefined && req.body.type != '' && req.body.type != null) {
                        insert_data.file_type = req.body.type;
                    }
                    return functions.insert('ticket_master', insert_data);
                })


            .then((result) => {
                    req.response.data = {};
                    req.response.status = true;
                    req.response.message = "Ticket posted successfully.";
                    // next();
                    return service.getTicketUser(result.insertId);
                })
                .then((ticket_user) => {
                    ticket_info = ticket_user[0];
                    console.log(ticket_info);
                    // return  functions.get('general_emails', { "name": 'ticket_notification_email'});
                    functions.get('general_emails', { "name": 'ticket_notification_email' }).then((result1) => {
                        if (result1.length > 0) {
                            functions.get('general_config', { 'field': 'ticket_notification_email' }).then((result2) => {
                                let email_template = result1[0].email_template;

                                var email_subject = result1[0].email_subject.replace('##APPNAME##', 'prospect+');

                                email_template = email_template.replace("##NAME##", ticket_info.first_name + ' ' + ticket_info.last_name);
                                email_template = email_template.replace("##title##", ticket_info.title);
                                email_template = email_template.replace("##code##", ticket_info.ticket_code);
                                email_template = email_template.replace("##platform##", ticket_info.platform);
                                email_template = email_template.replace("##description##", ticket_info.description);

                                if (result2.length > 0) {
                                    let emails = result2[0].value.split(',');
                                    for (let i = 0; i < emails.length; i++) {
                                        var file_url = "";
                                        functions.sendMail(emails[i], email_subject, email_template, false, file_url, '',function(emailres) {
                                            if (emailres && emailres.status != undefined && emailres.status == 'success') {
                                                let array = {
                                                    type: 'email',
                                                    to: emails[i],
                                                    message: email_template,
                                                    attachments: file_url,
                                                    subject: email_subject,
                                                    message_type: "new_ticket",
                                                    from_email: emailres.from_email,
                                                    from_name: emailres.from_name,
                                                    created_at: moment().format("YYYY-MM-DD H:mm:ss"),
                                                    updated_at: moment().format("YYYY-MM-DD H:mm:ss")
                                                };
                                                functions.insert('log', array)
                                            }


                                        })
                                        if (i == emails.length - 1) {
                                            //req.response.status = true;
                                            //req.response.message = "Feedback send successfully.";
                                            next();
                                        }
                                    }
                                }
                            })
                        }
                    })
                })

            .catch((err) => {
                console.log("err", err);
                req.response.message = "Oops! something went wrong.";
                next();
            })
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },

    getTickets(req, res, next) {
        console.log("getTickets body==", req.body);
        let tickets_list = [];
        if (req.decoded.user_id) {
            console.log("getTickets user==", req.decoded);
            service.getTickets(req.decoded.user_id, req.body.search_key)
                .then((result) => {
                    tickets_list = result;


                    // req.response.data =result;
                    // req.response.status = true;
                    // req.response.message = "Success";
                    // req.response.total = result.length;
                    // next();
                    return service.getTicketsCount(req.decoded.user_id);
                })
                .then((count) => {
                    console.log(count);
                    req.response.data = tickets_list;
                    req.response.status = true;
                    req.response.message = "Success";
                    req.response.total = count[0].ticket_count;
                    next();
                }).catch((err) => {
                    console.log("err", err);
                    req.response.message = "Oops! something went wrong.";
                    next();
                })
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },
    getComments(req, res, next) {
        if (req.decoded.user_id) {
            service.getComments(req.body.ticket_id)
                .then((result) => {
                    req.response.data = result;
                    req.response.status = true;
                    req.response.message = "Success";
                    next();
                }).catch((err) => {
                    console.log("err", err);
                    req.response.message = "Oops! something went wrong.";
                    next();
                })
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },
    postComment(req, res, next) {
        if (req.decoded.user_id) {

            let insert_data = {
                user_id: req.decoded.user_id,
                comment: req.body.comment,
                ticket_id: req.body.ticket_id,
                created_at: moment().format("YYYY-MM-DD H:mm:ss"),
                updated_at: moment().format("YYYY-MM-DD H:mm:ss"),
            };
            functions.insert('ticket_comments', insert_data)
                .then((inserted) => {
                    console.log(inserted);
                    return service.getComment(inserted.insertId);

                    // req.response.data ={};
                    // req.response.status = true;
                    // req.response.message = "Success";
                    // next();
                })
                .then((result) => {
                    req.response.data = result[0];
                    req.response.status = true;
                    req.response.message = "Success";
                    next();
                })
                .catch((err) => {
                    console.log("err", err);
                    req.response.message = "Oops! something went wrong.";
                    next();
                })
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },
    getOpptyStatus(req, res, next) {
        if (req.decoded.user_id) {
            service.getOppty(req.decoded.dealer_id)
                .then((result) => {
                    //return result;
                    req.response.data = result[0];
                    req.response.status = true;
                    req.response.message = "Success";
                    next();
                }).catch((err) => {
                    console.log("err", err);
                    req.response.message = "Oops! something went wrong.";
                    next();
                })
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },
    getAppointmentDetails(req, res, next) {
        if (req.decoded.user_id) {
            if (!req.body.appointment_id) {
                req.response.message = "Appointment Id is required.";
                next();
            } else {

                service.getAppointment(req.body.appointment_id)
                    .then((result) => {
                        // console.log(result);
                        req.response.status = true;
                        if (result.length != 0)
                            req.response.data = result;
                        else
                            req.response.data = {};
                        req.response.message = "Success";
                        next();
                    }).catch((err) => {
                        // console.log(err);
                        req.response.message = "Oops! something went wrong.";
                        next();
                    })

            }
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },

    deleteAppointment(req, res, next) {
        if (req.decoded.user_id) {
            if (!req.body.appointment_id) {
                req.response.message = "Appointment Id is required.";
                next();
            } else {

                functions.update('customer_appointments', { deleted_at: moment().format("YYYY-MM-DD H:mm:ss") }, { id: req.body.appointment_id })
                    .then((result) => {
                        // console.log(result);
                        req.response.status = true;
                        req.response.message = "Appointment deleted.";
                        next();
                    }).catch((err) => {
                        // console.log(err);
                        req.response.message = "Oops! something went wrong.";
                        next();
                    })

            }
        } else {
            req.response.message = "Oops! something went wrong.";
            next();
        }
    },


}

module.exports = handler;