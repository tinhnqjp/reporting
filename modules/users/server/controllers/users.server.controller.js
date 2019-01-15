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

exports.testTransaction = function (req, res) {
  var users = [
    { name: 'Test_1', username: 'username_1', password: '12345678', roles: ['employee'] },
    { name: 'Test_2', username: 'username_2', password: '12345678', roles: ['employee'] },
    { name: 'Test_3', username: 'username_345646546546546541111', password: '12345678', roles: ['employee'] },
    { name: 'Test_4', username: 'username_4', password: '12345678', roles: ['employee'] },
    { name: 'Test_5', username: 'username_5', password: '12345678', roles: ['employee'] },
    { name: 'Test_6', username: 'username_6', password: '12345678', roles: ['employee'] },
    { name: 'Test_7', username: 'username_7', password: '12345678', roles: ['employee'] },
    { name: 'Test_8', username: 'username_8', password: '12345678', roles: ['employee'] },
    { name: 'Test_9', username: 'username_9', password: '12345678', roles: ['employee'] },
    { name: 'Test_10', username: 'username_10', password: '12345678', roles: ['employee'] },
    { name: 'Test_11', username: 'username_11', password: '12345678', roles: ['employee'] }
  ];
  console.log('Transaction start');
  mongoose.startSession()
    .then(session => {
      session.startTransaction();
      saveAllSync({ session: session }).then(() => {
        session.commitTransaction().then(() => {
          console.log('Transaction completed');
          session.endSession();
          return res.end();
        });
      }).catch(err => {
        console.log(err);
        session.abortTransaction().then(() => {
          console.log('Transaction aborted');
          session.endSession();
          return res.end();
        });
      });
    });

  // Đồng bộ
  function saveAllSync(options, index) {
    if (!index) index = 0;
    return new Promise((resolve, reject) => {
      saveOne(users[index], options)
        .then(_user => {
          console.log('Saved user: ' + _user.name + ' at index: ' + index);
          if (index < users.length - 1) {
            return saveAllSync(options, index + 1);
          } else {
            return new Promise((resolve, reject) => { return resolve(); });
          }
        })
        .then(() => {
          return resolve();
        })
        .catch(err => {
          return reject(err);
        });
    });
  }
  // Bất đồng bộ
  function saveAllUnsync(options) {
    return new Promise((resolve, reject) => {
      Promise.all(users.map(user => saveOne(user, options)))
        .then(users => {
          return resolve();
        })
        .catch(err => {
          return reject(err);
        });
    });
  }
  function saveOne(user, options) {
    return new Promise((resolve, reject) => {
      User.create([user], options)
        .then(_user => {
          console.log('Saved user: ' + user.name);
          return resolve(_user);
        })
        .catch(err => {
          return reject(err);
        });
    });
  }
};
