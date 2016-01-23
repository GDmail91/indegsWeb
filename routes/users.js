var express = require('express');
var requestify = require('requestify');
var credentials = require('../credentials');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
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
    var options = {
      method: 'POST',
      body: data,
      dataType: 'json'
    };

    requestify.request(credentials.api_server+'/users/join', options).then(function(response) {
      var getObj = response.getBody();

      if(getObj.status) {
        res.statusCode = response.getCode();
        //res.render('cards', getObj);
        res.send(getObj);
      } else {
        res.statusCode = response.getCode();
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
  var options = {
    method: 'POST',
    body: data,
    dataType: 'json'
  };

  requestify.request(credentials.api_server+'/users/login', options).then(function(response) {
    var getObj = response.getBody();

    if(getObj.status) {
      res.statusCode = response.getCode();
      //res.render('cards', getObj);

      req.session.isLogin = true;
      req.session.userinfo = {
        username: getObj.data.username,
        useremail: getObj.data.email
      };
      // TODO redirecting
      res.send(getObj);
    } else {
      res.statusCode = response.getCode();
      res.send('404 페이지 or 해당코드 페이지'+getObj.msg);
    }
  });
});

module.exports = router;
