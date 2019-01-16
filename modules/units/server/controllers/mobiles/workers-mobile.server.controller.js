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
  Partner.findOne({ account: userId, deleted: false }).exec((err, partner) => {
    if (err) {
      logger.error(err);
      return res.status(422).send({ message: 'サーバーエラーが発生しました。' });
    }
    if (!partner)
      return res.status(422).send({ message: 'このデータは無効または削除されています。' });

    Worker.find({ partner: partner._id, deleted: false })
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
  var pattern = /^([0-9]{9,13}$)/;
  req.checkBody('userId', 'アカウントを入力してください。').notEmpty();
  req.checkBody('action', '申請種類を入力してください。').notEmpty();
  var action = req.body.action;
  if (action === 1) {
    req.checkBody('name', '氏名を入力してください。').notEmpty();
    req.checkBody('phone', '電話番号を入力してください。').notEmpty();
    req.checkBody('phone', '電話番号の入力形式に誤りがあります。').matches(pattern);
    req.checkBody('manager', '担当者を入力してください。').notEmpty();
  } else {
    req.checkBody('workerId', '下請けを入力してください。').notEmpty();
  }

  var errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(helper.getMessage(errors));
  }

  var userId = req.body.userId;
  var name = req.body.name;
  var phone = req.body.phone;
  var manager = req.body.manager;
  var workerId = req.body.workerId;
  Partner.findOne({ account: userId, deleted: false }).exec((err, partner) => {
    if (err) {
      logger.error(err);
      return res.status(422).send({ message: 'サーバーエラーが発生しました。' });
    }
    if (!partner)
      return res.status(400).send({ message: 'このデータは無効または削除されています。' });

    var petiton = {};
    if (action === 1) {
      petiton = new Petition({
        name: name,
        phone: phone,
        manager: manager,
        partner: partner,
        partner_name: partner.name,
        action: 1
      });
      petiton.save(function (err) {
        if (err) {
          logger.error(err);
          return res.status(422).send({ message: 'サーバーエラーが発生しました。' });
        }
        res.end();
      });
    } else {
      var exist = false;
      if (partner.workers && partner.workers.length > 0) {
        partner.workers.forEach(worker => {
          if (worker.toString() === workerId) {
            exist = true;
          }
        });
      }
      if (exist) {
        petiton = new Petition({
          workerId: workerId,
          partner: partner,
          partner_name: partner.name,
          action: 2
        });

        petiton.save(function (err) {
          if (err) {
            logger.error(err);
            return res.status(422).send({ message: 'サーバーエラーが発生しました。' });
          }
          res.end();
        });
      } else {
        return res.status(422).send({ message: '下請けが削除されました。インタネット環境でアプリを再起動してください。' });
      }
    }
  });
};

