'use strict';

var Q = require('q');
var UserModel = require('../../models/user');

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
  var deferred = Q.defer();
  process.nextTick(function(){
    var profile = {};
    //age
    profile.age = userData.profile.birthday != '' ? '' + countAge(userData.profile.birthday) + ' years old' : null ;
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
    var birth = (brthDate.constructor === Date) ? {
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

module.exports = {
  getUser: getUser,
  myRightsToUser: myRightsToUser,
  processUserData: processUserData,
  processUserDataEdit: processUserDataEdit,
  validateProfile: validateProfile,
  updateUserProfile: updateUserProfile
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
  var diff = Math.floor((Date.now() - (new Date(dateString)).getTime())/1000);
  if (diff === 0) {
    return 'Logged right now.';
  }
  else if(diff<60){ //seconds
    return 'Logged '+ diff + 'seconds ago.';
  }
  else if(Math.floor(diff/60)<60){ //minutes
    diff = Math.floor(diff/60);
    return 'Logged ' + diff + 'minutes ago';
  }
  else if(Math.floor(diff/60)<24){
    diff = Math.floor(diff/60);
    return 'Logged ' + diff + 'hours ago';
  }
  else if(Math.floor(diff/24)<7){ //hours
    diff = Math.floor(diff/24);
    return 'Logged ' + Math.floor(diff/24) + 'days ago';
  }
  else if(diff<30){
    return 'Logged ' + Math.floor(diff/7) + 'weeks ago';
  }
  else if(diff<365){
    return 'Logged ' + Math.floor(diff/30) + 'months ago';
  }
  else {
    return 'Logged ' + Math.floor(diff/365) + 'years ago';
  }

}

