'use strict';

/**
 * Module dependencies
 */
var partnersPolicy = require('../policies/partners.server.policy'),
  partners = require('../controllers/partners.server.controller');

module.exports = function (app) {
  // Units collection routes
  app.route('/api/partners').post(partnersPolicy.isAllowed, partners.create);
  app.route('/api/partners/list').post(partnersPolicy.isAllowed, partners.list);

  // Single partner routes
  app.route('/api/partners/:partnerId')
    .get(partnersPolicy.isAllowed, partners.read)
    .put(partnersPolicy.isAllowed, partners.update)
    .delete(partnersPolicy.isAllowed, partners.delete);

  // Finish by binding the partner middleware
  app.param('partnerId', partners.partnerByID);
};
