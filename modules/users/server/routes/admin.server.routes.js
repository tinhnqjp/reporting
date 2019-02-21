'use strict';

/**
 * Module dependencies
 */
var adminPolicy = require('../policies/admin.server.policy'),
  admin = require('../controllers/admin.server.controller');

module.exports = function (app) {
  require('./users.server.routes.js')(app);

  // process for /api/users/***
  app.route('/api/users/report').get(adminPolicy.isAllowed, admin.report);
  app.route('/api/users/export').post(adminPolicy.isAllowed, admin.export);

  // Users collection routes
  app.route('/api/users').post(adminPolicy.isAllowed, admin.create);
  app.route('/api/users/list').post(adminPolicy.isAllowed, admin.list);

  // Single user routes
  app.route('/api/users/:userId')
    .get(adminPolicy.isAllowed, admin.read)
    .put(adminPolicy.isAllowed, admin.update)
    .delete(adminPolicy.isAllowed, admin.delete);

  // Finish by binding the user middleware
  app.param('userId', admin.userByID);

  app.route('/api/mobile/account/import').post(admin.importdata);
};
