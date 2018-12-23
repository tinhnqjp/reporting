'use strict';

/**
 * Module dependencies
 */
var workersPolicy = require('../policies/workers.server.policy'),
  workers = require('../controllers/workers.server.controller');

module.exports = function (app) {
  // Units collection routes
  app.route('/api/workers').post(workersPolicy.isAllowed, workers.create);
  app.route('/api/workers/list').post(workersPolicy.isAllowed, workers.paging);

  // Single worker routes
  app.route('/api/workers/:workerId')
    .get(workersPolicy.isAllowed, workers.read)
    .put(workersPolicy.isAllowed, workers.update)
    .delete(workersPolicy.isAllowed, workers.delete);

  // Finish by binding the worker middleware
  app.param('workerId', workers.workerByID);
};
