'use strict';

require.config({
  urlArgs: "bust=" + (new Date()).getTime(),
  baseUrl: '/js',
  paths: {
    jquery: '/libs/js/jquery'
  }
});

require(['tags/TagSearch', 'tags/TagSearchItem', 'tags/Tag', 'jquery'], function (TagSearch, TagSearchItem, Tag, $) {
  //DOM elements
  //var $tagSearch = $('#tag-search');
  var $tagSearchInput = $('#tag-search-input');
  var $tagSearchOutput = $('#tag-search-output');
  var $tagList = $('#tag-list');
  //variables

  var tagTemplate = '<span></span>'

  var tagBox = new TagSearch({
    input: $tagSearchInput,
    output: $tagSearchOutput,
    process: function (tagData) {
      var item = new TagSearchItem({
        tag2: 'asdf',
        tag: tagData,
        action: function (data) {
          //show unsaved tag in the list
          console.log('clicked tag');
          var tag = new Tag({
            data: tagData,
            click: function () {
              //link to the tag page
            },
            close: function () {
              //remove tag of user from database
              //on success remove this tag from th
            },
            saved: false
          });

          //save tag to list of user tags
          $.ajax({
            url: '/ajax/add-tag',
            async: true,
            method: 'POST',
            data: {tagname: tagData.name},
            dataType: 'json'
          })
          .then(function (resp){
            console.log(JSON.stringify(resp));
          });
          //change unsaved tag to saved tag on success
          var tagListItem = $(document.createElement('li')).append(tag.dom.main);
          tagListItem.appendTo($tagList);
        },
      });
      console.log(item);
      return item.dom.main;
    }
  });
});
