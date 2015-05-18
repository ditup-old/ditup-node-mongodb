'use strict';

var express = require('express'),
    app = express(),
    path = require('path'),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    http = require('http');


// database connection
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/mydb', function (err) {
    if(err) {
        console.log('connection error', err);
    }
    else {
        console.log('connection successful');
    }
});

// some environment variables

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/app/views');
app.set('view engine', 'ejs');
//app.use(express.favicon());
//app.use(express.logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended:true
}));
//app.use(express.methodOverride());
//app.use(express.cookieParser('your secret here'));
//app.use(express.session());
//app.use(app.router);
app.use(express.static(path.join(__dirname + '/public')));
/*fs.readdirSync('./app/controllers').forEach(function (file) {
    if(file.substr(-3) == '.js') {
        route = require('./app/controllers/' + file);
        route.controller(app);
    }
});
*/

var modules = require('./routes.json');

for(var i=0, len=modules.length; i<len; i++){
    var controller=require("./app/controllers/"+modules[i].controller);
    if(modules[i].type==="get") {
        console.log('loaded',modules[i].url);
        app.get(modules[i].url, controller);
    }
    else if(modules[i].type==="post") {
        console.log('loaded',modules[i].url);
        app.post(modules[i].url, controller);
    }
    else if(modules[i].type==="use") {
        console.log('loaded',modules[i].url);
        app.use(modules[i].url, controller);
    }
}

//var signupRouter = require('./app/controllers/signup');
//console.log('fk');
//app.use('/signup', signupRouter);


http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port', app.get('port'));
});

/*    .use('/about', function (req, res, next) {
        var pictures = require('./pictures.json');
        var picture = pictures[Math.floor(Math.random()*pictures.length)];
        res.render('start', {
            picture: picture
        });
    })
    .use(function(req, res, next) {
        res.end('basic server');
    })
    .listen(3000);

    console.log('listening on port 3000');
    */
