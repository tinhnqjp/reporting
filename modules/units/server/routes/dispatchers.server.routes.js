'use strict';

/**
 * Module dependencies
 */
var dispatchersPolicy = require('../policies/dispatchers.server.policy'),
  dispatchers = require('../controllers/dispatchers.server.controller');

module.exports = function (app) {
  // Units collection routes
  app.route('/api/dispatchers').post(dispatchersPolicy.isAllowed, dispatchers.create);
  app.route('/api/dispatchers/list').post(dispatchersPolicy.isAllowed, dispatchers.list);

  // Single dispatcher routes
  app.route('/api/dispatchers/:dispatcherId')
    .get(dispatchersPolicy.isAllowed, dispatchers.read)
    .put(dispatchersPolicy.isAllowed, dispatchers.update)
    .delete(dispatchersPolicy.isAllowed, dispatchers.delete);

  // Finish by binding the dispatcher middleware
  app.param('dispatcherId', dispatchers.dispatcherByID);
};
