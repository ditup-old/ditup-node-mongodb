'use strict';

var express = require('express');
var session = require('express-session');
var Q = require('q');
var router = express.Router();
var User = require('../models/user');
var iterations = require('../../config/password').iterations;
var hashFunctions = require('./user/user');
var hashPassword = hashFunctions.hashPassword;
var compareHashes = hashFunctions.compareHashes;


router.get('/', function (req, res, next) {
    var sess = req.session;

    if(sess.logged === true){
        res.render('sysinfo', {msg: 'you are already logged in as ' + sess.username}); //TODO
    }
    else {
        res.render('login');
    }
});

router.post('/', function (req, res, next) {
    var sess = req.session;
    if(sess.logged === true){
        res.render('sysinfo', {msg: 'you are already logged in as ' + sess.username}); //TODO
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
                res.render('sysinfo', {msg: 'login successful'}); //TODO
            }
            else {
                res.render('sysinfo', {msg: 'login not successful'}); //TODO
            }
        });
        
    }
    //res.end(JSON.stringify(req.body));
});

function authenticate (username, password) {
    var deferred = Q.defer();
    var logged = false;
    
    var user, salt, iterations, savedHash
    User.find({username: username}).exec()
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
            deferred.resolve({logged: true, username: username});
        }
        else deferred.resolve({logged: false});
    });
    return deferred.promise;
}


module.exports=router;
