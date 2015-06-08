'use strict';

var express = require('express');
var router = express.Router();

router
  .get('/', function (req, res, next) {})
  .get('/:tag', function (req, res, next) {})
  .get('/:tag/edit', function (req, res, next) {})
  .post('/:tag/edit', function (req, res, next) {});

module.exports=router;
