'use strict';

var express = require('express');
var router = express.Router();

//var mongoose = require('mongoose');
//var User = require('../models/user');

router.get('/', function(req, res, next){
    res.render('signup');
});

router.post('/', function(req, res, next){
    console.log(req.body);
    res.end(JSON.stringify(req.body));
});

module.exports = router;

