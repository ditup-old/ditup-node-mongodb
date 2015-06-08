'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TagSchema = new Schema({
  name: {type: String, unique: true},
  description: {type: String},
  meta: {
    create_time: {type: Date},
    creator: {type: Schema.ObjectId, ref: 'user'},
    users: [{type: Schema.ObjectId, ref: 'user'}],
    dits: [{type: Schema.ObjectId, ref: 'dit'}]
  }
}, {collection: 'tag'});

module.exports = mongoose.model('Tag', TagSchema);
