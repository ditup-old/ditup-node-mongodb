'use strict';

require.config({
  urlArgs: "bust=" + (new Date()).getTime(),
  baseUrl: '/js',
  paths: {
    jquery: '/libs/js/jquery'
  }
});

require(['tags/Tag', 'jquery'], function (Tag, $) {
  //DOM elements
  var $tagList = $('#tag-list');
  //variables

  var tagFunctions = {
    click: function (tagData) {
      //link to the tag page
      return function () {};
    },
    close: function (tagData) {
      return null;
    }
  };

  //asynchronously loading and showing tags
  $.ajax({
    url: '/ajax/get-tags',
    async: true,
    method: 'POST',
    data: {username: 'test1'}, //just for testing purposes! how to get username?
    dataType: 'json'
  })
  .then(function (resp){
    $tagList.empty();
    console.log(JSON.stringify(resp));
    for(var i=0, len=resp.length; i<len; i++){
      var tag = new Tag({
        data: resp[i],
        click: tagFunctions.click(resp[i]),
        close: tagFunctions.close(resp[i]),
        saved: true
      });

      var tagListItem = $(document.createElement('li')).append(tag.dom.main);
      tagListItem.appendTo($tagList);
    }
  });
});
