'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  path = require('path'),
  helper = require(path.resolve('./modules/core/server/controllers/help.server.controller')),
  logger = require(path.resolve('./modules/core/server/controllers/logger.server.controller'));

/**
 * Get expire of partner or worker
 * @param userId partner/worker
 * @returns { results: object user }
 * @version 2018/12/24
 */
exports.expire = function (req, res) {
  req.checkBody('userId', 'サーバーエラーが発生しました。').notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(helper.getMessage(errors));
  }

  var userId = req.body.userId;
  User.findOne({ _id: userId, deleted: false }).select('_id name username expire created').exec((err, user) => {
    if (err) {
      logger.error(err);
      return res.status(422).send({ message: 'サーバーエラーが発生しました。' });
    }
    if (!user)
      return res.status(422).send({ message: 'このデータは無効または削除されています。' });

    return res.jsonp(user);
  });
};


/**
* @function ログイン
* @param username(ユーザーID)
* @param password(パスワード)
* @returns { user: object }
*/
exports.m_signin = function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  if (!username || !password)
    return res.status(400).send({ message: 'ログインできません。' });
  verifyLogin(username, password)
    .then(user => {
      return res.jsonp(user);
    })
    .catch(err => {
      logger.error(err);
      return res.status(err.status).send(err);
    });
};

/**
* @function パスワード変更
* @param username(ユーザーID)
* @param password(パスワード)
* @param new_password(新しいパスワード)
* @param confirm_password(確認パスワード)
* @returns
*/
exports.m_password = function (req, res) {
  var username = req.body.username;
  var currentPassword = req.body.password;
  var newPassword = req.body.new_password;
  var verifyPassword = req.body.confirm_password;
  if (!username)
    return res.status(400).send({ message: 'ユーザーIDを入力してください。' });
  if (!currentPassword)
    return res.status(400).send({ message: 'パスワードを入力してください。' });
  if (!newPassword)
    return res.status(400).send({ message: '新しいパスワードを入力してください。' });

  verifyLogin(username, currentPassword)
    .then(user => {
      if (user.authenticate(currentPassword)) {
        if (newPassword !== verifyPassword)
          return res.status(400).send({ message: '確認パスワードと新しいパスワードが統一していません。' });

        user.password = newPassword;
        user.save(function (err) {
          if (err) {
            logger.error(err);
            return res.status(500).send({ message: 'サーバーエラーが発生しました。' });
          }
          return res.end();
        });
      } else {
        return res.status(422).send({ message: '現在のパスワードが間違います。' });
      }
    })
    .catch(err => {
      return res.status(err.status).send(err);
    });
};

/**
* @function アカウントチェック
* @param username(ユーザーID)
* @param password(パスワード)
* @returns { user }
*/
exports.m_registry = function (req, res) {
  var username = req.body.username;
  var password = req.body.password;

  if (!username)
    return res.status(400).send({ message: 'ユーザーIDを入力してください。' });
  if (!password)
    return res.status(400).send({ message: 'パスワードを入力してください。' });

  User.findOne({ username: username, deleted: false }).select('id username roles created').exec((err, _user) => {
    if (err) {
      logger.error(err);
      return res.status(500).send({ message: 'サーバーエラーが発生しました。' });
    }
    if (_user)
      return res.status(422).send({ message: 'IDが既存しますのでアカウントを登録できません。' });

    var user = new User();
    user.roles = 'worker';
    user.username = username;
    user.password = password;
    user.save(function (err) {
      if (err) {
        logger.error(err);
        return res.status(422).send({ message: 'アカウントを登録できません。' });
      }
      return res.json(user);
    });
  });
};

// ----------------------------------------------------------------
function verifyLogin(username, password) {
  return new Promise(function (resolve, reject) {
    User.findOne({ username: username, deleted: false }).exec((err, user) => {
      if (err) {
        logger.error(err);
        return reject({ status: 500, message: 'サーバーエラーが発生しました。' });
      }
      if (!user)
        return reject({ status: 403, message: 'アカウントを認証できません。' });

      if (!user.authenticate(password))
        return reject({ status: 400, message: 'パスワードが違います。' });
      return resolve(user);
    });
  });
}
