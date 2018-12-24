'use strict';

/**
 * Module dependencies
 */
var reportsPolicy = require('../policies/reports.server.policy'),
  reports = require('../controllers/reports.server.controller');

module.exports = function (app) {
  // Reports collection routes
  app.route('/api/reports').post(reportsPolicy.isAllowed, reports.create);
  app.route('/api/reports/list').post(reportsPolicy.isAllowed, reports.paging);

  // Single report routes
  app.route('/api/reports/:reportId')
    .get(reportsPolicy.isAllowed, reports.read)
    .put(reportsPolicy.isAllowed, reports.update)
    .delete(reportsPolicy.isAllowed, reports.delete);

  // Finish by binding the report middleware
  app.param('reportId', reports.reportByID);
};
