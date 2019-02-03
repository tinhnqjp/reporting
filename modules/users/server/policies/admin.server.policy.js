'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Admin Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['operator', 'bsoperator', 'dispatcher', 'employee', 'admin'],
    allows: [{
      resources: '/api/users',
      permissions: '*'
    }, {
      resources: '/api/users/:userId',
      permissions: '*'
    }, {
      resources: '/api/users/list',
      permissions: '*'
    }, {
      resources: '/api/users/import',
      permissions: '*'
    }, {
      resources: '/api/users/export',
      permissions: '*'
    }, {
      resources: '/api/users/report',
      permissions: '*'
    }]
  }]);
};

/**
 * Check If Admin Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : [];
  if (roles.length === 0) return res.status(403).json({ message: 'アクセス権限が必要。' });
  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) return res.status(500).send('サーバーでエラーが発生しました。');
    if (!isAllowed) return res.status(403).json({ message: 'アクセス権限が必要。' });
    return next();
  });
};
exports.isMobileAllowed = function (req, res, next) {
  if (!req.body.deviceId || req.body.deviceId === '')
    return res.status(403).json({ message: 'アクセス権限がありません。' });
  return next();
};
