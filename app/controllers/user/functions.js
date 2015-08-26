'use strict';

var Q = require('q');
var UserModel = require('../../models/user');
var TagModel = require('../../models/tag');
var fs = require('fs');

var months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

var getUser = function (user) {
  var deferred = Q.defer();
  if(user.hasOwnProperty('username')) {
    UserModel.find({username: user.username}).exec()
    .then(function (users) {
      if (users.length === 0) return deferred.reject('user not found');
      if (users.length > 1) return deferred.reject('weird error: duplicate user');
      return deferred.resolve(users[0]);
    });
  }
  else {
    deferred.reject('proper data for function getUser not provided');
  }
  console.log('getting user');
  return deferred.promise;
};

var myRightsToUser = function (me, user) {
  var deferred = Q.defer();
  process.nextTick(function () {
    var amILogged = me.logged === true ? true : false;
    var isItMe = me.logged === true && me.username === user.username;
    var canIView = amILogged;
    var canIEdit = isItMe;

    deferred.resolve({
      view: canIView,
      edit: canIEdit
    });
  });
  console.log('checking rights');
  return deferred.promise;
};

var processUserData = function (userData) {
  console.log(userData);
  var deferred = Q.defer();
  process.nextTick(function(){
    var profile = {};
    //age
    profile.age = userData.profile.birthday instanceof Date ? '' + countAge(userData.profile.birthday) + ' years old' : '' ;
    //gender
    profile.gender = (userData.profile.gender != '' && userData.profile.gender != 'unspecified') ? userData.profile.gender : '';
    //joined
    var joinDate = userData.account.join_date;
    profile.joined = months[joinDate.getUTCMonth()]+' '+joinDate.getUTCDate()+' '+joinDate.getUTCFullYear();
    //last login
    profile.lastLogin = countLastLogin(userData.account.last_login);
    //name
    profile.name = userData.profile.name + ' ' + userData.profile.surname;
    //username
    profile.username = userData.username;
    //about
    profile.about = userData.profile.about;

    deferred.resolve(profile);
  });
  console.log('processing data');
  return deferred.promise;
};
    
var processUserDataEdit = function (userData) {
  var deferred = Q.defer();
  process.nextTick(function(){
    var profile = {};
    //age
    var brthDate = userData.profile.birthday;
    console.log(typeof(brthDate), typeof(null), brthDate instanceof Date);
    var birth = (brthDate instanceof Date) ? {
      month: brthDate.getUTCMonth()+1,
      day: brthDate.getUTCDate(),
      year: brthDate.getUTCFullYear()
    } : null;
    var birthday = (birth === null) ? '' : birth.year+'-'+ (birth.month<10?'0':'') +birth.month+'-'+ (birth.day<10?'0':'')+birth.day;
    profile.birthday = birthday;
    //gender
    profile.gender = userData.profile.gender === 'unspecified' ? null : userData.profile.gender;
    //name
    profile.name = userData.profile.name;
    //surname
    profile.surname = userData.profile.surname;
    //about
    profile.about = userData.profile.about;
    profile.username = userData.username;
    console.log(profile);
    deferred.resolve(profile);
  });
  return deferred.promise;
};

var validateProfile = function (profileData) {
  var deferred = Q.defer();
  process.nextTick(function () {
    var valid = true;
    var errors = {};
    var values = {
      birthday: null,
      gender: null,
      name: null,
      surname: null,
      about: null
    };
    //validate name (0 - 256 characters)
    if (profileData.name.length > 256) {
      valid = false;
      errors.name = errors.name || [];
      errors.name.push('name can be max 256 characters long');
    }
    values.name = profileData.name;
    //validate surname (0 - 256 characters)
    if (profileData.surname.length > 256) {
      valid = false;
      errors.surname = errors.surname || [];
      errors.surname.push('surname can be max 256 characters long');
    }
    values.surname = profileData.surname
    //validate gender (unspecified, male, female, other)
    var genderArray = ['unspecified', 'male', 'female', 'other'];
    var genderIndex = genderArray.indexOf(profileData.gender);
    if (!(genderIndex > -1)) {
      valid = false;
      errors.gender = errors.gender || [];
      errors.gender.push('please select gender from the list provided');
    }
    values.gender = (genderIndex > 0) ? genderArray[genderIndex] : null;

    //validate birthday
    var birthdayRegex = /^(19|20)\d\d[\-\/.](0[1-9]|1[012])[\-\/.](0[1-9]|[12][0-9]|3[01])$/;
    if (!profileData.birthday.match(birthdayRegex) && profileData.birthday !== '') {
      valid = false;
      errors.birthday = errors.birthday || [];
      errors.birthday.push('birthday is in wrong format. please use yyyy-mm-dd');
    }
    values.birthday = profileData.birthday;
    //validate about (0 - 16384 characters)
    if (profileData.about.length > 16384) {
      valid = false;
      errors.about = errors.about || [];
      errors.about.push('description is too long (max 16384 characters)');
    }
    values.about = profileData.about;
    if (valid === true) {
      return deferred.resolve(values);
    }
    else{
      return deferred.reject({errors: errors, values: values})
    }
  });
  console.log('validating profile');
  return deferred.promise;
};

var updateUserProfile = function (username, profileData) {
  var deferred = Q.defer();
  var conditions = { username: username };
  var update = {
    $set: {
      'profile.birthday': profileData.birthday,
      'profile.gender': profileData.gender,
      'profile.name': profileData.name,
      'profile.surname': profileData.surname,
      'profile.about': profileData.about
    }
  };

  UserModel.update(conditions, update, {}, function(err, affected){
    console.log('affected', affected);
    if(err) return deferred.reject(err);
    if(affected.ok !== 1) return deferred.reject('not ok');
    if(affected.n < 1) return deferred.reject('not found');
    if(affected.n === 1) return deferred.resolve(true);
    if(affected.n > 1) return deferred.reject('this should not happen. updated more than 1 document');
    return deferred.reject('something else');
  });

  return deferred.promise;
};

var getAvatar = function (username) {
  var deferred = Q.defer();
  fs.readFile(__dirname+'/../../../files/img/empty-avatar.png', function (err, data) {
    if(err) return deferred.reject(JSON.stringify(err));
    return deferred.resolve({type: 'image/png', data: data});
  });
  return deferred.promise;
}

var getErrorImage = function () {
  var deferred = Q.defer();
  fs.readFile(__dirname+'/../../../files/img/404.png', function (err, data) {
    console.log('finished');
    if(err) return deferred.reject(JSON.stringify(err));
    console.log('success');
    return deferred.resolve({type: 'image/png', data: data});
  });
  console.log('getting error image');
  return deferred.promise;
}

module.exports = {
  getUser: getUser,
  myRightsToUser: myRightsToUser,
  processUserData: processUserData,
  processUserDataEdit: processUserDataEdit,
  validateProfile: validateProfile,
  updateUserProfile: updateUserProfile,
  getAvatar: getAvatar,
  getErrorImage: getErrorImage,
  addTagToUser: addTagToUser,
  removeTagFromUser: removeTagFromUser,
  getTagsOfUser: getTagsOfUser
};


function countAge(dateString) {
  //http://stackoverflow.com/a/7091965
  var today = new Date();
  var birthDate = new Date(dateString);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function countLastLogin(dateString) {
  if (!dateString) return 'Never logged in.'
  var sec = Math.floor((Date.now() - (new Date(dateString)).getTime())/1000);
  if (sec === 0) return 'Logged right now.';

  if(sec<60) return 'Logged '+ sec + ' second' + (sec>1 ? 's' : '') + ' ago.';
  var min = Math.floor(sec/60);
  if(min<60) return 'Logged ' + min + ' minute' + (min>1 ? 's' : '') + ' ago';
  var hour = Math.floor(min/60);
  if(hour<24) return 'Logged ' + hour + ' hour' + (hour>1 ? 's' : '') + ' ago';
  var day = Math.floor(hour/24);
  if(day<7) return 'Logged ' + day + ' day' + (day>1 ? 's' : '') + ' ago';
  else if(day<30) {
    var week = Math.floor(day/7);
    return 'Logged ' + week + ' week' + (week>1 ? 's' : '') + ' ago';
  }
  else if(day<365) {
    var month = Math.floor(day/30);
    return 'Logged ' + month + ' month' + (month>1 ? 's' : '') + ' ago';
  }
  else {
    var year = Math.floor(day/365);
    return 'Logged ' + year + ' year' + (year>1 ? 's' : '') + ' ago';
  }
}

function addTagToUser(data) {
  //data: username, tagname
  var deferred = Q.defer();
  console.log('adding tag', data);
  TagModel.findOne({name: data.tagname}, '_id').exec()
    .then(function (tag) {
      console.log('tag found', tag);
      return UserModel.update({username: data.username}, {
            $addToSet: {
              'profile.tags': tag._id,
            }
          }, {safe: true, upsert: false, new : true}
        )
        .exec();
 
    }, function (err) {console.log(err)})
    .then(function (result) {
      console.log(JSON.stringify(result));
      if (result.ok === 1 && result.nModified === 1 && result.n === 1){
        deferred.resolve({success: true, tagname: data.tagname});
      }
      else if(result.ok === 1 && result.nModified === 0 && result.n === 1){
        deferred.resolve({success: false, error: 'tag already added'});
      }
      else {
      }
    })
    .then(undefined, function(err) {
      console.log('err', JSON.stringify(err));
      deferred.reject(err);
    });
  return deferred.promise;
}

function removeTagFromUser(data) {
  //data: username, tagname
  var deferred = Q.defer();
  console.log('removing tag', data);
  /*TagModel.findOne({name: data.tagname}, '_id').exec()
    .then(function (tag) {
      console.log('tag found', tag);
      return UserModel.update({username: data.username}, {
            $addToSet: {
              'profile.tags': tag._id,
            }
          }, {safe: true, upsert: false, new : true}
        )
        .exec();
 
    }, function (err) {console.log(err)})
    .then(function (result) {
      console.log(JSON.stringify(result));
      if (result.ok === 1 && result.nModified === 1 && result.n === 1){
        deferred.resolve({success: true, tagname: data.tagname});
      }
      else if(result.ok === 1 && result.nModified === 0 && result.n === 1){
        deferred.resolve({success: false, error: 'tag already added'});
      }
      else {
      }
    })
    .then(undefined, function(err) {
      console.log('err', JSON.stringify(err));
      deferred.reject(err);
    });
    */
  deferred.reject({error: 'deleting tag not implemented on server side'});
  return deferred.promise;
}

function getTagsOfUser(data) {
  /**
   * will return promise of tags of user
   * data: {username: ...}
   * 
   */
  var deferred = Q.defer();

  UserModel.findOne({username: data.username}, 'profile.tags -_id')
    .populate({path: 'profile.tags', model: 'Tag', select: 'name -_id'})
    //and sort tags by tagname?
    .exec()
    .then(function (output) {
      return deferred.resolve(output.profile.tags || []);
    }, function (err) {
      return deferred.reject(err);
    });

  return deferred.promise;
}
