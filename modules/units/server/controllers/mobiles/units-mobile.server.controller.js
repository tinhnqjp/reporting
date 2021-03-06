'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  mongoose = require('mongoose'),
  Unit = mongoose.model('Unit'),
  path = require('path'),
  logger = require(path.resolve('./modules/core/server/controllers/logger.server.controller'));


exports.list = function (req, res) {
  Unit.find().sort('-created').select('_id name').exec(function (err, result) {
    if (err) {
      logger.error(err);
      return res.status(422).send({
        message: 'サーバーエラーが発生しました。'
      });
    } else {
      res.json(result);
    }
  });
};
