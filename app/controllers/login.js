'use strict';

var express = require('express');
var session = require('express-session');
var Q = require('q');
var router = express.Router();
var UserModel = require('../models/user');
var iterations = require('../../config/password').iterations;
var hashFunctions = require('./user/user');
var hashPassword = hashFunctions.hashPassword;
var compareHashes = hashFunctions.compareHashes;


router.get('/', function (req, res, next) {
  var sess = req.session.data;

  if(sess.logged === true){
    res.render('sysinfo', {
      msg: 'you are already logged in as ' + sess.username,
      session: sess
    }); //TODO
  }
  else {
    res.render('login', {
      session: sess
    });
  }
});

router.post('/', function (req, res, next) {
  var sess = req.session.data;
  if(sess.logged === true){
    res.render('sysinfo', {
      msg: 'you are already logged in as ' + sess.username,
      session: sess
    }); //TODO
  }
  else{
    //TODO first some simple validation of values
    //TODO perform user authentication (asynchronously!)
    authenticate(req.body.username, req.body.password)
      .then(function (data) {
        console.log('authentication resolved')
        console.log(data);
        if (data.logged === true) {
          sess.logged = true;
          sess.username = req.body.username;
          sess.id = data.id;
          res.render('sysinfo', {
            msg: 'login successful',
            session: sess
          }); //TODO
          updateLastLogin(sess.username)
            .then(function (undefined, err) {
              console.log(err);
            });
        }
        else {
          res.render('sysinfo', {
            msg: 'login not successful',
            session: sess
          }); //TODO
        }
      });
  }
});

function authenticate (username, password) {
    var deferred = Q.defer();
    var logged = false;
    
    var user, salt, iterations, savedHash
    UserModel.find({username: username}).exec()
    .then(function (found) {
        if(found.length === 0){
            deferred.resolve({logged:false});
        }
        user = found[0];
        salt = user.login.salt;
        iterations = user.login.iterations;
        savedHash = user.login.password;

        return hashPassword(password, salt, iterations);
    })
    .then(function(computedHash) {
        console.log(savedHash, computedHash);
        return compareHashes(savedHash, computedHash);
    })
    .then(function (sameHashes) {
        if (sameHashes === true && username === user.username) {
            deferred.resolve({logged: true, username: username, id: user._id});
        }
        else deferred.resolve({logged: false});
    });
    return deferred.promise;
}

function updateLastLogin(username) {
  var deferred = Q.defer();
  var conditions = { username: username };
  var update = {
    $set: {
      'account.last_login': Date.now(),
    }
  };

  console.log('updating last login');

  UserModel.update(conditions, update, {}, function(err, affected){
    console.log('affected', affected, err);
    if(err) return deferred.reject(err);
    if(affected.ok !== 1) return deferred.reject('not ok');
    if(affected.n < 1) return deferred.reject('not found');
    if(affected.n === 1) return deferred.resolve(true);
    if(affected.n > 1) return deferred.reject('this should not happen. updated more than 1 document');
    return deferred.reject('something else');
  });

  return deferred.promise;
}


module.exports=router;
