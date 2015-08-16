'use strict';

var Q = require('q');
var TagModel = require('../../models/tag');
var UserModel = require('../../models/user');
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

  console.log('creating');

  //Q(UserModel.find({username: data.creator}, '_id').exec())
  Q.resolve([{_id: data.creator.id}])
    .then(function (_myId) {
      console.log('creator found', _myId);
      var deferred_ = Q.defer();
      var myId = _myId[0]._id;
      var newTag = new TagModel({
        name: data.name,
        description: data.description,
        meta: {
          creator: myId,
          users: [],
          dits: []
        }
      });
      newTag.save(function(err, nu){
        console.log('saving in progress');
        if(err) {
          if (11000 === err.code || 11001 === err.code) return deferred_.reject('tag '+data.name+' already exists. use existing tag or name your new tag differently.');
          return deferred_.reject(err);
        }
          //console.log(nu, err);
        return deferred_.resolve({id: nu._id});
      });
      return deferred_.promise;
    })
    .then(function (_id) {
      deferred.resolve(_id);
    })
    .catch(function(e){
      console.log(e);
      return deferred.reject(e);
    });
  return deferred.promise;
}

function searchTags(queryString) {
  var deferred = Q.defer();

  if(queryString.length === 0) {
    deferred.resolve([]);
  }
  else {
    var queryStringFixed = queryString.replace(/[^a-zA-Z0-9]+/gi, '-');

    TagModel
      .find({name: {'$regex': queryStringFixed, '$options': 'i' }}, '-_id name description')
      .exec()
      .then(function (foundTags) {
        //console.log('tags', foundTags);
        return deferred.resolve(foundTags);
      })
      .then(undefined, function (err) {
        return deferred.reject(err);
      });
  }

  return deferred.promise;
}

module.exports = {
  getTag: getTag,
  createTag: createTag,
  searchTags: searchTags
};
