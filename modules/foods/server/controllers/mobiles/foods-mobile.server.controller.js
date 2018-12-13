'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  mongoose = require('mongoose'),
  Food = mongoose.model('Food'),
  path = require('path'),
  logger = require(path.resolve('./modules/core/server/controllers/logger.server.controller'));
