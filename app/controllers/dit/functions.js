'use strict';

var Q = require('q');
var DitModel = require('../../models/dit');
var UserModel = require('../../models/user');

var getDit = function (dit) {
  var deferred = Q.defer();
  DitModel.findOne({url: dit.url})
    .populate({path: 'meta.creator', model: 'User', select: 'username -_id'})
    .populate({path: 'members.user', model: 'User', select: 'username -_id'})
    .exec()
    .then(function (dit) {
      console.log(dit);
      return deferred.resolve(dit);
    })
    .then(null, function (err) {
      return deferred.reject(err);
    });

  return deferred.promise;
};

var getMyRightsToDit = function (me, dit) {
  /****
  1. if not logged in, view: false
     else if all, view: true
     else if members && i'm member || admin: view: true, edit: fa
     else if members && i'm admin: view: true, edit: true
     else if admins && i'm admin: view: 
  ****/
  //console.log(dit);
  var view = false, edit = false;
  var membership;
  var meInDit=null;
  var viewSettings = dit.settings.view;
  console.log('input to rights', me, dit, viewSettings);
  if(me.logged === true){
    console.log('in logged');
    for (var i=0, len=dit.members.length; i<len; i++) {
      console.log(dit.members[i].user.username, me.username);
      if (dit.members[i].user.username === me.username){
        meInDit=dit.members[i].relation;
        break;
      }
    }
    console.log('me in dit', meInDit);
    //update edit rights
    if(meInDit!==null && meInDit==='admin'){
      edit=true;
    }
    if (viewSettings === 'all') {
      view=true;
    }
    else if (viewSettings === 'members' && meInDit!==null && (meInDit === 'member' || meInDit==='admin')){
      view=true;
    }
    else if (viewSettings === 'admins' && meInDit.relation === 'admin'){
      view=true;
    }
  }
  console.log('my rights to dit', view, edit);
  return Q.resolve({
    view: view,
    edit: edit
  });
};

var processDitData = function (dit) {
  console.log('processingDitData', dit);
  return Q.resolve({
    url: dit.url,
    dittype: dit.dittype,
    created: dit.meta.created,
    name: dit.profile.name,
    summary: dit.profile.summary,
    about: dit.profile.about,
    activity: 'activity should be an array of latest actions to feed...'
  });
};

var processDitDataEdit = processDitData;
var iCanEditDit = function (me, dit) {
  var deferred = Q.defer();
  getMyRightsToDit(me, dit)
    .then(function (rights) {
      if(rights.edit===true){
        return deferred.resolve(rights);
      }
      else {
        return deferred.reject(rights);
      }
    });
  return deferred.promise;
}; //will resolve only if me can edit dit, resolve or reject with object of my rights
var validateDitForm = function (data) {
  console.log('validating');
  return Q.resolve(data);
}; //will resolve only if data is valid.

function updateDitProfile(url, ditData) {
  var deferred = Q.defer();
  var query = { url: url };
  var update = {
    $set: {
      'profile.name': ditData.name,
      'profile.summary': ditData.summary,
      'profile.about': ditData.about,
      'dittype': ditData.dittype
    }
  };

  console.log('update', update);

  DitModel.update(query, update, {}, function(err, affected){
    console.log('affected', affected);
    if(err) return deferred.reject(err);
    if(affected.ok !== 1) return deferred.reject('not ok');
    if(affected.n < 1) return deferred.reject('not found');
    if(affected.n === 1) return deferred.resolve(true);
    if(affected.n > 1) return deferred.reject('this should not happen. updated more than 1 document');
    return deferred.reject('something else');
  });

  return deferred.promise;
}

function createDit(data) {
  var deferred = Q.defer();
  //TODO: validate the data!!!
  console.log('TODO validating of data!!!!!!!!!!');
  console.log('creating');
  
  //Q(UserModel.find({username: data.creator}, '_id').exec())
  Q.resolve([{_id: data.creator.id}])
    .then(function (_myId) {
      console.log('creator found', _myId);
      var deferred_ = Q.defer();
      var myId = _myId[0]._id;
      var newDit = new DitModel({
        url: data.url,
        dittype: data.dittype,
        profile: {
          name: data.name,
          summary: data.summary,
          about: ''
        },
        tags: [],
        members: [{
          user: myId,
          relation: 'admin'
        }],
        meta: {
          creator: myId
        },
        settings: {
          view: 'members'
        }
      });
      newDit.save(function(err, nu){
        console.log('saving in progress');
        if(err) {
          if (11000 === err.code || 11001 === err.code) return deferred_.reject('dit with url '+data.url+' already exists. choose different url.');
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

module.exports = {
  getDit: getDit,
  getMyRightsToDit: getMyRightsToDit,
  processDitData: processDitData,
  processDitDataEdit: processDitDataEdit,
  iCanEditDit: iCanEditDit,
  validateDitForm: validateDitForm,
  updateDitProfile: updateDitProfile,
  createDit: createDit
};

