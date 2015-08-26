'use strict';

var express = require('express');
var router = express.Router();
var func = require('./tag/functions');
var userFunc = require('./user/functions');

router.post('/add-tag', function (req, res, next) {
  var tagname = req.body.tagname;
  console.log('tagname', tagname);
  var sess = req.session;
  console.log('ajax session', sess);

  userFunc.addTagToUser({username: sess.data.username, tagname: req.body.tagname})
    .then(function (answer) {
      res.setHeader('Content-Type', 'application/json');
      return res.send(JSON.stringify(answer));
      //res.end(JSON.stringify());
    })
    .catch(function (err) {
      res.setHeader('Content-Type', 'application/json');
      return res.send(JSON.stringify(err));
    });
});

router.post('/remove-tag', function (req, res, next) {
  var tagname = req.body.tagname;
  console.log('tagname', tagname);
  var sess = req.session;
  console.log('ajax session', sess);

  //what if user is not logged in? fix!!!

  userFunc.removeTagFromUser({username: sess.data.username, tagname: req.body.tagname})
    .then(function (answer) {
      res.setHeader('Content-Type', 'application/json');
      return res.send(JSON.stringify(answer));
      //res.end(JSON.stringify());
    })
    .catch(function (err) {
      res.setHeader('Content-Type', 'application/json');
      return res.send(JSON.stringify(err));
    });
});


router.get('/get-tags/user/:username', function (req, res, next) {
  var username = req.params.username;
  console.log('username', username);
  var sess = req.session;
  console.log('ajax session', sess);

  //what if user is not logged in? fix!!!
  if(sess.data.logged !== true) {
    res.setHeader('Content-Type', 'application/json');
    return res.send(JSON.stringify({error: 'you don\'t have rights to view tags of user ' + username}));
  }

  userFunc.getTagsOfUser({username: username})
    .then(function (answer) {
      res.setHeader('Content-Type', 'application/json');
      return res.send(JSON.stringify(answer));
      //res.end(JSON.stringify());
    })
    .catch(function (err) {
      res.setHeader('Content-Type', 'application/json');
      return res.send(JSON.stringify(err));
    });
});


router.post('/get-tags', function (req, res, next) {
  var username = req.body.username;
  console.log('username', username);
  var sess = req.session;
  console.log('ajax session', sess);

  //what if user is not logged in? fix!!!
  if(sess.data.logged !== true) {
    res.setHeader('Content-Type', 'application/json');
    return res.send(JSON.stringify({error: 'you don\'t have rights to view tags of user ' + username}));
  }

  userFunc.getTagsOfUser({username: username})
    .then(function (answer) {
      res.setHeader('Content-Type', 'application/json');
      return res.send(JSON.stringify(answer));
      //res.end(JSON.stringify());
    })
    .catch(function (err) {
      res.setHeader('Content-Type', 'application/json');
      return res.send(JSON.stringify(err));
    });
});

module.exports=router;
