'use strict';

var mongoose = require('mongoose');

var DitSchema = new mongoose.Schema({
  url: {type: String, unique: true},
  dittype: {type: String, enum: ['', 'idea', 'project', 'challenge', 'interest'], default: ''},
  profile: {
    name: String,     //Dit name
    summary: String,  //dit tweet-length summary of dit's purpose
    about: String     //dit description
  },
  tags: [{type: mongoose.Schema.ObjectId, ref: 'tag'}],
  members: [{
    user: {type: mongoose.Schema.ObjectId, ref: 'user'},
    relation: {type: String, enum: ['member', 'admin', 'joined', 'invited']}
  }],
  meta: {
    created: {type: Date, default: Date.now},
    creator: {type: mongoose.Schema.ObjectId, ref: 'user'},
  },
  settings: {
    view: {type: String, enum: ['all', 'members', 'admins'], default: 'members'}
  }
}, {collection: 'dit'});

module.exports = mongoose.model('Dit', DitSchema);
