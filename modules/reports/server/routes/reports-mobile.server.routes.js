'use strict';

var m_reports = require('../controllers/mobiles/reports-mobile.server.controller');

module.exports = function (app) {
  app.route('/api/mobile/reports').post(m_reports.list);

};
