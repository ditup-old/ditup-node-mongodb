'use strict';

var express = require('express');
var router = express.Router();
var Q = require('q');
var User = require('../models/user');
var iterations = require('../../config/password').iterations;
var hashFunctions = require('./user/user');
var hashPassword = hashFunctions.hashPassword;
var generateSalt = hashFunctions.generateSalt;
var generateHexCode = hashFunctions.generateHexCode;
var sendVerifyEmail = hashFunctions.sendVerifyEmail;

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
        //if data are valid
        if(validateData.valid === true){
            var salt, verifyCode; //to store salt when we generate it
            generateSalt()  //generate salt
            .then(function(_salt){  //generate hashed password and verification code asynchronously
                salt = _salt
                return Q.all([hashPassword(formData.password, salt, iterations), generateHexCode(16)]);
            })
            .then(function(outcome){
                var hashedPassword = outcome[0];
                verifyCode = outcome[1];

                var newUser = new User({
                    username: formData.username,
                    email: formData.email,
                    profile: {
                        name: formData.name,
                        surname: formData.surname,
                        birthday: null,
                        birthday_v: false,
                        gender: '',
                        gender_v: false,
                        about: ''
                    },
                    account:{
                        join_date: new Date(),
                        email_verified: false,
                        email_verified_date: null,
                        email_verify_code: verifyCode,
                        active_account: true,
                        last_login: null,
                        last_message_visit: null
                    },
                    login: {
                        salt: salt,
                        password: hashedPassword,
                        iterations: iterations
                    }
                });
                console.log('ready to save');                
                return (function(newUser){
                    var deferred = Q.defer();
                    newUser.save(function (err, nu) {
                        if(err) deferred.reject(err);
                        deferred.resolve(nu);
                    });
                    return deferred.promise;
                })(newUser);
            })
            .then(function (savedUser) {
                return sendVerifyEmail(formData.username, formData.email, verifyCode);
            })
            .then(function (success) { 
                res.end('Welcome ' + formData.username + '. Your new account was created and verification email was sent to ' + formData.email + '. It should arrive soon. In the meantime why don\'t you fill up your profile?');
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

    //asynchronously check if username and email is unique

    Q.all([
        User.find({ username: formData.username }).exec(),
        User.find({ email: formData.email }).exec()
    ])
    .then(function(search){
        var users = search[0],
            emails = search [1];
        if(users.length > 0){
            valid = false;
            errors.username = errors.username || [];
            errors.username.push('username must be unique');
        }
        if(emails.length > 0){
            valid = false;
            errors.email = errors.email || [];
            errors.email.push('email must be unique');
        }
        
        deferred.resolve({valid: valid, errors: errors});
    });

    return deferred.promise;
}
