(function (app) {
  'use strict';

  app.registerModule('units');
  app.registerModule('units.admin');
  app.registerModule('units.admin.routes', ['ui.router', 'core.routes', 'units.admin.services']);
  app.registerModule('units.admin.services');
  app.registerModule('units.routes', ['ui.router', 'core.routes']);
  app.registerModule('units.services');
}(ApplicationConfiguration));
