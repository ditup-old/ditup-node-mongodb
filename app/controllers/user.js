'use strict';

var express = require('express');
var Q = require('q');
var router = express.Router();

var fcs = require('./user/functions');

router
  .get('/', function (req, res, next) {
    //var urlArray = req.originalUrl.replace(/^[\/]+|[\/]+$/,'').split('/');
    return res.redirect('/users');
  })
  .get('/:username', function (req, res, next) {
    var username = req.params.username;
    var sess = req.session.data;
  //  var urlArray = req.originalUrl.replace(/^[\/]+|[\/]+$/,'').split('/');
  //  if(urlArray[0] === 'users') return res.redirect('/user/' + username);
    var user, rights;
    fcs.getUser({username: username})
      .then(function (_user){
        user = _user;
        return fcs.myRightsToUser({logged: sess.logged, username: sess.username}, user); //should return true/false & if true, type of rights
      })
      .then(function (_rights) {
        rights = _rights;
        if(rights.view !== true){
          return Q.reject('you don\'t have rights to view this user');
        }
        return fcs.processUserData(user);
      })
      .then(function (profile) {
        return res.render('user-profile', {profile: profile, rights: rights, session: sess});
      })
      .catch(function (err) {
        res.render('sysinfo', {msg: err, session: sess});
      });
  })
  .get('/:username/avatar', function (req, res, next) {
    var sess = req.session.data;
    var username = req.params.username;

    var user, rights;
    fcs.getUser({username: username})
      .then(function (_user){
        user = _user;
        var me = {logged: sess.logged, username: sess.username};
        return fcs.myRightsToUser(me, user); //should return true/false & if true, type of rights
      })
      .then(function (_rights) {
        rights = _rights;
        if(rights.view !== true){
          return Q.reject('cannot view');
        }
        return fcs.getAvatar(username);
      })
      .then(function (image) {
        res.writeHead(200, {'Content-Type': image.type});
        return res.end(image.data); // Send the file data to the browser.
      })
      .catch(function (err) {
        console.log(err);
        return fcs.getErrorImage();
      })
      .then(function(image) {
        res.writeHead(404, {'Content-Type': image.type});
        return res.end(image.data); // Send the file data to the browser.
      }, function(err){
        return res.end(err);
      });
  })
  .get('/:username/edit', function (req, res, next) {
    var sess = req.session.data;
    var username = req.params.username;


    var user, rights;
    fcs.getUser({username: username})
      .then(function (_user){
        user = _user;
        var me = {logged: sess.logged, username: sess.username};
        return fcs.myRightsToUser(me, user); //should return true/false & if true, type of rights
      })
      .then(function (_rights) {
        rights = _rights;
        if(rights.edit !== true){
          return Q.reject('you don\'t have rights to edit user ' + username + '. you probably need to be logged in as this user or have some very special rights.');
        }
        return fcs.processUserDataEdit(user);
      })
      .then(function (profile) {
        return res.render('user-profile-edit', {profile: profile, session: sess});
      })
      .catch(function (err) {
        return res.render('sysinfo', {msg: err, session: sess});
      });
  })
  .post('/:username/edit', function (req, res, next){
    var username = req.params.username;
    var sess = req.session.data;

    var user, rights;
    fcs.getUser({username: username})
      .then(function (_user){
        user = _user;
        var me = {logged: sess.logged, username: sess.username};
        return fcs.myRightsToUser(me, user); //should return true/false & if true, type of rights
      })
      .then(function (_rights) {
        rights = _rights;
        if(rights.edit !== true){
          return Q.reject('you don\'t have rights to edit user ' + username + '. you probably need to be logged in as this user.');
        }
        var form = req.body;
        var profileForm = {
          birthday: form.birthday,
          gender: form.gender,
          name: form.name,
          surname: form.surname,
          about: form.about,
        };
        return fcs.validateProfile(profileForm);
      })
      .then(function (validProfile) {
        return fcs.updateUserProfile(username, validProfile);
      })
      .then(function () {
        return res.redirect('/user/' + username);
      })
      .catch(function (err) {
        return res.render('sysinfo', {msg: err, session: sess});
      });
  });

module.exports=router;
