'use strict';
const { check, oneOf, validationResult } = require('express-validator/check');

var m_units = require('../controllers/mobiles/units-mobile.server.controller');
var m_workers = require('../controllers/mobiles/workers-mobile.server.controller');

module.exports = function (app) {
  app.route('/api/mobile/units/list').post(m_units.list);
  app.route('/api/mobile/workers/list').post(m_workers.list);
  app.route('/api/mobile/workers/petition').post(m_workers.petition);
};
