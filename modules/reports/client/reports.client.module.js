(function (app) {
  'use strict';

  app.registerModule('reports');
  app.registerModule('reports.admin');
  app.registerModule('reports.admin.routes', ['ui.router', 'core.routes', 'reports.admin.services']);
  app.registerModule('reports.admin.services');
  app.registerModule('reports.routes', ['ui.router', 'core.routes']);
  app.registerModule('reports.services');
}(ApplicationConfiguration));
