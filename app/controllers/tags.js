'use strict';

var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  var sess = req.session.data;
  res.render('tags', {session: sess});
});

router.get('/create', function (req, res, next) {
  var sess = req.session.data;
  var data = {
    name: '',
    description: ''
  };
  res.render('tags-create', {data:data, session: sess});
})
router.post('/create', function (req, res, next) {
  res.end('todo');
});

module.exports=router;
