'use strict';

define(['jquery'], function ($) {

  var TagSearch = function (data) {
    data.input.on('keyup', function (e) {
      e.preventDefault();
      console.log(data.input.val());
      $.ajax({
        url: '/tags/search',
        async: true,
        method: 'POST',
        data: {query: data.input.val()},
        dataType: 'json'
      })
        .then(function (response) {
          data.output.empty();
          for (var i=0, len=response.length; i<len; i++){
            //console.log(data);
            var output = data.process(response[i]);
            $(document.createElement('li')).append(output).appendTo(data.output);
          }
        });
    });
  };

  return TagSearch;
});
