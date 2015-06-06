'use strict';

var Q = require('q');
var User = require('../../models/user');
var ITERATIONS = require('../../../config/password').iterations;
var VALIDITY_TIME = 7200;
var hashFunctions = require('../user/user');
var hashPassword = hashFunctions.hashPassword;
var generateSalt = hashFunctions.generateSalt;
var compareHashes = hashFunctions.compareHashes;
var generateHexCode = hashFunctions.generateHexCode;


var validate = function (formData) {
  //things to validate:   username regex
  //            username unique
  //            email regex
  //            email unique
  //            name, surname regex
  //            password regex
  //            passwords match
  
  var deferred = Q.defer(),
    valid = true,
    errors = {};

  //username regex
  var usernameRegex = /^([a-z0-9_\-\.]{2,32})$/;
  if(usernameRegex.test(formData.username) === false){
    valid = false;
    errors.username = errors.username || [];
    errors.username.push('wrong username format (TODO)');
  }

  //email regex
  var emailRegex = /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
  if(emailRegex.test(formData.email) === false){
    valid = false;
    errors.email = errors.email || [];
    errors.email.push('invalid email');
  }
  
  //name, surname max 128 characters long
  if(formData.name.length > 128){
    valid = false;
    errors.name = errors.name || [];
    errors.name.push('name can be max 128 characters long');
  }

  if(formData.surname.length > 128){
    valid = false;
    errors.surname = errors.surname || [];
    errors.surname.push('surname can be max 128 characters long');
  }

  //password regex
  var passwordRegex = /(?=^.{8,128}$)(?=.*[a-zA-Z0-9])(?=.*[^A-Za-z0-9]).*$/
  if(passwordRegex.test(formData.password) === false){
    valid = false;
    errors.password = errors.password || [];
    errors.password.push('password must be at least 8 characters long and contain [a-zA-Z0-9] and some special character');
  }

  //password match
  if(formData.password !== formData.password2){
    valid = false;
    errors.password2 = errors.password2 || [];
    errors.password2.push('passwords don\'t match');
  }

  //asynchronously check if username and email is unique

  Q.all([
    User.find({ username: formData.username }).exec(),
    User.find({ email: formData.email }).exec()
  ])
  .spread(function(users, emails){
    if(users.length > 0){
      valid = false;
      errors.username = errors.username || [];
      errors.username.push('username must be unique');
    }
    if(emails.length > 0){
      valid = false;
      errors.email = errors.email || [];
      errors.email.push('email must be unique');
    }
    
    deferred.resolve({valid: valid, errors: errors});
  });

  return deferred.promise;
}

var createNewUser = function (formData) {
  var deferred = Q.defer();


  var salt; //to store salt when we generate it
  generateSalt()  //generate salt
    .then(function(_salt){  //generate hashed password and verification code asynchronously
      console.log(_salt);
      salt = _salt;
      return hashPassword(formData.password, salt, ITERATIONS);
    })
    .then(function(hashedPassword){
      console.log('password', hashedPassword);
      console.log(formData);
      var data = {
        name: formData.name,
        surname: formData.surname,
        username: formData.username,
        email: formData.email,
        salt: salt,
        password: hashedPassword,
        iterations: ITERATIONS
      };
      console.log(data);
      return saveNewUser(data);
    })
    .then(function (__data) {
      deferred.resolve(__data); 
    })
    .catch(function (err) {
      deferred.reject(err);
    });

  return deferred.promise;
};

var saveNewUser = function (data) {
  var deferred = Q.defer();
//TODO: ensure that username and email are unique!! (asynchronously is not enough)
  var newUser = new User({
    username: data.username,
    email: data.email,
    profile: {
      name: data.name,
      surname: data.surname,
      birthday: null,
      gender: '',
      about: ''
    },
    account:{
      join_date: new Date(),
      email: {
        verified: false
      },
      active_account: true,
      last_login: null,
      last_message_visit: null
    },
    login: {
      salt: data.salt,
      password: data.password,
      iterations: data.iterations
    }
  });

  console.log('ready to save');        
  newUser.save(function (err, nu) {
    if(err) deferred.reject(err);
    deferred.resolve(nu);
  });
  return deferred.promise;
};

var sendVerifyEmail = function (username) {
  var deferred = Q.defer();
  //this function should:
  var code, salt;
  //generate verification code & salt
  //hash verification code
  //save the data to database
  //send email to the address provided TODO
  Q.all([generateHexCode(16), generateSalt()])
    .spread(function (_code, _salt) {
      console.log('verification code', _code);
      code = _code;
      salt = _salt;
      return hashPassword(code, salt, ITERATIONS);
    })
    .then(function (hashedCode) {
      var conditions = { username: username };
      var update = {
        $set: {
          'account.email.create_date': new Date(), 
          'account.email.verified': false,
          'account.email.verify_date': null,
          'account.email.code': hashedCode,
          'account.email.salt': salt,
          'account.email.iterations': ITERATIONS
        }
      };
      
      {
        account: {
          email: {
          }
        }
      };

      User.update(conditions, update, {}, function (err, affected) {
        console.log(affected);
        if (err) {deferred.reject(err)}
        console.log('verify email updated');
        return deferred.resolve(affected);
      });
    });

  return deferred.promise;
};

var verifyEmail = function (username, code) {
  var deferred = Q.defer();
  var user;
  User.find({username: username}).exec()
    .then(function (users){
      if (users.length < 1) {
        return deferred.resolve({is: false, error: 'user not found'});
      }
      if (users.length > 1) {
        return deferred.resolve({is: false, error: 'this should never happen: more user documents with the same username in database'});
      }
      user = users[0];
      return hashPassword(code, user.account.email.salt, user.account.email.iterations);
    })
    .then(function (hashed){
      return compareHashes(hashed, user.account.email.code);
    })
    .then(function(success){
      //code must matcha
      if(success !== true) return deferred.resolve({ is: false, error: 'wrong code'});
      //it is verified only once
      console.log(user.account.email.verified);
      if (user.account.email.verified === true) { return deferred.resolve({ is: false, error: 'email of this user is already verified' }); }
      //code must be still valid
      var codeAgeMS = (new Date()).getTime() - user.account.email.create_date.getTime();
      var codeAgeS = Math.floor(codeAgeMS/1000);
      console.log(codeAgeS);

      var codeIsTooOld = codeAgeS > VALIDITY_TIME;
      if (codeIsTooOld) return deferred.resolve({ is: false, error: 'too old code. resend the code'});
      
      var conditions = { username: username };
      var update = {
        $set: {
          'account.email.create_date': null,
          'account.email.verified': true,
          'account.email.verify_date': new Date()
        }
      };

      User.update(conditions, update, {}, function (err, affected) {
        console.log(affected);
        if (err) {deferred.reject(err)}
        console.log('verify email updated');
        if (affected < 1 ) return deferred.resolve({is: false, error: 'weird, not updated'});
        if (affected > 1 ) return deferred.resolve({is: false, error: 'should never happen, more documents updated'});

        return deferred.resolve({is: true});
      });
    });

  return deferred.promise;
}

module.exports = {
  validateForm: validate,
  createNewUser: createNewUser,
  sendVerifyEmail: sendVerifyEmail,
  verifyEmail: verifyEmail
};
