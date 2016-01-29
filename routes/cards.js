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
            res.render('main', {
                title: 'Main Page',
                isLogin: req.session.isLogin,
                host: credentials.host_server,
                cards: getObj.data
            });
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
            isLogin: req.session.isLogin,
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
            isLogin: req.session.isLogin,
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
        var imageA = JSON.parse(getObj.data.imageA);
        var imageB = JSON.parse(getObj.data.imageB);

        if(getObj.status) {
            if (imageA.liker.indexOf(req.session.userinfo.username) == -1
            && imageB.liker.indexOf(req.session.userinfo.username) == -1)
                return res.redirect('/choose/' + data.card_id);

            res.statusCode = httpResponse.statusCode;
            res.render('card', {
                title: 'Card Page',
                isLogin: req.session.isLogin,
                username: req.session.userinfo.username,
                host: credentials.host_server,
                card: getObj.data,
                imageA: imageA,
                imageB: imageB
            });

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
            var gm = require('gm').subClass({ imageMagick: true });
            var buffer = new Buffer(0);

            // Read in the file, convert it to base64, store to S3
            var fileStream = fs.createReadStream(files.somefile.path);
            fileStream.on('error', function (err) {
                if (err) {
                    throw err;
                }
            });
            fileStream.on('data', function (data) {
                buffer = Buffer.concat([buffer, data]);
            });
            fileStream.on('end', function() {
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
                    Body: buffer
                }, function (err) {
                    if (err) { throw err; }
                    // Thubmnail image generate
                    var smImage = new Buffer(0);
                    gm(buffer)
                        .resize("100", "100")
                        .stream(function (err, stdout, stderr) {
                            stdout.on('data', function (data) {
                                smImage = Buffer.concat([smImage, data]);
                            });
                            stdout.on('end', function () {
                                var data = {
                                    Bucket: bucketName,
                                    Key: 'thumb/images/' + image_name,
                                    Body: smImage
                                };
                                s3.putObject(data, function (err, res) {
                                    if (err) {
                                        throw err;
                                    }
                                    console.log('thumbnail generate done');
                                });
                            });
                        });
                    // Rest API 사진정보 전송
                    var data = {
                        image_url: keyName,
                        image_name: files.somefile.name,
                        author: req.session.userinfo.username,
                    };
                    var form = {
                        my_session: JSON.stringify(req.session),
                        data: JSON.stringify(data)
                    };
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
                            isLogin: req.session.isLogin,
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

/* POST new vote card */
router.post('/vote/:card_id/:image_id', function(req, res, next) {
    // login check
    if (!req.session.isLogin) {
        res.send({ status: false, msg: '로그인이 필요합니다.' });
    } else {
        var data = {
            my_session: JSON.stringify(req.session),
            'card_id': req.params.card_id,
            'image_id': req.params.image_id,
            'vote_title': req.body.vote_title,
        };

        request.post({
            url: credentials.api_server + '/cards/vote/'+data.card_id+'/'+data.image_id,
            form: data,
        }, function(err, httpResponse, body) {
            var getObj = JSON.parse(body);

            if(getObj.status) {
                res.statusCode = httpResponse.statusCode;
                res.redirect(credentials.host_server+'/cards/'+data.card_id)
            } else {
                res.statusCode = httpResponse.statusCode;
                res.send('404 페이지 or 해당코드 페이지'+ getObj.msg);
            }
        });
    }
});


/* PUT vote like card */
router.get('/vote/:card_id/:image_id/:vote_title', function(req, res, next) {
    // login check
    if (!req.session.isLogin) {
        res.send({ status: false, msg: '로그인이 필요합니다.' });
    } else {
        var data = {
            my_session: JSON.stringify(req.session),
            'card_id': req.params.card_id,
            'image_id': req.params.image_id,
            'vote_title': req.params.vote_title,
        };

        request.put({
            url: credentials.api_server + '/cards/vote/'+data.card_id+'/'+data.image_id,
            form: data,
        }, function(err, httpResponse, body) {
            var getObj = JSON.parse(body);

            if(getObj.status) {
                res.statusCode = httpResponse.statusCode;
                res.redirect(credentials.host_server+'/cards/'+data.card_id)
            } else {
                res.statusCode = httpResponse.statusCode;
                res.send('404 페이지 or 해당코드 페이지'+ getObj.msg);
            }
        });
    }
});

module.exports = router;

