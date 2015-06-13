'use strict';

var express = require('express');
var router = express.Router();
var fcs = require('./dit/functions');
var Q = require('q');

router
  .get('/', function (req, res, next) {
    var url = req.originalUrl;
    return res.redirect(url+'s');
  })
  .get('/:url', function (req, res, next) {
    var sess = req.session.data;
    var url = req.params.url;
    var originalUrl = req.originalUrl;
    var urlArray = req.originalUrl.replace(/^[\/]+|[\/]+$/,'').split('/');
    var originalForm = urlArray[0];
  
    //get data(url)
    //get my rights(me, dit)
    //process dit data (dit)
    //render dit
    var dit, data, rights;
    Q.when(fcs.getDit({url:url}))
      .then(function (_dit) {
        dit = _dit;
        var me = {logged: sess.logged, username: sess.username};
        return fcs.getMyRightsToDit(me, dit);
      })
      .then(function (_rights) {
        rights = _rights;
        if (rights.view !== true){
          Q.reject('you don\'t have rights to see the dit');
          throw new Error('abort promise chain');
        }
        if (dit.form !== originalForm) {
          res.redirect('/'+dit.form+'/'+url);
          throw new Error('abort promise chain');
        }
        return fcs.processDitData(dit);
      })
      .then(function (data) {
        res.render('dit-profile', {data:data, rights:rights});
      })
      .fail(function (err) {
        if(err.message === 'abort promise chain') {
        
        }
        else throw err;
      })
      .catch(function (err) {
        res.render('sysinfo', {msg: err});
      });
  })
  .get('/:url/logo', function (req, res, next) {
    //check if i have rights to see the logo
    //load the logo
    //serve the logo
    next();
  })
  .get('/:url/edit', function (req, res, next) {
    var url = req.params.url;
    var originalUrl = req.originalUrl;
    var urlArray = req.originalUrl.replace(/^[\/]+|[\/]+$/,'').split('/');
    var originalForm = urlArray[0];
  
    //get data(url)
    //get my rights(me, dit)
    //process dit data (dit)
    //render dit edit form
    var dit, data, rights;
    Q.when(fcs.getDit({url:url}))
      .then(function (_dit) {
        dit = _dit;
        var me = {logged: sess.logged, username: sess.username};
        return fcs.getMyRightsToDit(me, dit);
      })
      .then(function (_rights) {
        rights = _rights;
        if (rights.edit !== true){
          Q.reject('you don\'t have rights to edit the dit');
          throw new Error('abort promise chain');
        }
        if (dit.form !== originalForm) {
          res.redirect('/'+dit.form+'/'+url+'/edit');
          throw new Error('abort promise chain');
        }
        return fcs.processDitDataEdit(dit);
      })
      .then(function (data) {
        res.render('dit-profile-edit', {data:data, rights:rights});
      })
      .fail(function (err) {
        if(err.message === 'abort promise chain') {
        
        }
        else throw err;
      })
      .catch(function (err) {
        res.render('sysinfo', {msg: err});
      });
  })
  .post('/:url/edit', function (req, res, next) {
    var url = req.params.url;
    var form = req.body;
    var formData = {
      form: form.form,
      name: form.name,
      summary: form.summary,
      about: form.about
    };
    //get dit data
    //check if i can edit it iCanEditDit(me, dit)... it will reject if i can't, and return object of my rights and options
    //validate dit data... (and if invalid, render the edit page with errors)
    //update dit profile
    //redirect to the dit profile (TODO with some info about successful update)
    var dit, data, rights;
    Q.when(fcs.getDit({url:url}))
      .then(function (_dit) {
        dit = _dit;
        var me = {logged: sess.logged, username: sess.username};
        return fcs.iCanEditDit(me, dit);
      })
      .then(function (_rights) {
        rights = _rights;
        return fcs.validateDitForm(formData);
      })
      .then(function (validData) {
        data = validData;
        return fcs.updateDitProfile(url, validData);
      })
      .then(function () {
        //req.session; //TODO put message to show in the next page 
        return res.redirect('/'+data.form+'/'+url);
      }, function (errors) {
        return res.render('dit-profile-edit', {data:formData, rights:rights, errors: errors});
      })
      .catch(function (err) {
        return res.render('sysinfo', {msg: err});
      });
  });

module.exports=router;
