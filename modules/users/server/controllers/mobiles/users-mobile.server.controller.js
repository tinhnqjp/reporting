'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Config = mongoose.model('Config'),
  path = require('path'),
  moment = require('moment-timezone'),
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
  User.findOne({ _id: userId, deleted: false }).select('_id name username expire created roles').exec((err, user) => {
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
    Config.findOne().exec((err, conf) => {
      if (!conf || err) {
        return res.jsonp({ user: user, masterVersion: master_data.version, unitVersion: '', version: master_data.version });
      } else {
        return res.jsonp({ user: user, masterVersion: master_data.version, unitVersion: conf.unitVersion, version: master_data.version });
      }
    });
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
      Config.findOne().exec((err, conf) => {
        if (!conf || err) {
          return res.jsonp({ user: user, masterVersion: master_data.version, unitVersion: '', version: master_data.version });
        } else {
          return res.jsonp({ user: user, masterVersion: master_data.version, unitVersion: conf.unitVersion, version: master_data.version });
        }
      });
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
  Config.findOne().exec((err, conf) => {
    if (!conf || err) {
      return res.jsonp({ config: master_data.config, masterVersion: master_data.version, unitVersion: '', version: master_data.version });
    } else {
      return res.json({ config: master_data.config, masterVersion: master_data.version, unitVersion: conf.unitVersion, version: master_data.version });
    }
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

      if (!user.authenticate(password) || !checkRole(user.roles))
        return reject({ status: 400, message: 'パスワードが違います。' });

      if (user.expire && moment(user.expire, 'YYYY-MM-DD hh:mm').isBefore(moment())) {
        return reject({ status: 422, message: 'このアカウントは有効期限が切れました。' });
      }

      return resolve(user);
    });
  });


  function checkRole(roles) {
    if (roles && roles[0] && ['dispatcher', 'employee', 'partner', 'user'].indexOf(roles[0]) >= 0) {
      return true;
    }
    return false;
  }
}
