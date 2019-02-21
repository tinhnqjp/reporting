'use strict';

/**
 * Module dependencies
 */
var unitsPolicy = require('../policies/units.server.policy'),
  units = require('../controllers/units.server.controller');

module.exports = function (app) {
  // Units collection routes
  app.route('/api/units')
    .post(unitsPolicy.isAllowed, units.create)
    .get(unitsPolicy.isAllowed, units.list);
  app.route('/api/units/list').post(unitsPolicy.isAllowed, units.paging);

  // Single unit routes
  app.route('/api/units/:unitId')
    .get(unitsPolicy.isAllowed, units.read)
    .put(unitsPolicy.isAllowed, units.update)
    .delete(unitsPolicy.isAllowed, units.delete);

  // Finish by binding the unit middleware
  app.param('unitId', units.unitByID);


  app.route('/api/mobile/units/import').post(units.importdata);
};
