'use strict';

var mongoose = require('mongoose');

var DitSchema = new mongoose.Schema({
  url: {type: String, unique: true},
  form: {type: String, enum: ['idea', 'project', 'challenge', 'interest']},
  profile: {
    name: String,     //Dit name
    subtitle: String,  //dit surname
    description: String     //dit description
  },
  meta: {
    created: Date,
    creator: {type: mongoose.Schema.ObjectId, ref: 'user'},
  },
  settings: {
    privacy: {
      visible: {type: String, enum:['all', 'logged', 'members', 'none']} //who can see user profile?
    }
  }
}, {collection: 'dit'});

module.exports = mongoose.model('Dit', DitSchema);
