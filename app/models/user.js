'use strict';

var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  username: {type: String, unique: true},
  email: {type: String, unique: true},
  profile:{
    name: String,     //Human name
    surname: String,  //Human surname
    birthday: Date,   //birthday (used to show age only)
    gender: String,   //male, female, other
    about: String     //user's personal description
  },
  account:{
    join_date: Date,
    email: {
      create_date: Date,  //when was the verification code created? (to have time-limited validity of verification code)
      verified: Boolean,  //is email verified? (very important)
      verify_date: Date,  //time of email verification
      code: String,   //hashed verification code
      salt: String,   //salt used for hashing verification code
      iterations: Number  //number of iterations used for hashing verification code
    },
    active_account: Boolean,  //it should be possible to make profile inactive without deleting it
    last_login: Date,   //to show last login info and news
    last_message_visit: Date  //to show number of newly delivered messages
  },
  login:{
    password: String,   //hashed password
    salt: String,       //hashing salt
    iterations: Number  //hash iterations
  },
  settings: {
    privacy: {
      visible: {type: String, enum:['all', 'logged', 'none']} //who can see user profile?
    }
  }
}, {collection: 'user'});

module.exports = mongoose.model('User', UserSchema);
