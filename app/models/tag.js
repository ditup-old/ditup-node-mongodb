'use strict';

var mongoose = require('mongoose');

var TagSchema = new mongoose.Schema({
  tagname: {type: String, unique: true},
  description: {type: String},
  meta: {
    create_time: {type: Date},
    creator: {type: mongoose.Schema.ObjectId, ref: 'user'}
  }
}, {collection: 'tag'});

module.exports = mongoose.model('Tag', TagSchema);
