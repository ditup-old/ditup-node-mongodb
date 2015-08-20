'use strict';

define(['jquery'], function ($) {

  var Tag = function (data) {
    //data: tagData,
    //click: function () {
      //link to the tag page
    //},
    //close: function () {
      //remove tag of user from database
      //on success remove this tag from th
    //},
    //saved: false
    var data = data || {};
    if (data.data === undefined) throw new Error('you need to specify tag data');
    data.click = data.click || function () {
      console.log('empty click');
    };
    data.close = data.close || function () {
      console.log('tag '+ data.data.name + ' click');
    }
    var tagDom = '<a class="tag unsaved" ><i class="tag-close fa fa-times"></i></a>';
    this.name = data.data.name;
    this.dom = {};
    this.dom.main = $($.parseHTML(tagDom));
    this.dom.main.attr({href: '/tag/'+this.name});
    this.dom.close = this.dom.main.find('.tag-close');
    this.dom.main.prepend(document.createTextNode(this.name));
    this.dom.close.on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      data.close();
    });
    this.dom.main.on('click', function () {
      data.click();
    });
  };

  return Tag;
});

