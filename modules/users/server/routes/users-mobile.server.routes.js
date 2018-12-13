'use strict';

var m_users = require('../controllers/mobiles/users-mobile.server.controller');


module.exports = function (app) {
  /**
  * @function ログイン
  * @param username(ログインID)
  * @param password(パスワード)
  * @returns { user: object }
  */
  app.route('/api/mobile/auth/signin').post(m_users.m_signin);

  /**
  * @function パスワード変更
  * @param username(ログインID)
  * @param password(パスワード)
  * @param new_password(新しいパスワード)
  * @param confirm_password(確認パスワード)
  * @returns
  */
  app.route('/api/mobile/auth/password').post(m_users.m_password);

  /**
  * @function アカウントチェック
  * @param username(ログインID)
  * @param password(パスワード)
  * @returns { user }
  */
  app.route('/api/mobile/auth/registry').post(m_users.m_registry);
};
