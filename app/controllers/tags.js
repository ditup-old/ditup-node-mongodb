'use strict';

var express = require('express');
var router = express.Router();
var func = require('./tag/functions');

router.get('/', function (req, res, next) {
  var sess = req.session.data;
  res.render('tags', {session: sess});
});

router.get('/create', function (req, res, next) {
  var sess = req.session.data;
  if(sess.logged === true) {
    var data = {
      name: '',
      description: ''
    };
    res.render('tags-create', {data:data, session: sess});
  }
  else {
    res.render('sysinfo', {msg: 'you have to be logged in to create a tag', session: sess})
  }
})
router.post('/create', function (req, res, next) {
  var sess = req.session;
  console.log('session', sess);
  var form = req.body;
  var data = {
    name: form.name,
    description: form.description,
    creator: {
      username: sess.data.username,
      id: sess.data.id
    }
  };
  console.log(data);
  func.createTag(data)
    .then(function (id) {
      console.log(id);
      res.redirect('/tag/'+data.name);      
    })
    .catch(function (err) {
      res.render('sysinfo', {msg: err, session: sess});
    });
});

module.exports=router;
