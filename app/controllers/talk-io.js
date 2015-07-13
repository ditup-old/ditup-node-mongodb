'use strict';

var func = require('./talk-io/functions.js');

module.exports = function  (socket, params, io) {
  //console.log(socket.request, socket.request.session, socket.request.session.data);
  var sess = socket.request.session.data;
  var users = params.users;
  var logged = (sess && sess.logged === true) ? true : false;
  var username = logged ? sess.username : null;
  
  if (logged === true) {
    users[username] = {
      username: username,
      socket: socket
    };
  }

  socket.emit('auth', {logged: logged, username: username});

  
  //find talks in which user is involved and send them to user.
  func.getTalks(username, {})
    .then(function (tks) {
      return func.processTalks(tks, {logged: logged, username: username})
    })
    .then(function (talks) {
      console.log('emitting', talks);
      for(var i=0, len=talks.length; i<len; i++){
        socket.join(talks[i].url);
      }
      socket.emit('list talks', {talks: talks});
    });

  
  //when user wrote a new message, send it to everybody, who cares and has rights to care.
  socket.on('new message', function (data) {
    console.log(data);
    //validate data
    //save message to database
    console.log(sess);
    func.saveMessage(data, {username: username})
      .then(function (saved) {
        io.to(data.talk).emit('show message', {msg: saved, talk: data.talk});
      });
    //send message to the correct talk room.
  });

  //saving new talk
  socket.on('new talk', function (data) {
    console.log(data);
    data.me = username;
    data.usernames = data.users;
    //validate data {users[], dits[], message}
    func.validateNewTalk(data)
      .then(function () {
        return func.saveNewTalk(data);
      })
      .then(function () {
        return showTalk(data);
      })
      .catch(function (e) {
        console.log(JSON.stringify(e));
      });
    //save talk to database
    //put talk to users array
    //return data to callback
  });

  function showTalk(data) {
    //data should be list of participants and messages (last several messages)
    socket.emit('show talk', data);
  }

  socket.on('start talk', function (talk) {
    func.getTalk(talk)
      .then(function (tk) {
        return func.processTalk(tk, {logged: logged, username: username});
      })
      .then(function (tk) {
        socket.emit('start talk', {talk: tk});
      })
      .catch(function (err) {
        console.log(err);
      });
  });

  socket.on('disconnect', function () {
    delete users[username];
    //give information to others that the user was disconnected
    console.log('client disconnected');
  });
};
