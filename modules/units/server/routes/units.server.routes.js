'use strict';

/**
 * Module dependencies
 */
var unitsPolicy = require('../policies/units.server.policy'),
  units = require('../controllers/units.server.controller');

module.exports = function (app) {
  // process for /api/units/***
  app.route('/api/units/report').get(unitsPolicy.isAllowed, units.report);
  app.route('/api/units/export').post(unitsPolicy.isAllowed, units.export);

  // Units collection routes
  app.route('/api/units').post(unitsPolicy.isAllowed, units.create);
  app.route('/api/units/list').post(unitsPolicy.isAllowed, units.list);
  app.route('/api/units/import').post(unitsPolicy.isAllowed, units.import);

  // Single unit routes
  app.route('/api/units/:unitId')
    .get(unitsPolicy.isAllowed, units.read)
    .put(unitsPolicy.isAllowed, units.update)
    .delete(unitsPolicy.isAllowed, units.delete);

  // Finish by binding the unit middleware
  app.param('unitId', units.unitByID);
};
