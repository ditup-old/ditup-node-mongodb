'use strict';

var mongoose = require('mongoose');

var TalkSchema = new mongoose.Schema({
  topic: {type: String, default: ''},
  participants: {
    users:[{
      id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
      viewed: Boolean
    }],
    dits:[{
      id: {type: mongoose.Schema.Types.ObjectId, ref: 'Dit'},
      viewed: [{type: mongoose.Schema.ObjectId, ref: 'User'}]
    }]
  },
  messages: [{
    sent: {type: Date, default: Date.now},
    from: {type: mongoose.Schema.ObjectId, ref: 'User'},
    text: String
  }],
  started: {type: Date, default: Date.now}
}, {collection: 'talk'});

module.exports = mongoose.model('Talk', TalkSchema);
