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
  app.route('/api/reports/status').post(reportsPolicy.isAllowed, reports.updateStatus);
  app.route('/api/reports/enable').post(reportsPolicy.isAllowed, reports.updateEnable);
  app.route('/api/reports/export').post(reportsPolicy.isAllowed, reports.export);

  // Single report routes
  app.route('/api/reports/:reportId')
    .get(reportsPolicy.isAllowed, reports.read)
    .put(reportsPolicy.isAllowed, reports.update)
    .delete(reportsPolicy.isAllowed, reports.delete);

  // Finish by binding the report middleware
  app.param('reportId', reports.reportByID);

  app.route('/api/report/signature').all(reportsPolicy.isAllowed).post(reports.imageSignature);
  app.route('/api/report/drawing').all(reportsPolicy.isAllowed).post(reports.imageDrawing);
  app.route('/api/report/storeimage').all(reportsPolicy.isAllowed).post(reports.pictureStoreImage);
  app.route('/api/report/before').all(reportsPolicy.isAllowed).post(reports.pictureBefore);
  app.route('/api/report/after').all(reportsPolicy.isAllowed).post(reports.pictureAfter);
  app.route('/api/report/image1').all(reportsPolicy.isAllowed).post(reports.repairImage1);
  app.route('/api/report/image2').all(reportsPolicy.isAllowed).post(reports.repairImage2);
};
