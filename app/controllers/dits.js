'use strict';

var express = require('express');
var router = express.Router();

router
  .get('/', function (req, res, next) {
    res.end('general '+ req.originalUrl.substr(1) +' page');
  })
  .get('/create', function (req, res, next) {
    res.end('TODO get dits/create');
  })
  .post('/create', function (req, res, next) {
    res.end('TODO post dits/create');
  });

module.exports=router;
