//require(['/libs/js/jquery', '/socket.io/socket.io'], 
(function ($, io) {

  var $chat = $('#chat');
  var socket = io(':3000/talk-io');
  //var socket = io();

  socket.on('connect', function () {
    $chat.append('connected to the server<br />');
  });

  socket.on('disconnect', function () {
    $chat.append('disconnected from the server<br />');
  });

})(jQuery, io);
