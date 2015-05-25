'use strict';

var express = require('express');
var router = express.Router();
var Q = require('q');
var User = require('../models/user');

//var mongoose = require('mongoose');
//var User = require('../models/user');

router.get('/', function(req, res, next){
    var sess = req.session;
    if(sess.logged === true){
        res.render('sysinfo', {msg: 'you are logged in as ' + sess.username + '. To sign up you need to log out first.'});
    }
    else {
        res.render('signup');
    }
});

router.post('/', function(req, res, next){
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
    .then(function (validateData) {
        if(validateData.valid === true){
            var newUser = new User({
                username: formData.username,
                email: formData.email,
                profile: {
                    name: formData.name,
                    surname: formData.surname
                },
                login: {
                    password: formData.password //(TODO hash to be secure!!!)
                }
            });

            newUser.save(function(err, nu) {
                if (err) return console.error(err);
                res.end(JSON.stringify(nu));
            });
        }
        else{
            res.end(JSON.stringify(validateData.errors));
        }
    });  
});

module.exports = router;

function validate(formData) {
    //things to validate:   username regex
    //                      username unique
    //                      email regex
    //                      email unique
    //                      name, surname regex
    //                      password regex
    //                      passwords match
    
    var deferred = Q.defer(),
        valid = true,
        errors = {};

    //username regex
    var usernameRegex = /^([a-z0-9_\-\.]{2,32})$/;
    if(usernameRegex.test(formData.username) === false){
        valid = false;
        errors.username = errors.username || [];
        errors.username.push('wrong username format (TODO)');
    }

    //email regex
    var emailRegex = /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
    if(emailRegex.test(formData.email) === false){
        valid = false;
        errors.email = errors.email || [];
        errors.email.push('invalid email');
    }
    
    //name, surname max 128 characters long
    if(formData.name.length > 128){
        valid = false;
        errors.name = errors.name || [];
        errors.name.push('name can be max 128 characters long');
    }

    if(formData.surname.length > 128){
        valid = false;
        errors.surname = errors.surname || [];
        errors.surname.push('surname can be max 128 characters long');
    }

    //password regex
    var passwordRegex = /(?=^.{8,128}$)(?=.*[a-zA-Z0-9])(?=.*[^A-Za-z0-9]).*$/
    if(passwordRegex.test(formData.password) === false){
        valid = false;
        errors.password = errors.password || [];
        errors.password.push('password must be at least 8 characters long and contain [a-zA-Z0-9] and some special character');
    }

    //password match
    if(formData.password !== formData.password2){
        valid = false;
        errors.password2 = errors.password2 || [];
        errors.password2.push('passwords don\'t match');
    }

    //asynchronously check if username is unique
    User.find({ username: formData.username })
    .exec()
    .then(function(userArray){
        console.log(userArray);
        if(userArray.length > 0){
            valid = false;
            errors.username = errors.username || [];
            errors.username.push('username must be unique');
        }
    })
    .then(function(){
        //asynchronously check if email is unique
        User.find({ email: formData.email })
        .exec()
        .then(function (userArray) {
            if(userArray.length > 0) {
                valid = false;
                errors.email = errors.email || [];
                errors.email.push('email must be unique');
            }
            deferred.resolve({valid: valid, errors: errors});
        });
    });

    return deferred.promise;
}
