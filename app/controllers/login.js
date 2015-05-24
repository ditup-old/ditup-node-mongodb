'use strict';

var express = require('express');
var session = require('express-session');
var Q = require('q');
var router = express.Router();

router.get('/', function (req, res, next) {
    var sess = req.session;

    if(sess.logged === true){
        res.end('you are already logged in as ' + sess.username); //TODO
    }
    else {
        res.render('login');
    }
});

router.post('/', function (req, res, next) {
    var sess = req.session;
    if(sess.logged === true){
        res.end('you are already logged in as ' + sess.username); //TODO
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
                    res.end('login successful');
                }
                else {
                    res.end('login not successful');
                }
            },
            function (reason) {res.end('problem');}
        );
        
    }
    //res.end(JSON.stringify(req.body));
});

function authenticate (username, password) {
    console.log('authentication');
    console.log(username, password);
    var deferred = Q.defer();
    setTimeout(function(){
        console.log('timeout ended')
        var logged = false;
        if(username == 'michal' && password == 'secret'){
            logged = true;
        }
        console.log(logged);
        if(false) deferred.reject();
        else{
            console.log('resolved');
            deferred.resolve({logged:logged, username: username});
        }
    },1000);
    return deferred.promise;
};
module.exports=router;
