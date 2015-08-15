'use strict';

var Q = require('q');
var TagModel = require('../../models/tag');
var fs = require('fs');

var getTag = function (tag) {
  var deferred = Q.defer();
  if(tag.hasOwnProperty('name')) {
    TagModel.find({name: tag.name}).exec()
    .then(function (foundTags) {
      if (foundTags.length === 0) return deferred.reject('tag not found');
      if (foundTags.length > 1) return deferred.reject('weird error: duplicate tag');
      return deferred.resolve(foundTags[0]);
    });
  }
  else {
    deferred.reject('proper data for function getTag not provided');
  }
  console.log('getting tag');
  return deferred.promise;
};

function createTag (data) {
  //name: {type: String, unique: true},
  //description: {type: String},
  //meta: {
  //  create_time: {type: Date},
  //  creator: {type: Schema.ObjectId, ref: 'user'},
  //  users: [{type: Schema.ObjectId, ref: 'user'}],
  //  dits: [{type: Schema.ObjectId, ref: 'dit'}]
  //}
  var deferred = Q.defer();
  //data={array of usernames, array of dit urls}

  Q(UserModel.find({username: data.creator}, '_id').exec())
    .then(function (_myId) {
      console.log('hello', _myId[0]._id.constructor);
//        myId = mongoose.Types.ObjectId(_myId[0]._id);
      myId = _myId[0]._id;
      console.log('myId',myId);
      return UserModel.find({
        'username': { $in: data.usernames}
      }, '_id').exec();
    })
    .then(function (_userIds){
      var deferred_ = Q.defer();
      console.log('ids',_userIds);
      for(var i=0, len=_userIds.length; i<len; i++){
        userIds.push(String(_userIds[i]._id));
        //userIds.push(mongoose.Types.ObjectId(_userIds[i]._id));
      }
      console.log('indexofmyid', userIds.indexOf(String(myId)));
      if(userIds.indexOf(String(myId)) === -1) userIds.push(String(myId));
      var usersWhole = [];
      for(var i=0, len=userIds.length; i<len; i++){
        usersWhole.push({
          id: mongoose.Types.ObjectId(userIds[i]),
          viewed: String(userIds[i]) === String(myId) ? true : false
        });
      }
      console.log(userIds);
      var newTalk = new TalkModel({
        participants: {
          users: usersWhole,
          dits: []
        },
        messages: [{
          from: myId,
          text: data.message
        }]
      });
      newTalk.save(function(err, nu){
        if(err) deferred_.reject(err);
        deferred_.resolve({id: nu._id});
      });
      return deferred_.promise;
    })
    .then(getTalk)
    .then(function (talk) {
      deferred.resolve(talk);
    })
    .catch(function(e){
      console.log(e);
      return deferred.reject(e);
    });
  return deferred.promise;
}

module.exports = {
  getTag: getTag,
  createTag: createTag
};
