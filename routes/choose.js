var express = require('express');
var request = require('request');
var credentials = require('../credentials');
var router = express.Router();

/* GET choose card. */
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
            res.render('choose', {
                title: 'Choose Page',
                isLogin: req.session.isLogin,
                host: credentials.host_server,
                card: getObj.data,
                imageA: JSON.parse(getObj.data.imageA),
                imageB: JSON.parse(getObj.data.imageB)
            });
        } else {
            res.statusCode = httpResponse.statusCode;
            res.send('404 페이지 or 해당코드 페이지'+getObj.msg);
        }
    });
});

/* POST choose card */
router.post('/:card_id/:image_id', function(req, res, next) {
    // login check
    if (!req.session.isLogin) {
        res.send({ status: false, msg: '로그인이 필요합니다.' });
    } else {
        var data = {
            my_session: JSON.stringify(req.session),
            'card_id': req.params.card_id,
            'useremail': req.session.userinfo.useremail,
            'username': req.session.userinfo.username,
            'image_id': req.params.image_id
        };

        request.post({
            url: credentials.api_server + '/choose/'+data.card_id+'/'+data.image_id,
            form: data,
        }, function(err, httpResponse, body) {
            var getObj = JSON.parse(body);
            if(getObj.status) {
                res.redirect('/cards/'+data.card_id);
            } else {
                res.statusCode = httpResponse.statusCode;
                res.send('404 페이지 or 해당코드 페이지'+getObj.msg);
            }
        });
    }
});

module.exports = router;
