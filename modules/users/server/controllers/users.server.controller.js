'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  passport = require('passport'),
  path = require('path'),
  logger = require(path.resolve('./modules/core/server/controllers/logger.server.controller'));

/**
 * 管理者機能
 */
exports.signin = function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err || !user) return res.status(422).send({ message: 'ユーザーIDまたはパスワードが間違います。' });

    // Remove sensitive data before login
    user.password = undefined;
    user.salt = undefined;
    req.login(user, function (err) {
      if (err) {
        logger.error(err);
        return res.status(400).send({ message: 'ユーザーIDまたはパスワードが間違います。' });
      }
      return res.json(user);
    });
  })(req, res, next);
};

exports.signout = function (req, res) {
  req.logout();
  res.redirect('/');
};

exports.password = function (req, res) {
  if (!req.user) return res.status(400).send({ message: 'ユーザーがログインしていません。' });
  var passwordDetails = req.body;

  if (!passwordDetails.newPassword)
    return res.status(400).send({ message: '新しいパスワードを入力してください。' });
  User.findById(req.user._id, function (err, user) {
    if (err || !user)
      return res.status(400).send({ message: 'ユーザー情報が見つかりません。' });

    if (user.authenticate(passwordDetails.currentPassword)) {
      if (passwordDetails.newPassword !== passwordDetails.verifyPassword)
        return res.status(422).send({ message: '確認パスワードと新しいパスワードが統一していません。' });

      user.password = passwordDetails.newPassword;
      user.save(function (err) {
        if (err) {
          logger.error(err);
          return res.status(422).send({ message: 'パスワードを保存できません。' });
        }
        req.login(user, function (err) {
          if (err) {
            logger.error(err);
            return res.status(400).send(err);
          }
          return res.end();
        });
      });
    } else {
      return res.status(422).send({ message: '現在のパスワードが間違います。' });
    }
  });

};
