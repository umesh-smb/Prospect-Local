var multer = require('multer');
var path = require('path');
var crypto = require('crypto');
var fs = require('fs');
const AWS = require('aws-sdk')

var config = require("../server/config");

var fc_imagepath = 'public/uploads/files/';
var base_imagepath = 'uploads/files/';

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, fc_imagepath)
    },
    filename: function (req, file, cb) {
        var expt = file.originalname.split(".");
        crypto.pseudoRandomBytes(16, function (err, raw) {
            cb(null, raw.toString('hex') + Date.now() + "." + expt[1]);
        });
    }
});
var file_helper = {
    upload: multer({ storage: storage })
    , s3_upload: (req, res, next) => {
        if (req.file != undefined) {
            // console.log(req.file.originalname);
            fs.readFile(req.file.path, function (err, data) {
                if (err) throw err;
                var params = {
                    Key: req.file.filename, //file.name doesn't exist as a property
                    Body: data,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype
                };
                if (req.file.mimetype == 'video/mp4' || req.file.mimetype == 'video/mov' || req.file.mimetype == 'video/quicktime' ) {
                    var s3bucket = new AWS.S3({ params: { Bucket: config.video_bucket_name } });
                } else {
                    var s3bucket = new AWS.S3({ params: { Bucket: config.file_bucket_name } });
                }

                s3bucket.upload(params, function (err, data) {
                    //   console.log("PRINT FILE:", file);
                    if (err) {
                        console.log('ERROR MSG: ', err);
                        req.response.message = err;
                        req.response.status = false;
                        res.json(req.response);
                    } else {
                        console.log('Successfully uploaded data');
                        req.body['file'] = req.file.filename;
                        req.body['file_name'] = req.file.originalname;
                        fs.unlinkSync(req.file.path);
                        next();
                    }

                });

            })
        } else {
            console.log("ss");
            next();
        }
    }
    , s3_base64_upload: (req, res, next) => {
        var post = req.body;
        if (post.image_base64 != '' && post.image_base64 != undefined) {

            crypto.pseudoRandomBytes(16, function (err, raw) {
                var base64result = req.body.image_base64.split(',');
                console.log(base64result[0]);
                post['image'] = raw.toString('hex') + Date.now() + "_" + ".jpg";
                var buf = new Buffer(base64result[1].replace(/^data:image\/\w+;base64,/, ""), 'base64')
                var params = {
                    Key: post['image'], //file.name doesn't exist as a property
                    Body: buf,
                    ACL: 'public-read',
                    ContentEncoding: 'base64',
                    ContentType: 'image/jpeg'
                };
                var s3bucket = new AWS.S3({ params: { Bucket: config.image_bucket_name } });
                s3bucket.upload(params, function (err, data) {
                    if (err) {
                        console.log('ERROR MSG: ', err);
                        post['image'] = '';
                    } else {
                        console.log('Successfully uploaded data');
                    }
                    next();
                });
            })
        } else {
            post['image'] = '';
            next();
        }
    }
};

module.exports = file_helper;