'use strict';

var express = require('express');
var router = express.Router();
var func = require('./tag/functions');
var userFunc = require('./user/functions');
var ditFunc = require('./dit/functions');

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

router.post('/dit/get-tags', function (req, res, next) {
  
  var url = req.body.url;
  console.log('url', url);
  var sess = req.session.data;
  console.log('ajax session', sess);

  //what if user is not logged in? fix!!!
  if(sess.logged !== true) {
    res.setHeader('Content-Type', 'application/json');
    return res.send(JSON.stringify({error: 'you don\'t have rights to view tags of dit ' + url}));
  }

  //this needs to be optimalised. it's a very expensive querying (getting dit twice)
  ditFunc.getDit({url: url})
    .then(function (dit) {
      if(dit===null) return Q.reject({error: 'dit doesn\'t exist'});
      return ditFunc.getMyRightsToDit({logged: sess.logged, username: sess.username}, dit);
    })
    .then(function (rights) {
      if(rights.view===true) {
        return ditFunc.getTagsOfDit({url: url});
      }
      else return Q.reject({error: 'you don\'t have rights to see this dit'});
    })
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

router.post('/dit/add-tag', function (req, res, next) {
  console.log('inside dit/add-tag');
  var url = req.body.url;
  var tagname = req.body.tagname;
  var sess = req.session.data;
  console.log('ajax session', sess);

  ditFunc.getDit({url:url})
    .then(function (dit) {
      console.log('ajax, getting dit', dit)
      if(dit===null) {
        return Q.reject({error: 'dit does not exist'});
      }
      return ditFunc.getMyRightsToDit({logged: sess.logged, username: sess.username}, dit);
    })
    .then(function (rights) {
      if(rights.edit===true) {
        return ditFunc.addTagToDit({name: tagname},{url: url});
      }
      else return Q.reject({error: 'you can\'t edit this dit'});
    })
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

router.post('/dit/remove-tag', function (req, res, next) {
  console.log('inside /dit/remove-tag');
  var tagname = req.body.tagname;
  var url = req.body.url;
  var sess = req.session.data;

  //what if user is not logged in? fix!!!

  ditFunc.getDit({url: url})
    .then(function (dit) {
      console.log('we got dit', dit);
      if(dit===null) {
        return Q.reject({error: 'dit does not exist'});
      }
      return ditFunc.getMyRightsToDit({logged: sess.logged, username: sess.username}, dit);
    })
    .then(function (rights) {
      console.log('we got rights', rights);
      if(rights.edit===true) {
        return ditFunc.removeTagFromDit({name: tagname}, {url: url});
      }
      else return Q.reject({error: 'you can\'t edit this dit'});
    })
    .then(function (answer) {
      res.setHeader('Content-Type', 'application/json');
      return res.send(JSON.stringify(answer));
      //res.end(JSON.stringify());
    })
    .then(null, function (err) {
      res.setHeader('Content-Type', 'application/json');
      return res.send(JSON.stringify(err));
    });
});

module.exports=router;
