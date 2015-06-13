'use strict';

var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  console.log(req.session);
  var sess = req.session.data;
  res.render('talk', {session: {logged: sess.logged, username: sess.username}});
});

module.exports=router;

