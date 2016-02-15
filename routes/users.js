var express = require('express');
var request = require('request');
var credentials = require('../credentials');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET join listing. */
router.get('/join', function(req, res, next) {
  res.render('auth/join', {
    title: 'Join Page',
    isLogin: req.session.isLogin,
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
  var Validator = require('validator');
  if(Validator.isEmail(data.email)  // email check
      && Validator.equals(data.pw, data.pw_confirm) // password confirm
      && Validator.isNumeric(data.age)  // number only
      && Validator.isAlphanumeric(data.username)  // charator only
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
    console.log('이름: '+Validator.isAlphanumeric(data.username));
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
        username: getObj.data.username,
        useremail: getObj.data.email
      };
      console.log(getObj);
      if (getObj.data.email == "test01@test.com");
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
