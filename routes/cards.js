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
            res.render('card', { title: 'Card Page', host: credentials.host_server, card: getObj.data });
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

        form.parse(req, function(err, fields, files) {
            if(err) res.send('error 페이지 or 해당코드 페이지');

            var fs = require('fs');
            var form = {
                my_session: JSON.stringify(req.session),
                files: JSON.stringify(files)
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
                    host: credentials.host_server,
                    msg: getObj.msg,
                    image_id: getObj.data,
                    img: req.query.img,
                });
            });
        });
    }
});

module.exports = router;

