'use strict';

var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.render('talk', {session: {logged: req.session.logged, username: req.session.username}});
});

module.exports=router;
