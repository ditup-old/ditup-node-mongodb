'use strict';

var crypto = require('crypto');
var Q = require('q');

//hash password with 
var hashPassword = function (password, salt, iterations) {
    var deferred = Q.defer();
    crypto.pbkdf2(password, salt, iterations, 64, 'sha256', function(err, key) {
        if (err) deferred.reject(err);
        var hash = key.toString('base64');
        deferred.resolve(hash);  // 'c5e478d...1469e50'
    });

    return deferred.promise;
};

var compareHashes = function (hash1, hash2) {
    return hash1 === hash2;
};

var generateSalt = function (){
    var deferred = Q.defer();
    crypto.randomBytes(64, function (err, bytes) {
        if(err) deferred.reject(err);
        var salt = bytes.toString('base64');
        deferred.resolve(salt);
    });
    return deferred.promise;
};

var generateHexCode = function (byteNumber) {
    var deferred = Q.defer();
    crypto.randomBytes(byteNumber, function (err, bytes) {
        if (err) deferred.reject(err);
        var code = bytes.toString('hex');
        deferred.resolve(code);
    })
    return deferred.promise;
}

var sendVerifyEmail = function () {
    var deferred = Q.defer();
    process.nextTick(function(){
        deferred.resolve(true);
    });
    return deferred.promise;
};

module.exports = {
    hashPassword: hashPassword,
    compareHashes: compareHashes,
    generateSalt: generateSalt,
    generateHexCode: generateHexCode,
    sendVerifyEmail: sendVerifyEmail
};
