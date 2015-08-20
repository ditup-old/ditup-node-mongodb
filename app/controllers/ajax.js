'use strict';

var express = require('express');
var router = express.Router();
var func = require('./tag/functions');
var userFunc = require('./user/functions');

router.post('/add-tag', function (req, res, next) {
  var tagname = req.body.tagname;
  console.log('tagname', tagname);
  var sess = req.session;
  console.log('ajax session', sess);

  userFunc.addTagToUser({username: sess.data.username, tagname: req.body.tagname})
    .then(function (answer) {
      res.setHeader('Content-Type', 'application/json');
      return res.send(JSON.stringify({}));
      //res.end(JSON.stringify());
    })
    .catch(function (err) {
      res.setHeader('Content-Type', 'application/json');
      return res.send(JSON.stringify(err));
    });
});

module.exports=router;
