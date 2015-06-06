'use strict';

var Q = require('q');

var getDit = function (dit) {
  return Q.resolve({
    url: 'static-test',
    form: 'idea'
  });
};

var getMeToDit = function (me, dit) {
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


module.exports = {
  getDit: getDit,
  getMeToDit: getMeToDit,
  processDitData: processDitData
};

