var express = require('express');
var router = express.Router();
var config = require('.././server/config');
var functions = require('.././server/functions');
var file_helper = require('.././helpers/file_helper');

router.use((req, res, next) => {
    var function_name = req.url.split("?");
    req.response = {
        function: function_name[0].replace("/", ""),
        status: true,
        message: '',
        data: {}
    };
    res.header("authorization", false);
    res.header("new-token", false);
    next();
})
router.post('/s3_base64_upload', file_helper.s3_base64_upload, (req, res, next) => {
    req.response.data['image'] = req.response.data['image'] = config.s3_url + config.image_bucket_name + "/" + req.body.image;
    res.json(req.response);
})

router.post('/s3_upload', file_helper.upload.single('file'), file_helper.s3_upload, (req, res, next) => {
    var post = req.body;
    var data = {};
    if (post.file != '' && post.file != undefined) {
        var file_expo = post.file.split(".");

        if (file_expo[1] == 'mp4' || file_expo[1] == 'mov') {
            //  data['image_url'] = config.s3_url + config.image_bucket_name + "/thumbnails/" + file_expo[0] + "-00001.jpg";
            data['image_url'] = config.s3_url + config.image_bucket_name + "/thumbnails/" + file_expo[0] + "-00001.jpg";
            data['file'] = config.s3_url + config.video_bucket_name + "/" + post.file;
            data['type'] = 'video';
        } else {
            //    data['image_url'] = config.s3_url + config.file_bucket_name + "/thumbnails/" + file_expo[0] + ".jpg";
            //    data['image_url'] = config.s3_url + config.file_bucket_name + "/" + file_expo[0] + ".jpg";
            data['image_url'] = config.s3_url + config.file_bucket_name + "/" + post.file;
            data['file'] = config.s3_url + config.file_bucket_name + "/" + post.file;
            if (file_expo[1] == 'pdf') {
                data['type'] = 'pdf';
            } else {
                data['type'] = 'image'
            }

        }

        data['size'] = req.file.size;
        req.response.data = data;
    }
    res.json(req.response);
})

module.exports = router;