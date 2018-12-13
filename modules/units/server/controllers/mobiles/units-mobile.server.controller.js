'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  mongoose = require('mongoose'),
  Unit = mongoose.model('Unit'),
  path = require('path'),
  logger = require(path.resolve('./modules/core/server/controllers/logger.server.controller'));
