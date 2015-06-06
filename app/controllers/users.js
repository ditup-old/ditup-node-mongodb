'use strict';

var express = require('express');
var UserModel = require('../models/user');
var Q = require('q');
var router = express.Router();

router.get('/', function (req, res, next) {
  res.end('general people page');
});

module.exports=router;
