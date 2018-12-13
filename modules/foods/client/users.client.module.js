(function (app) {
  'use strict';

  app.registerModule('foods');
  app.registerModule('foods.admin');
  app.registerModule('foods.admin.routes', ['ui.router', 'core.routes', 'foods.admin.services']);
  app.registerModule('foods.admin.services');
  app.registerModule('foods.routes', ['ui.router', 'core.routes']);
  app.registerModule('foods.services');
}(ApplicationConfiguration));
