'use strict';

/**
 * Module dependencies
 */
var petitionsPolicy = require('../policies/petitions.server.policy'),
  petitions = require('../controllers/petitions.server.controller');

module.exports = function (app) {
  // Units collection routes
  app.route('/api/petitions').post(petitionsPolicy.isAllowed, petitions.create);
  app.route('/api/petitions/list').post(petitionsPolicy.isAllowed, petitions.paging);

  // Single petition routes
  app.route('/api/petitions/:petitionId')
    .get(petitionsPolicy.isAllowed, petitions.read)
    .delete(petitionsPolicy.isAllowed, petitions.delete);

  // Finish by binding the petition middleware
  app.param('petitionId', petitions.petitionByID);
};
