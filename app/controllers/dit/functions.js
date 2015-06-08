'use strict';

var Q = require('q');

var getDit = function (dit) {
  return Q.resolve({
    url: 'static-test',
    form: 'idea'
  });
};

var getMyRightsToDit = function (me, dit) {
  return Q.resolve({
    view: true,
    edit: true
  });
};

var processDitData = function (dit) {
  return Q.resolve({
    url: 'static-test',
    form: 'idea',
    created: new Date(),
    name: 'Static Test',
    summary: 'this dit is not connected to database',
    about: 'this is some description'
  });
};

var processDitDataEdit = processDitData;
var iCanEditDit = function (me, dit) {
  return Q.resolve({
    
  });
}; //will resolve only if me can edit dit, resolve or reject with object of my rights
var validateDitForm = function (data) {
  return Q.resolve(data);
}; //will resolve only if data is valid. 
var updateDitProfile = function () {
  return Q.resolve({
    
  });
};


module.exports = {
  getDit: getDit,
  getMyRightsToDit: getMyRightsToDit,
  processDitData: processDitData,
  processDitDataEdit: processDitDataEdit,
  iCanEditDit: iCanEditDit,
  validateDitForm: validateDitForm,
  updateDitProfile: updateDitProfile
};

