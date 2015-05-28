'use strict';

var express = require('express');
var UserModel = require('../models/user');
var Q = require('q');
var router = express.Router();

router.get('/', function (req, res, next) {
    var urlArray = req.originalUrl.replace(/^[\/]+|[\/]+$/,'').split('/');
    console.log(urlArray);
    if(urlArray[0] === 'user') return res.redirect('/users');
    res.end('general people page');
});

router.get('/:username', function (req, res, next) {
    var username = req.param('username');
    var urlArray = req.originalUrl.replace(/^[\/]+|[\/]+$/,'').split('/');
    if(urlArray[0] === 'users') return res.redirect('/user/' + username);
    

    Q.when(UserModel.find({username: username}).exec())
    .then(function (userArray) {
        console.log(userArray.length);
        if(userArray.length == 0) {
            res.end('user '+ username +' was not found or is hidden');
            throw new Error('abort promise chain');
        }
        var userData = userArray[0];
        return makeProfileData(userData);
    })
    .then(function (profile) {
        return res.render('user-profile', {profile: profile});
    });
});

router.get('/:username/edit', function (req, res, next) {
    var sess = req.session;
    var username = req.param('username');
    var urlArray = req.originalUrl.replace(/^[\/]+|[\/]+$/,'').split('/');
    if(urlArray[0] === 'users') return res.redirect('/user/' + username + '/edit'); 
    
    if(sess.login === false || sess.username !== username){
        res.end('you don\'t have rights to edit profile of user ' + username);
    }

    Q.when(UserModel.find({username: username}).exec())
    .then(function (userArray) {
        if(userArray.length === 0) {
            res.end('user '+ username +' was not found or is hidden');
        }
        var userData = userArray[0];
        return makeProfileEditData(userData);
    })
    .then(function (profile) {
        return res.render('user-profile-edit', {profile: profile});
    });
});

router.post('/:username/edit', function (req, res, next){
    var username = req.param('username');
    var sess = req.session;
    if(sess.logged === false || sess.username !== username){
        return res.end('you don\'t have rights to edit profile of user ' + username);
    }

    var form = req.body;
    var profileData = {
        birthday: form.birthday,
        gender: form.gender,
        name: form.name,
        surname: form.surname,
        about: form.about,
    };

    validateProfile(profileData)
    .then(function(outcome) {
        if (outcome.valid === true) {
            var conditions = { username: username },
                update = {
                    profile: {
                        birthday: profileData.birthday,
                        gender: profileData.gender,
                        name: profileData.name,
                        surname: profileData.surname,
                        about: profileData.about
                    }
                },
                options = { multi: true };

            UserModel.update(conditions, update, {}, function(err, affected){
                console.log(affected);
            });

        }
        else {
            return res.end("data is not valid");
        }
    })
    .then(function () {
        res.redirect('/user/' + username);
    });
});

var validateProfile = function (profileData) {
    var deferred = Q.defer();
    process.nextTick(function () {
        deferred.resolve({valid: true, errors: {}});
    });
    
    return deferred.promise;
};

var makeProfileData = function (userData) {
    var deferred = Q.defer();
    process.nextTick(function(){
        var profile = {};
        //age
        profile.age = userData.profile.birthday_v === true ? '' + countAge(userData.profile.birthday) + ' years old' : null ;
        //gender
        profile.gender = userData.profile.gender_v === true ? userData.profile.gender : null;
        //joined
        profile.joined = userData.account.join_date;
        //last login
        profile.lastLogin = '30 minutes ago';
        //name
        profile.name = userData.profile.name + ' ' + userData.profile.surname;
        //username
        profile.username = userData.username;
        //about
        profile.about = userData.profile.about;

        deferred.resolve(profile);
    });
    return deferred.promise;
};

var makeProfileEditData = function (userData) {
    var deferred = Q.defer();
    process.nextTick(function(){
        var profile = {};
        //age
        profile.birthday = userData.profile.birthday;
        //gender
        profile.gender = userData.profile.gender;
        //name
        profile.name = userData.profile.name;
        //surname
        profile.surname = userData.profile.surname;
        //about
        profile.about = userData.profile.about;
        console.log(profile);
        deferred.resolve(profile);
    });
    return deferred.promise;
};

function countAge(birthday) {
    
    return 20;
}

module.exports=router;
