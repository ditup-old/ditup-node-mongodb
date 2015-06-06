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
        var me = {logged: req.session.logged, username: req.session.username};
        return fcs.getMeToDit(me, dit);
      })
      .then(function (_rights) {
        rights = _rights;
        if (rights.view !== true){
          Q.reject('you don\'t have rights to see the dit');
          throw new Error('abort promise chain');
        }
        if (dit.form !== originalForm) {
          res.redirect('/'+dit.form+'/url');
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
  .get('/:url/edit', function (req, res, next) {
    next();
  })
  .post('/:url/edit', function (req, res, next) {
    next();
  });

module.exports=router;
