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
        if(userArray.length === 0) {
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
                };

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
        var valid = true;
        var errors = {};
        //validate name (0 - 256 characters)
        if (profileData.name.length > 256) {
            valid = false;
            errors.name = errors.name || [];
            errors.name.push('name can be max 256 characters long');
        }
        //validate surname (0 - 256 characters)
        if (profileData.surname.length > 256) {
            valid = false;
            errors.surname = errors.surname || [];
            errors.surname.push('surname can be max 256 characters long');
        }
        //validate gender (unspecified, male, female, other)
        var genderArray = ['unspecified', 'male', 'female', 'other'];
        if (!(genderArray.indexOf(profileData.gender) > -1)) {
            valid = false;
            errors.gender = errors.gender || [];
            errors.gender.push('please select gender from the list provided');
        }
        //validate birthday
        var birthdayRegex = /^(19|20)\d\d[\-\/.](0[1-9]|1[012])[\-\/.](0[1-9]|[12][0-9]|3[01])$/;
        if (!profileData.birthday.match(birthdayRegex) && profileData.birthday !== '') {
            valid = false;
            errors.birthday = errors.birthday || [];
            errors.birthday.push('birthday is in wrong format. please use yyyy-mm-dd');
        }
        //validate about (0 - 16384 characters)
        if (profileData.about.length > 16384) {
            valid = false;
            errors.about = errors.about || [];
            errors.about.push('description is too long (max 16384 characters)');
        }

        deferred.resolve({valid: valid, errors: errors});
    });
    
    return deferred.promise;
};

var makeProfileData = function (userData) {
    var deferred = Q.defer();
    process.nextTick(function(){
        var profile = {};
        //age
        profile.age = userData.profile.birthday != '' ? '' + countAge(userData.profile.birthday) + ' years old' : null ;
        //gender
        profile.gender = userData.profile.gender != '' ? userData.profile.gender : '';
        //joined
        profile.joined = userData.account.join_date;
        //last login
        profile.lastLogin = countLastLogin(userData.account.last_login);
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

function countAge(dateString) {
    //http://stackoverflow.com/a/7091965
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function countLastLogin(dateString) {
    if (!dateString) return 'Never logged in.'
    var diff = Math.floor((Date.now() - (new Date(dateString)).getTime())/1000);
    if (diff === 0) {
        return 'Logged right now.';
    }
    else if(diff<60){ //seconds
        return 'Logged '+ diff + 'seconds ago.';
    }
    else if(Math.floor(diff/60)<60){ //minutes
        diff = Math.floor(diff/60);
        return 'Logged ' + diff + 'minutes ago';
    }
    else if(Math.floor(diff/60)<24){
        diff = Math.floor(diff/60);
        return 'Logged ' + diff + 'hours ago';
    }
    else if(Math.floor(diff/24)<7){ //hours
        diff = Math.floor(diff/24);
        return 'Logged ' + Math.floor(diff/24) + 'days ago';
    }
    else if(diff<30){
        return 'Logged ' + Math.floor(diff/7) + 'weeks ago';
    }
    else if(diff<365){
        return 'Logged ' + Math.floor(diff/30) + 'months ago';
    }
    else {
        return 'Logged ' + Math.floor(diff/365) + 'years ago';
    }

}

module.exports=router;
