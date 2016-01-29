var express = require('express');
var request = require('request');
var credentials = require('../credentials');
var router = express.Router();

/* GET thumb card listing. */
router.get('/:image_url/thumb/:image_name', function(req, res, next) {
    var AWS = require('aws-sdk');
    AWS.config.update({
        accessKeyId: credentials.aws_access_key_id,
        secretAccessKey: credentials.aws_secret_access_key,
        "region": "ap-northeast-2"
    });

    // bucket info & file info
    var bucketName = 'indegs-image-storage';
    var keyName = 'thumb/images/'+req.params.image_url;

    var s3 = new AWS.S3();

    res.writeHead(200, {'Content-Type': 'image/*' });
    s3.getObject({
        Bucket: bucketName,
        Key: keyName,
    }).createReadStream().pipe(res);
});

/* GET card listing. */
router.get('/:image_url/:image_name', function(req, res, next) {

    var AWS = require('aws-sdk');
    AWS.config.update({
        accessKeyId: credentials.aws_access_key_id,
        secretAccessKey: credentials.aws_secret_access_key,
        "region": "ap-northeast-2"
    });

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

