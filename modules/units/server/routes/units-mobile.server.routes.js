'use strict';

var m_units = require('../controllers/mobiles/units-mobile.server.controller');

module.exports = function (app) {
  app.route('/api/mobile/units').post(m_units.list);

};
