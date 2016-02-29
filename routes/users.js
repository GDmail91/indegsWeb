var express = require('express');
var request = require('request');
var credentials = require('../credentials');
var router = express.Router();

/* GET users listing. */
router.get('/info', function(req, res, next) {
  var data = {
    'startId': req.query.startId,
    'term': req.query.term,
    'email': req.query.useremail
  };

  if (data.email == undefined) data.email = req.session.useremail;
  var async = require('async');
  async.waterfall([
    function(callback) {
        request.get({
          url: credentials.api_server+'/users/emails',
          form: data
        }, function(err, httpResponse, body) {
          var getObj = JSON.parse(body);

          if(getObj.status) {
            callback(null, getObj);
          } else {
            callback({ status: false, msg: getObj.msg });
          }
        });
    },
    function(back_data, callback) {
      back_data.data.startId =data.startId;
      back_data.data.term = data.term;
      request.get({
        url: credentials.api_server+'/cards/users/'+back_data.data._id,
        qs :{
          startId: data.startId,
          term: data.term
        },
        form: back_data.data
      }, function(err, httpResponse, body) {
        if (err) return callback({ result: false, msg: '에러발생 원인:'+err});
        var getObj = JSON.parse(body);

        if(getObj.status) {

          back_data.data.cards = getObj.data;
          callback(null, back_data);
        } else {
          callback({ status: false, msg: getObj.msg });
        }
      });
    }],
    function(err, result) {
      if (err) return res.send(err);
      res.render('user_page', {
        title: 'User page',
        sub_title: 'Profile',
        isLogin: req.session.isLogin,
        isAdmin: req.session.isAdmin,
        host: credentials.host_server,
        data: result.data
      });
  });
});

// TODO remove
/* GET users cards. */
router.get('/cards', function(req, res, next) {
  var data = {
    'startId': req.query.startId,
    'term': req.query.term,
    'email': req.query.useremail
  };

  if (data.email == undefined) data.email = req.session.useremail;
  var async = require('async');
  async.waterfall([
        function(callback) {
          request.get({
            url: credentials.api_server+'/users/emails',
            form: data
          }, function(err, httpResponse, body) {
            var getObj = JSON.parse(body);

            if(getObj.status) {
              callback(null, getObj);
            } else {
              callback({ status: false, msg: getObj.msg });
            }
          });
        },
        function(back_data, callback) {
          back_data.data.startId =data.startId;
          back_data.data.term = data.term;
          request.get({
            url: credentials.api_server+'/cards/users/'+back_data.data._id,
            qs :{
              startId: data.startId,
              term: data.term
            },
            form: back_data.data
          }, function(err, httpResponse, body) {
            if (err) return callback({ result: false, msg: '에러발생 원인:'+err});
            var getObj = JSON.parse(body);

            if(getObj.status) {

              back_data.data.cards = getObj.data;
              callback(null, back_data);
            } else {
              callback({ status: false, msg: getObj.msg });
            }
          });
        }],
      function(err, result) {
        if (err) return res.send(err);
        res.render('user_page', {
          title: 'User page',
          sub_title: 'My Cards',
          isLogin: req.session.isLogin,
          isAdmin: req.session.isAdmin,
          host: credentials.host_server,
          data: result.data
        });
      });
});

/* GET join listing. */
router.get('/join', function(req, res, next) {
  if (req.session.isLogin)
    return res.redirect(req.headers.referer);

  res.render('auth/join', {
    title: 'Join Page',
    isLogin: req.session.isLogin,
    isAdmin: req.session.isAdmin,
    host: credentials.host_server
  });
});

/* POST join listing. */
router.post('/join', function(req, res, next) {
  var data = {
    'email': req.body.email,
    'pw': req.body.pw,
    'pw_confirm': req.body.pw_confirm,
    'username': req.body.username,
    'age': req.body.age,
    'gender': req.body.gender
  };
  //TODO name => username 으로 변경할것

  // validation check
  var validation = /[a-힣]/;
  var Validator = require('validator');
  if(Validator.isEmail(data.email)  // email check
      && Validator.equals(data.pw, data.pw_confirm) // password confirm
      && Validator.isNumeric(data.age)  // number only
      && validation.test(data.username) // character only
      && (Validator.equals(data.gender, 'male') || Validator.equals(data.gender, 'female'))) {

      // Email registration
    request.post({
      url: credentials.api_server+'/users/join',
      form: data,
    }, function(err, httpResponse, body) {
      var getObj = JSON.parse(body);

      if(getObj.status) {
        res.statusCode = httpResponse.statusCode;
        //res.render('cards', getObj);
        res.redirect('/');
      } else {
        res.statusCode = httpResponse.statusCode;
        res.send('404 페이지 or 해당코드 페이지'+getObj.msg);
      }
    });

  } else {
    // TODO backward process
    console.log('유효성 검사 실패.');
    console.log('이메일: '+Validator.isEmail(data.email));
    console.log('비번: '+Validator.equals(data.pw, data.pw_confirm));
    console.log('이름: '+validation.test(data.username));
    console.log('나이: '+Validator.isNumeric(data.age));
    console.log('성별: '+(Validator.equals(data.gender, 'male') || Validator.equals(data.gender, 'female')));

    res.send({ status: false, msg: '회원가입 실패', data: '유효성 검사 실패' });
  }
});

/* GET login listing. */
router.get('/login', function(req, res, next) {
  res.render('auth/login', {
    title: 'Login Page',
    isLogin: req.session.isLogin,
    isAdmin: req.session.isAdmin,
    host: credentials.host_server
  });
});

/* POST login listing. */
router.post('/login', function(req, res, next) {
  var data = {
    email: req.body.email,
    pw: req.body.pw
  };

  // Login processing
  request.post({
    url: credentials.api_server+'/users/login',
    form: data,
  }, function(err, httpResponse, body) {
    var getObj = JSON.parse(body);

    if(getObj.status) {
      res.statusCode = httpResponse.statusCode;

      req.session.isLogin = true;
      req.session.userinfo = {
        user_id: getObj.data.user_id,
        username: getObj.data.username,
        useremail: getObj.data.email
      };
      console.log(getObj);
      if (getObj.data.email == credentials.admin_email)
        req.session.isAdmin = true;
      // TODO redirecting
      res.send(getObj);
    } else {
      res.statusCode = httpResponse.statusCode;
      res.send('404 페이지 or 해당코드 페이지'+getObj.msg);
    }
  });
});

/* GET logout listing. */
router.get('/logout', function(req, res, next) {
  req.session.isLogin = false;
  req.session.userinfo = {};
  req.session.isAdmin = false;

  console.log(req.headers.referer);
  res.redirect(req.headers.referer);
});

module.exports = router;
