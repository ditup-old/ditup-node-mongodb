'use strict';

var TalkModel = require('../../models/talk');
var UserModel = require('../../models/user');
var Q = require('q');
var mongoose = require('mongoose');

var getTalks = function (username, params) {
  console.log('getting talks');
  var deferred = Q.defer();
  
  UserModel.find({username: username}).exec()
    .then(function (users) {
      if(users.length == 0 || users.length > 1)
        deferred.reject('there is different number of users than expected');
      var userId=users[0]._id;
      console.log('user_id', userId);
      return TalkModel.find({'participants.users.id': userId}).populate('participants.users', 'username').populate('participants.dits', 'url').exec();
    },
    function (err) {
      console.log(err);
      deferred.reject(err);
    })
    .then(function (talks) {
      console.log('here the talks', talks);
      return deferred.resolve(talks);
    });

  return deferred.promise;
};

module.exports = 
{
  getTalks: getTalks,
  processTalks: function (talks) {
    var deferred = Q.defer();

    process.nextTick(function () {
      var processed = [];
      for (var i=0, len=talks.length; i<len; i++){
        var tk = talks[i];
        var usrs = [];
        var dits = [];
        
        for (var j = 0, len2 = tk.participants.users.length; j < len2; j++) {
          console.log(JSON.stringify(tk.participants.users[j]));
          usrs.push({
            username: tk.participants.users[j].username
          });
        }

        for (var j = 0, len2 = tk.participants.dits.length; j < len2; j++) {
          dits.push({
            url: tk.participants.dits[j].url
          });
        }

        processed.push({
          id: tk.id,//new Buffer(tk.id, 'base64')
          participants: {
            users: usrs,
            dits: dits
          }
        });
      }
      deferred.resolve(processed);
    });

    return deferred.promise;
  },
  validateNewTalk: function (data) {
    console.log('validating')
    return Q.resolve('asdf');
  },
  saveNewTalk: function (data) {
    var deferred = Q.defer();
    console.log('saving');
    //data={array of usernames, array of dit urls}
    var myId, userIds = [];

    Q(UserModel.find({username: data.me}, '_id').exec())
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
          deferred_.resolve(nu);
        });
        return deferred_.promise;
      })
      .catch(function(e){
        console.log(e);
        return deferred.reject(e);
      });
    return deferred.promise;
  },
  getTalk: getTalk
};

function getTalk (talk) {
  var deferred = Q.defer();
  TalkModel.findOne({_id: mongoose.Types.ObjectId(talk.id)}).exec()
    .then(function (tk) {
      return deferred.resolve(tk);
    });
    //.catch(function (err) {
    //  return deferred.reject(err);
    //});

  return deferred.promise;
}
