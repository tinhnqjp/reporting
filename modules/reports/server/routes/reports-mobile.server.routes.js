'use strict';

var m_reports = require('../controllers/mobiles/reports-mobile.server.controller');

module.exports = function (app) {
  app.route('/api/mobile/reports/histories').post(m_reports.histories);
  app.route('/api/mobile/reports/create').post(m_reports.create);

};
