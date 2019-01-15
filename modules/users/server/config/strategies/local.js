'use strict';

/**
 * Module dependencies
 */
var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  User = require('mongoose').model('User');

module.exports = function () {
  // Use local strategy
  passport.use(new LocalStrategy({
    usernameField: 'usernameOrEmail',
    passwordField: 'password'
  }, function (usernameOrEmail, password, done) {
    User.findOne({
      $or: [
        { username: usernameOrEmail.toLowerCase() },
        { email: usernameOrEmail.toLowerCase() }
      ],
      deleted: false
    }, function (err, user) {
      if (err) return done(err);
<<<<<<< HEAD
      if (!user || !user.authenticate(password))
        return done(null, false, { message: 'ログインIDかパスワードが違います。' });
=======
      if (!user || !user.authenticate(password) || !checkRole(user.roles))
        return done(null, false, { message: 'ユーザーIDかパスワードが違います。' });
>>>>>>> ec5acda89d5313e5687648dcfb8f39e6a5993e75
      return done(null, user);
    });
  }));

  function checkRole(roles) {
    if (roles && roles[0] && ['operator', 'bsoperator', 'dispatcher', 'employee', 'admin'].indexOf(roles[0]) >= 0) {
      return true;
    }
    return false;
  }
};
