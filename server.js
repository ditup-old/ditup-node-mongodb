var express = require('express');

var app = express()
    .use(express.static(__dirname + '/public'))
    .use('/about', function (req, res, next) {
        res.end('static website');
    })
    .use(function(req, res, next) {
        res.end('basic server');
    })
    .listen(3000);
