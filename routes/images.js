var express = require('express');
var request = require('request');
var credentials = require('../credentials');
var router = express.Router();

/* GET card listing. */
router.get('/:image_url/:image_name', function(req, res, next) {

    var AWS = require('aws-sdk');
    AWS.config.region = 'ap-northeast-2';

    // bucket info & file info
    var bucketName = 'indegs-image-storage';
    var keyName = 'images/'+req.params.image_url;

    var s3 = new AWS.S3();

    res.writeHead(200, {'Content-Type': 'image/*' });
    s3.getObject({
        Bucket: bucketName,
        Key: keyName,
    }).createReadStream().pipe(res);
});

module.exports = router;

