'use strict';

module.exports = function (app) {
  var users = require('../controllers/users.server.controller');

  // ウェッブ版のみ
  app.route('/api/auth/signin').post(users.signin);
  app.route('/api/auth/signout').get(users.signout);
  app.route('/api/users/password').post(users.password);
  app.route('/api/users/testTransaction').post(users.testTransaction);
};
