'use strict';

var express = require('express');
var router = express.Router();
var func = require('./dit/functions');

router
  .get('/', function (req, res, next) {
    res.end('general '+ req.originalUrl.substr(1) +' page');
  })
  .get('/create', function (req, res, next) {
    var sess = req.session.data;
    //you can create new dit when you're logged in.
    if(sess.logged === true) {
      res.render('dit-create', {session: sess});
    }
    else {
      res.render('sysinfo', {msg: 'you need to <a href="/login">log in</a> to be able to create a new dit', session: sess});
    }
  })
  .post('/create', function (req, res, next) {
    var sess = req.session.data;
    if (sess.logged===false){
      return res.render('sysinfo', {msg: 'saving failed. you are not logged in', session: sess});
    }


    console.log('session', sess);
    var form = req.body;
    var data = {
      name: form.name,
      url: form.url,
      dittype: form.dittype,
      summary: form.summary,
      creator: {
        username: sess.username,
        id: sess.id
      }
    };
    console.log(form, data);
    func.createDit(data)
      .then(function (id) {
        console.log(id);
        return res.redirect('/dit/' + data.url + '/edit');      
      })
      .catch(function (err) {
        return res.render('sysinfo', {msg: err, session: sess});
      });
  });

module.exports=router;
