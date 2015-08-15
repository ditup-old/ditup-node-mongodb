'use strict';

var express = require('express');
var router = express.Router();

var fcs = require('./tag/functions');

router
  .get('/', function (req, res, next) {
    return res.redirect('tags');
  })
  .get('/:tag', function (req, res, next) {
    var sess = req.session.data;
    var requestTag = req.params.tag;
    fcs.getTag({name: requestTag})
      .then(function (foundTag) {
        res.render('tag', {data: foundTag, session: sess});
      })
      .catch(function(err) {
        res.render('sysinfo', {msg: err, session: sess});
      });
    var data = {
      name: requestTag
    };
  })
  .get('/:tag/edit', function (req, res, next) {
    var sess = req.session.data;
    var data = {};
    if (sess.loggedin === true) {
      res.render('tag-edit', {data: data, session: sess});
    }
    else {
      res.render('sysinfo', {msg: 'you need to be logged in to edit a tag', session: sess});
    }
  })
  .post('/:tag/edit', function (req, res, next) {
    res.end('todo');
  });

module.exports=router;
