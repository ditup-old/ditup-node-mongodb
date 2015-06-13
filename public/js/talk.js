//require(['/libs/js/jquery', '/socket.io/socket.io'], 
(function ($, io) {

  var $chat = $('#chat');
  var socket = io(':3000/talk-io');
  //var socket = io();

  socket.on('connect', function () {
    $chat.append('connected to the server<br />');
  });

  socket.on('auth', function (sess) {
    $chat.append('you are '+(sess.logged !== true ? 'not ': '')+'logged in'+(sess.logged === true ? (' as '+ sess.username) : '')+'.<br />');
  });

  socket.on('disconnect', function () {
    $chat.append('disconnected from the server<br />');
  });

})(jQuery, io);
