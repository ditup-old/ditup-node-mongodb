'use strict';

require.config({
  baseUrl: '/js/tags/',
  paths: {
    jquery: '/libs/js/jquery'
  }
});

require(['TagSearch', 'TagSearchItem', 'jquery'], function (TagSearch, TagSearchItem, $) {
  //DOM elements
  var $tagSearch = $('#tag-search');
  var $tagSearchInput = $('#tag-search-input');
  var $tagSearchOutput = $('#tag-search-output');
  var $tagList = $('#tag-list');
  //variables

  var tagBox = new TagSearch({
    input: $tagSearchInput,
    output: $tagSearchOutput,
    process: function (tagData) {
      var item = new TagSearchItem({});
      return item;
    }
  });
});
