'use strict';

var mongoose = require('mongoose');

var TalkSchema = new mongoose.Schema({
  topic: {type: String, default: ''},
  participants: {
    users:[{
      id: {type: mongoose.Schema.ObjectId, ref: 'user'},
      viewed: Boolean
    }],
    dits:[{
      id: {type: mongoose.Schema.ObjectId, ref: 'dit'},
      viewed: [{type: mongoose.Schema.ObjectId, ref: 'user'}]
    }]
  },
  messages: [{
    sent: {type: Date, default: Date.now},
    from: {type: mongoose.Schema.ObjectId, ref: 'user'},
    text: String
  }],
  started: {type: Date, default: Date.now}
}, {collection: 'talk'});

module.exports = mongoose.model('Talk', TalkSchema);
