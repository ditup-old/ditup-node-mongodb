'use strict';

var express = require('express');
var session = require('express-session');
var Q = require('q');
var router = express.Router();

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
        .then(
            function (data) {
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
            },
            function (reason) {
                res.render('sysinfo', {msg: 'Error: ' + reason}); //TODO
            }
        );
        
    }
    //res.end(JSON.stringify(req.body));
});

function authenticate (username, password) {
    var deferred = Q.defer();
    setTimeout(function(){
        var logged = false;
        if(username == 'michal' && password == 'secret'){
            logged = true;
        }
        if(false) deferred.reject();
        else{
            deferred.resolve({logged:logged, username: username});
        }
    },1000);
    return deferred.promise;
};

module.exports=router;
