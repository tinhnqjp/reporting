'use strict';

var m_users = require('../controllers/mobiles/users-mobile.server.controller');


module.exports = function (app) {
  /**
  * @function アカウント有効期限チェック
  * @param userId(ログインID)
  * @returns { user: object, version: string }
  */
  app.route('/api/mobile/auth/expire').post(m_users.expire);
  /**
  * @function ログイン
  * @param username(ログインID)
  * @param password(パスワード)
  * @returns { user: object }
  */
  app.route('/api/mobile/auth/signin').post(m_users.m_signin);

  /**
  * @function Masterdata
  * @param userId(ログインID)
  * @returns { config }
  */
  app.route('/api/mobile/auth/config').post(m_users.config);
};
