'use strict';

var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  next();
});

router.get('/create', function (req, res, next) {
  next();
})
router.post('/create', function (req, res, next) {
  next();
});

module.exports=router;
