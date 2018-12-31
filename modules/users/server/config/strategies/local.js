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
      if (!user || !user.authenticate(password) || !checkRole(user.roles))
        return done(null, false, { message: 'ユーザーIDかパスワードが違います。' });
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
