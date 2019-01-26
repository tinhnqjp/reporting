'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  path = require('path'),
  moment = require('moment'),
  master_data = require(path.resolve('./config/lib/master-data')),
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
  if (errors)
    return res.status(400).send(helper.getMessage(errors));

  var userId = req.body.userId;
  User.findOne({ _id: userId, deleted: false }).select('_id name username expire created').exec((err, user) => {
    if (err) {
      logger.error(err);
      return res.status(422).send({ message: 'サーバーエラーが発生しました。' });
    }
    if (!user)
      return res.status(422).send({ message: 'このアカウントは無効または削除されています。' });

    if (user.expire && moment(user.expire, 'YYYY-MM-DD hh:mm').isBefore(moment())) {
      return res.status(422).send({ message: 'このアカウントは有効期限が切れました。' });
    }
    user.last_login = Date.now();
    user.save();
    // Trường hợp user hợp lệ thì trả về user + version
    return res.jsonp({ user: user, version: master_data.version });
  });
};

/**
* @function ログイン
* @param username(ログインID)
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
      user.last_login = Date.now();
      user.save();
      return res.jsonp({ user: user, version: master_data.version });
    })
    .catch(err => {
      logger.error(err);
      return res.status(err.status).send(err);
    });
};

/**
* @function システムデータ
* @returns { config: object, version: string }
*/
exports.config = function (req, res) {
  return res.json({ config: master_data.config, version: master_data.version });
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

      if (user.expire && moment(user.expire, 'YYYY-MM-DD hh:mm').isBefore(moment())) {
        return reject({ status: 422, message: 'このアカウントは有効期限が切れました。' });
      }
      return resolve(user);
    });
  });
}
