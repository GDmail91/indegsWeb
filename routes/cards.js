var express = require('express');
var requestify = require('requestify');
var credentials = require('../credentials');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    // startID, endID
    var data = {
        'startId': req.query.startId,
        'term': req.query.term
    };

    var options = {
        method: 'GET',
        params: JSON.stringify(data),
        dataType: 'json'
    };
    // TODO 5개만 불러와지는거 제대로 확인해야함(현재 데이터가 1개뿐이라 테스트 불가)
    requestify.request(credentials.api_server+'/cards', options).then(function(response) {
        var getObj = response.getBody();

        console.log('로그인상태: '+req.session.isLogin);
        console.log('사용자정보: '+req.session.userinfo.useremail+', '+req.session.userinfo.username);
        if(getObj.status) {
            res.statusCode = response.getCode();
            //res.render('cards', getObj);
            res.render('main', { title: 'Main Page', cards: getObj.data });
        } else {
            res.statusCode = response.getCode();
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
            host: credentials.host_server+'/cards'
        });
    }
});


/* GET card listing. */
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
            res.statusCode = response.getCode();
            //res.render('cards', getObj);
            res.render('card', { title: 'Card Page', card: getObj.data });
        } else {
            res.statusCode = response.getCode();
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
            'useremail': req.session.userinfo.useremail,
            'author': req.session.userinfo.username,
            'imageA': req.body.imageA,
            'imageB': req.body.imageB,
            'title': req.body.title,
        };

        var options = {
            method: 'POST',
            body: data,
            cookies: {
                mySession: JSON.stringify(req.session)
            },
            dataType: 'json'
        };

        requestify.request(credentials.api_server+'/cards', options).then(function(response) {
            var getObj = response.getBody();

            if(getObj.status) {
                res.statusCode = response.getCode();
                res.redirect(credentials.host_server+'/cards/'+getObj.data)
            } else {
                res.statusCode = response.getCode();
                res.send('404 페이지 or 해당코드 페이지'+ getObj.msg);
            }
        });
    }
});


module.exports = router;

