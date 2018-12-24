'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  mongoose = require('mongoose'),
  validator = require('validator'),
  Worker = mongoose.model('Worker'),
  Partner = mongoose.model('Partner'),
  Petition = mongoose.model('Petition'),
  path = require('path'),
  helper = require(path.resolve('./modules/core/server/controllers/help.server.controller')),
  logger = require(path.resolve('./modules/core/server/controllers/logger.server.controller'));

/**
 * Get list worker from userId of partner
 * @param userId partner
 * @returns { results: list Workers }
 * @version 2018/12/24
 */
exports.list = function (req, res) {
  req.checkBody('userId', 'サーバーエラーが発生しました。').notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(helper.getMessage(errors));
  }

  var userId = req.body.userId;
  Partner.findOne({ account: userId }).exec((err, partner) => {
    if (err) {
      logger.error(err);
      return res.status(422).send({ message: 'サーバーエラーが発生しました。' });
    }
    if (!partner)
      return res.status(422).send({ message: 'このデータは無効または削除されています。' });

    Worker.find({ partner: partner._id })
      .sort('-created')
      .select('_id name description phone manager')
      .populate('account', 'username')
      .exec(function (err, result) {
        if (err) {
          logger.error(err);
          return res.status(422).send({
            message: 'サーバーエラーが発生しました。'
          });
        } else {
          res.json(result);
        }
      });

  });
};

/**
 * request worker for partner
 * @param userId partner
 * @param name name of worker
 * @param phone phone of worker
 * @param manager manager of worker
 * @returns bool
 * @version 2018/12/24
 */
exports.petition = function (req, res) {
  var pattern = /^(([0-9]{9,13}$)|([0-9]{3}-[0-9]{3}-[0-9]{4}$)|([0-9]{2}-[0-9]{4}-[0-9]{4}$)|([0-9]{3}-[0-9]{4}-[0-9]{4}$))/;
  req.checkBody('userId', 'サーバーエラーが発生しました。').notEmpty();
  req.checkBody('name', 'サーバーエラーが発生しました。').notEmpty();
  req.checkBody('phone', 'サーバーエラーが発生しました。').notEmpty().matches(pattern);
  req.checkBody('manager', 'サーバーエラーが発生しました。').notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(helper.getMessage(errors));
  }

  var userId = req.body.userId;
  var name = req.body.name;
  var phone = req.body.phone;
  var manager = req.body.manager;
  Partner.findOne({ account: userId }).exec((err, partner) => {
    if (err) {
      logger.error(err);
      return res.status(422).send({ message: 'サーバーエラーが発生しました。' });
    }
    if (!partner)
      return res.status(400).send({ message: 'このデータは無効または削除されています。' });

    var petiton = new Petition({
      name: name,
      phone: phone,
      manager: manager,
      partner: partner
    });
    petiton.save(function (err) {
      if (err) {
        logger.error(err);
        return res.status(422).send({ message: 'サーバーエラーが発生しました。' });
      }
      res.end();
    });
  });

};

