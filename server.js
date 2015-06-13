'use strict';

var express = require('express'),
    session = require('express-session'),
    path = require('path'),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    http = require('http'),
    sio = require('socket.io'),
    app = express();


var server = http.createServer(app);

var io = sio.listen(server);

// database connection
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/ditup', function (err) {
  if(err) {
    console.log('connection error', err);
  }
  else {
    console.log('connection successful');
  }
});

var sessionMiddleware = session({secret:'ssshhhhh', resave: true, saveUninitialized: true});

// some environment variables

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/app/views');
app.set('view engine', 'ejs');
//app.use(express.favicon());
//app.use(express.logger('dev'));
app.use(sessionMiddleware);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
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

//setting session variables
app.use(function(req, res, next) {
  req.session.data = req.session.data || {logged: false, username: null};
  next();
});

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

var fof=require('./app/controllers/404');
app.use(fof);

//var signupRouter = require('./app/controllers/signup');
//console.log('fk');
//app.use('/signup', signupRouter);

io.use(function(socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});

var ioTalk = io.of('/talk-io');

ioTalk
  .on('connection', function (socket) {
    console.log(socket.request, socket.request.session, socket.request.session.data);
    var sess = socket.request.session.data;
    
    ioTalk.emit('auth', {logged: sess.logged, username: sess.username})
    console.log('srs:', socket.request.session);

    socket.on('disconnect', function () {
      console.log('client disconnected');
    });
  });


server.listen(app.get('port'), function() {
  console.log('Express server listening on port', app.get('port'));
});

/*  .use('/about', function (req, res, next) {
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
