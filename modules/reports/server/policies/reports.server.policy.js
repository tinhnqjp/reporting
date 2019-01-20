'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Reports Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/reports',
      permissions: '*'
    }, {
      resources: '/api/reports/:reportId',
      permissions: '*'
    }, {
      resources: '/api/reports/list',
      permissions: '*'
    }, {
      resources: '/api/reports/import',
      permissions: '*'
    }, {
      resources: '/api/reports/export',
      permissions: '*'
    }, {
      resources: '/api/reports/status',
      permissions: '*'
    }, {
      resources: '/api/reports/report',
      permissions: '*'
    }, {
      resources: '/api/report/signature',
      permissions: '*'
    }, {
      resources: '/api/report/drawing',
      permissions: '*'
    }]
  }]);
};

/**
 * Check If Reports Policy Allows
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

