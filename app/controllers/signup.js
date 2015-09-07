'use strict';

var express = require('express');
var router = express.Router();
var Q = require('q');
//var User = require('../models/user');

var funcs = require('./signup/functions.js');
var validate = funcs.validateForm;
var createNewUser = funcs.createNewUser;
var sendVerifyEmail = funcs.sendVerifyEmail;
var verifyEmail = funcs.verifyEmail;




//var mongoose = require('mongoose');
//var User = require('../models/user');

router
  .get('/verify/:username/:code', function (req, res, next) {
    var sess = req.session.data;
    var username = req.param('username');
    var code = req.param('code');
    verifyEmail(username, code)
      .then(function(success){
        if (success.is === true) {
          return res.render('sysinfo', {msg: 'verification was successful', session: sess});
        }
        else {
          return res.render('sysinfo', { msg: 'verification was not successful '+ success.error , session: sess});
        }
      });
  })
  .all('*', function(req, res, next) {
    console.log('initiation');
    var sess = req.session.data;
    console.log(req.session.data);
    if(sess.logged === true) {
      return res.render('sysinfo', {msg: 'you are logged in as <a href="/user/'+ sess.username +'" >' + sess.username + '</a>. To sign up you need to <a href="/logout">log out</a> first.', session: sess});
    }
    else {
      next();
    }
  })
  .get('/', function(req, res, next){
    //
    return res.render('signup', {errors: {}, values: {}});
  })
  .post('/', function(req, res, next){
    var sess = req.session.data;
    var form = req.body;
    var formData = {
      name: form.name,
      surname: form.surname,
      username: form.username,
      email: form.email,
      password: form.password,
      password2: form.password2
    };

    //first let's validate data from the form
                
    validate(formData)
    .then(function (validatedData) {
      //if data are valid
      if(validatedData.valid === true){

        console.log('valid');
        return dataValid(formData, res, sess);
      }
      else{
        console.log('invalid');
        return dataInvalid(validatedData.errors, formData, res, sess);
      }
    });
  });

var dataValid = function (data, res, sess) {
  createNewUser(data)
    .then(function (_data) {
      console.log(_data);
      return sendVerifyEmail(_data.username);
    })
    .then(function (__a) {
      console.log('rendering');
      var message = 'Welcome ' + data.username + '. Your new account was created and verification email was sent to ' + data.email + '. It should arrive soon. In the meantime why don\'t you fill up your profile?';
      return res.render('sysinfo', {msg: message, session: sess});
    })
    .catch(function(err){
      return res.end(JSON.stringify(err) + ' error');
    });
};

var dataInvalid = function (errors, values, res, sess) {
  console.log(errors, values);
  var deferred = Q.defer();
  process.nextTick(function(){
    console.log('rendering');
    res.render('signup', { errors: errors, values: values });
    deferred.resolve();
  });
  return deferred.promise;
};

module.exports = router;
