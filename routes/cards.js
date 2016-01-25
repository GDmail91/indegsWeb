var express = require('express');
var request = require('request');
var credentials = require('../credentials');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    var data = {
        'startId': req.query.startId,
        'term': req.query.term
    };

    request.get({
        url: credentials.api_server + '/cards',
        form: data,
    }, function(err, httpResponse, body) {
        var getObj = JSON.parse(body);

        console.log('로그인상태: '+req.session.isLogin);
        console.log('사용자정보: '+req.session.userinfo.useremail+', '+req.session.userinfo.username);

        if(getObj.status || !err) {
            res.statusCode = httpResponse.statusCode;
            //res.render('cards', getObj);
            res.render('main', { title: 'Main Page', host: credentials.host_server, cards: getObj.data });
        } else {
            //res.statusCode = response.getCode();
            res.send('404 페이지 or 해당코드 페이지'+ getObj.msg);
        }
    });
});

/* GET card posting form */
router.get('/post', function(req, res, next) {
    // login check
    if (!req.session.isLogin) {
        res.send({ status: false, msg: '로그인이 필요합니다.' });
    } else {
        res.render('post_card', {
            title: 'Post Page',
            host: credentials.host_server
        });
    }
});

/* GET card posting form */
router.get('/upload_image', function(req, res, next) {
    // login check
    if (!req.session.isLogin) {
        res.send({ status: false, msg: '로그인이 필요합니다.' });
    } else {
        res.render('upload/upload_image', {
            title: 'Upload Page',
            host: credentials.host_server,
            api_host: credentials.api_server,
            img: req.query.img,
        });
    }
});

/* GET card listing. */
router.get('/:card_id', function(req, res, next) {
    var data = {
        'card_id': req.params.card_id
    };

    request.get({
        url: credentials.api_server + '/cards/'+data.card_id,
        form: data,
    }, function(err, httpResponse, body) {
        var getObj = JSON.parse(body);

        if(getObj.status) {
            res.statusCode = httpResponse.statusCode;
            res.render('card', { title: 'Card Page', host: credentials.host_server, card: getObj.data, imageA: JSON.parse(getObj.data.imageA), imageB: JSON.parse(getObj.data.imageB) });
        } else {
            res.statusCode = httpResponse.statusCode;
            res.send('404 페이지 or 해당코드 페이지'+getObj.msg);
        }
    });
});

/* POST card listing. */
router.post('/', function(req, res, next) {
    // login check
    if (!req.session.isLogin) {
        res.send({ status: false, msg: '로그인이 필요합니다.' });
    } else {
        var data = {
            my_session: JSON.stringify(req.session),
            'useremail': req.session.userinfo.useremail,
            'author': req.session.userinfo.username,
            'imageA': req.body.imageA,
            'imageB': req.body.imageB,
            'title': req.body.title,
        };

        request.post({
            url: credentials.api_server + '/cards',
            form: data,
        }, function(err, httpResponse, body) {
            var getObj = JSON.parse(body);

            if(getObj.status) {
                res.statusCode = httpResponse.statusCode;
                res.redirect(credentials.host_server+'/cards/'+getObj.data)
            } else {
                res.statusCode = httpResponse.statusCode;
                res.send('404 페이지 or 해당코드 페이지'+ getObj.msg);
            }
        });
    }
});

/* POST image listing */
router.post('/image', function(req, res, next) {
    // login check
    if (!req.session.isLogin) {
        res.send({ status: false, msg: '로그인이 필요합니다.' });
    } else {
        var formidable = require('formidable');
        var form = new formidable.IncomingForm();

        // 파일 폼 파싱 ##
        form.parse(req, function(err, fields, files) {
            if(err) res.send('error 페이지 or 해당코드 페이지');

            // S3 서버에 이미지 업로드 ##
            var AWS = require('aws-sdk');
            var fs = require('fs');

            // Read in the file, convert it to base64, store to S3
            var fileStream = fs.createReadStream(files.somefile.path);
            fileStream.on('error', function (err) {
                if (err) {
                    throw err;
                }
            });
            fileStream.on('open', function () {
                AWS.config.region = 'ap-northeast-2';
                var s3 = new AWS.S3();

                // image name hashing
                var crypto = require('crypto');
                var salt = Math.round((new Date().valueOf() * Math.random())) + "";
                var image_name = crypto.createHash("sha256").update(files.somefile.name + salt).digest("hex");

                // bucket info & file info
                var bucketName = 'indegs-image-storage';
                var keyName = 'images/'+image_name;

                s3.putObject({
                    Bucket: bucketName,
                    Key: keyName,
                    Body: fileStream
                }, function (err) {
                    if (err) { throw err; }
                    var data = {
                        image_url: keyName,
                        image_name: files.somefile.name,
                        author: req.session.userinfo.username,
                    };
                    var form = {
                        my_session: JSON.stringify(req.session),
                        data: JSON.stringify(data)
                    };

                    // Rest API 사진정보 전송
                    request.post({
                        url: credentials.api_server+'/cards/images',
                        form: form
                    }, function optionalCallback(err, httpResponse, body) {
                        if (err) {
                            return res.send(err);
                        }
                        var getObj = JSON.parse(body);

                        res.render('upload/upload_process', {
                            title: 'Result Page',
                            host: credentials.host_server,
                            msg: getObj.msg,
                            image_id: getObj.data,
                            img: req.query.img,
                        });
                    });
                });
            });
        });
    }
});


/* PUT card listing. */
router.put('/:card_id', function(req, res, next) {
    // login check
    if (!req.session.isLogin) {
        res.send({ status: false, msg: '로그인이 필요합니다.' });
    } else {
        /*
        session
        req.params.card_id
        req.body.imageA
        req.body.imageB
        req.body.title
        */

    }
});

module.exports = router;

