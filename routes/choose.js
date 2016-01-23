var express = require('express');
var requestify = require('requestify');
var credentials = require('../credentials');
var router = express.Router();

/* GET choose card. */
router.get('/:card_id', function(req, res, next) {
    var data = {
        'card_id': req.params.card_id
    };

    var options = {
        method: 'GET',
        dataType: 'json'
    };

    requestify.request(credentials.api_server+'/cards/'+data.card_id, options).then(function(response) {
        var getObj = response.getBody();

        if(getObj.status) {
            var data = {
                'image_id': getObj.imageA
            };
            var options = {
                method: 'GET',
                dataType: 'json'
            };
            requestify.request(credentials.api_server+'/images/'+data.image_id, options).then(function(response) {
                var getImageA = response.getBody();

                if(getImageA.status) {
                    var data = {
                        'image_id': getObj.imageB
                    };
                    var options = {
                        method: 'GET',
                        dataType: 'json'
                    };
                    requestify.request(credentials.api_server+'/images/'+data.image_id, options).then(function(response) {
                        var getImageB = response.getBody();

                        if(getImageB.status) {
                            res.statusCode = response.getCode();
                            res.render('choose', {title: 'Choose Page', host: credentials.host_server, card: getObj.data, imageA: getImageA.data, imageB: getImageB.data });
                        } else {
                            res.statusCode = response.getCode();
                            res.send('404 페이지 or 해당코드 페이지'+ getImageB.msg);
                        }
                    });
                } else {
                    res.statusCode = response.getCode();
                    res.send('404 페이지 or 해당코드 페이지'+ getImageA.msg);
                }
            });
        } else {
            res.statusCode = response.getCode();
            res.send('404 페이지 or 해당코드 페이지'+ getObj.msg);
        }
    });
});

/* POST choose card */
router.post('/:card_id/:image_id', function(req, res, next) {
    // login check
    if (!req.session.isLogin) {
        res.send({ status: false, msg: '로그인이 필요합니다.' });
    } else {
        var Card = require('../models/card.js');

        var data = {
            'card_id': req.params.card_id,
            'useremail': req.session.userinfo.useremail,
            'username': req.session.userinfo.username,
            'image_id': req.params.image_id
        };

        Card.postLikeCard(data, function(status, msg) {
            if (status)
                res.send({ status: true, msg: '좋아요 누름', data: {like: msg.like, liker: msg.liker } });
            else
                res.send({ status: false, msg: '에러', data: msg });
        });
    }
});

module.exports = router;
