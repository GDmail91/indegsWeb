var express = require('express');
var request = require('request');
var credentials = require('../credentials');
var router = express.Router();

/* GET users list */
router.get('/users', function(req, res, next) {
    var data = {
        'start_id': req.query.startId,
        'term': req.query.term
    };

    if(!req.session.isAdmin) {
        return res.send('잘못된 접근입니다.');
    }

    request.get({
        url: credentials.api_server + '/admin/users',
        form: data
    }, function(err, httpResponse, body) {
        var getObj = JSON.parse(body);

        if(getObj.status || !err) {
            res.statusCode = httpResponse.statusCode;
            // TODO send user list
            res.render('admin/admin_user', {
                title: 'Administrator',
                sub_title: 'users',
                isLogin: req.session.isLogin,
                isAdmin: req.session.isAdmin,
                host: credentials.host_server,
                data: getObj.data
            });
        } else {
            var err = new Error('Not Found');
            err.status = httpResponse.statusCode;
            next(err);
        }
    });
});

/* DELETE user */
router.delete('/users', function(req, res, next) {
    var data = {
        'start_id': req.query.startId,
        'term': req.query.term,
        'selected_id': req.body.selected_id
    };

    if(!req.session.isAdmin) {
        return res.send('잘못된 접근입니다.');
    }

    request({
        method: 'DELETE',
        url: credentials.api_server + '/admin/users',
        form: data
    }, function(err, httpResponse, body) {
        var getObj = JSON.parse(body);

        if(getObj.status || !err) {
            res.statusCode = httpResponse.statusCode;
            // TODO 수정 하기전 위치 기억해야 할 듯
            res.send('삭제되었습니다.');
        } else {
            var err = new Error('Not Found');
            err.status = httpResponse.statusCode;
            next(err);
        }
    });
});

/* GET cards list. */
router.get('/cards', function(req, res, next) {
    var data = {
        'start_id': req.query.startId,
        'term': req.query.term
    };

    if(!req.session.isAdmin) {
        return res.send('잘못된 접근입니다.');
    }

    request.get({
        url: credentials.api_server + '/admin/cards',
        form: data
    }, function(err, httpResponse, body) {
        var getObj = JSON.parse(body);

        if(getObj.status || !err) {
            res.statusCode = httpResponse.statusCode;
            // TODO send user list
            res.render('admin/admin_user', {
                title: 'Administrator',
                sub_title: 'cards',
                isLogin: req.session.isLogin,
                isAdmin: req.session.isAdmin,
                host: credentials.host_server,
                data: getObj.data
            });
        } else {
            var err = new Error('Not Found');
            err.status = httpResponse.statusCode;
            next(err);
        }
    });
});

/* DELETE cards */
router.delete('/cards', function(req, res, next) {
    var data = {
        'start_id': req.query.startId,
        'term': req.query.term,
        'selected_id': req.body.selected_id
    };

    if(!req.session.isAdmin) {
        return res.send('잘못된 접근입니다.');
    }

    request({
        method: 'DELETE',
        url: credentials.api_server + '/admin/cards',
        form: data
    }, function(err, httpResponse, body) {
        var getObj = JSON.parse(body);

        if(getObj.status || !err) {
            res.statusCode = httpResponse.statusCode;
            // TODO 수정 하기전 위치 기억해야 할 듯
            res.send('삭제되었습니다.');
        } else {
            var err = new Error('Not Found');
            err.status = httpResponse.statusCode;
            next(err);
        }
    });
});

/* GET images list. */
router.get('/images', function(req, res, next) {
    var data = {
        'start_id': req.query.startId,
        'term': req.query.term
    };

    if(!req.session.isAdmin) {
        return res.send('잘못된 접근입니다.');
    }

    request.get({
        url: credentials.api_server + '/admin/images',
        form: data
    }, function(err, httpResponse, body) {
        var getObj = JSON.parse(body);

        if(getObj.status || !err) {
            res.statusCode = httpResponse.statusCode;
            // TODO send user list
            res.render('admin/admin_user', {
                title: 'Administrator',
                sub_title: 'images',
                isLogin: req.session.isLogin,
                isAdmin: req.session.isAdmin,
                host: credentials.host_server,
                data: getObj.data
            });
        } else {
            var err = new Error('Not Found');
            err.status = httpResponse.statusCode;
            next(err);
        }
    });
});

module.exports = router;
