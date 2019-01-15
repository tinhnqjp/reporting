'use strict';

/**
 * Module dependencies
 */
var partnersPolicy = require('../policies/partners.server.policy'),
  partners = require('../controllers/partners.server.controller');

module.exports = function (app) {
  // Units collection routes
<<<<<<< HEAD
  app.route('/api/partners').post(partnersPolicy.isAllowed, partners.create);
  app.route('/api/partners/list').post(partnersPolicy.isAllowed, partners.list);
=======
  app.route('/api/partners')
    .post(partnersPolicy.isAllowed, partners.create)
    .get(partnersPolicy.isAllowed, partners.list);
  app.route('/api/partners/list').post(partnersPolicy.isAllowed, partners.paging);
>>>>>>> ec5acda89d5313e5687648dcfb8f39e6a5993e75

  // Single partner routes
  app.route('/api/partners/:partnerId')
    .get(partnersPolicy.isAllowed, partners.read)
    .put(partnersPolicy.isAllowed, partners.update)
    .delete(partnersPolicy.isAllowed, partners.delete);

  // Finish by binding the partner middleware
  app.param('partnerId', partners.partnerByID);
};
