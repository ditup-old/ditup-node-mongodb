'use strict';

var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    profile:{
        name: String,       //Human name
        surname: String,    //Human surname
        birthday: Date,     //birthday (used to show age only)
        birthday_v: Boolean,//birthday visibility
        gender: String,     //male, female, other
        gender_v: Boolean,   //gender visibility
        about: String       //user's personal description
    },
    account:{
        join_date: Date,
        email_verified: Boolean,
        email_verified_date: Date,
        email_verify_code: String,
        active_account: Boolean,
        last_login: Date,
        last_message_visit: Date
    },
    login:{
        password: String,
        salt: String,
        iterations: Number
    }
}, {collection: 'user'});

module.exports = mongoose.model('User', UserSchema);
