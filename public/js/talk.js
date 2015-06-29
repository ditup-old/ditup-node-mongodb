'use strict';

//require(['/libs/js/jquery', '/socket.io/socket.io'], 
(function ($, io) {
  //DOM elements
  var $chat = $('#chat');
  var $sendMessage = $('#send-message');
  var $message = $('#message');
  var $newTalkFormWrap = $('#new-talk-form-wrap');
  var $newTalkForm = $('#new-talk-form');
  var $newTalkMsg = $('#new-talk-msg');
  var $newTalkButton = $('#new-talk-button');
  var $talkList = $('#talk-list');

  //variables
  var newTalkUsers = [];
  var newTalkDits = [];


//****************incoming socket
  var socket = io(':3000/talk-io');
  //var socket = io();

  socket.on('connect', function () {
    $chat.append('connected to the server<br />');
  });

  socket.on('auth', function (sess) {
    $chat.append('you are '+(sess.logged !== true ? 'not ': '')+'logged in'+(sess.logged === true ? (' as '+ sess.username) : '')+'.<br />');
  });
  
  //show available talks
  socket.on('list talks', function (data) {
    console.log(JSON.stringify(data));
    var talks = data.talks;
    for(var i=0, len=talks.length; i<len; i++) {
      addTalk(talks[i]);
    }
  });

  //open a talk
  socket.on('start talk', function (data) {
    console.log('start a talk', data);
  });

  socket.on('disconnect', function () {
    $chat.append('disconnected from the server<br />');
  });

  $sendMessage.on('submit', function (e) {
    e.preventDefault();
    var msg = $message.val();
    $message.val('');
    socket.emit('new message', {msg: msg});
  });
  
  //this piece shows or hides form which starts a new talk to users
  $newTalkButton.on('mouseup', function (e) {
    console.log('clicked');
    e.preventDefault();
    hideShowNewTalk(ntbOn);
  });

  var ntbOn = false;
  function hideShowNewTalk(show) {
    ntbOn = !ntbOn;
    if(ntbOn === true){
      console.log('show');
      $newTalkFormWrap.show();
      $newTalkButton.text('Cancel the new talk');
    }
    else {
      console.log('hide');
      $newTalkFormWrap.hide();
      $newTalkButton.text('Start a new talk');
    }
  }

  $newTalkForm.on('submit', function (e) {
    e.preventDefault();
    var msg = $newTalkMsg.val();
    if(newTalkUsers.length + newTalkDits.length > 0 && msg) {
      socket.emit('new talk', {
        users: newTalkUsers,
        dits: newTalkDits,
        message: msg
      });

      clearNewTalk();
      hideShowNewTalk(false);
    }
  });

  function clearNewTalk() {
    newTalkUsers = [];
    newTalkDits = [];
    $('#new-talk-participants').empty();
    $newTalkMsg.val('');
    $('#new-talk-form input[type=text]').val('');
  }

  $('#new-talk-form input[type=text]')
  //.bind('keypress', false)
  .on('focusout',function(){    
    var txt= this.value.replace(/[^a-zA-Z0-9\+\-\.\#]/g,''); // allowed characters
    if(txt) {
      if(newTalkUsers.indexOf(txt) === -1) {
        newTalkUsers.push(txt);
        $('#new-talk-participants').append(' <span class="new-participant" style="background-color:blue;" >'+ txt.toLowerCase() +'</span> ');
      }
    }
    this.value='';
  }).on('keypress',function( e ){
  // if: comma,enter (delimit more keyCodes with | pipe)
    if(/(188|13)/.test(e.which)){
      console.log('pressed enter', e);
      $(this).focusout(); 
      e.preventDefault();
      return false;
    }
  });


  $('#new-talk-participants').on('click','.new-participant',function(){
    console.log('click');
    var index = newTalkUsers.indexOf($(this).text());
    if (index > -1) {
      newTalkUsers.splice(index, 1);
      console.log('removed');
    }
    $(this).remove(); 
  });

  function addTalk(talk){
    var talkElement = $(document.createElement('div'))
      .text('talk ' + String(talk.id))
      .on('mouseup', function () {
        console.log('start talk', talk.id);
        socket.emit('start talk', {id: talk.id});
      });
    $talkList.append(talkElement);
  }



})(jQuery, io);
