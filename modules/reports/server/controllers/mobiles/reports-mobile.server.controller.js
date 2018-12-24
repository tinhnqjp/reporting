'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  mongoose = require('mongoose'),
  Report = mongoose.model('Report'),
  User = mongoose.model('User'),
  Partner = mongoose.model('Partner'),
  path = require('path'),
  moment = require('moment'),
  help = require(path.resolve('./modules/core/server/controllers/help.server.controller')),
  logger = require(path.resolve('./modules/core/server/controllers/logger.server.controller'));


exports.histories = function (req, res) {
  req.checkBody('userId', 'サーバーエラーが発生しました。').notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(help.getMessage(errors));
  }

  var userId = req.body.userId;
  var keyword = req.body.keyword || '';
  var page = req.body.page || 1;
  var kind = req.body.kind || 1;

  User.findById(userId).exec((err, user) => {
    if (err) {
      logger.error(err);
      return res.status(422).send({ message: 'サーバーエラーが発生しました。' });
    }
    if (!user) {
      return res.status(422).send({ message: 'このデータは無効または削除されています。' });
    }
    if (user.roles[0] === 'partner') {
      Partner.findOne({ account: userId }).select('workers').exec()
        .then(function (partner) {
          var userIds = [userId].concat(partner.workers);
          return getListReports(userIds, keyword, kind, page);
        })
        .then(function (result) {
          res.json(result);
        })
        .catch(err => {
          logger.error(err);
          return res.status(422).send({ message: 'サーバーエラーが発生しました。' });
        });
    } else if (user.roles[0] === 'user' || user.roles[0] === 'dispatcher' || user.roles[0] === 'employee') {
      getListReports([userId], keyword, kind, page)
        .then(function (result) {
          res.json(result);
        })
        .catch(err => {
          logger.error(err);
          return res.status(422).send({ message: 'サーバーエラーが発生しました。' });
        });
    } else {
      return res.status(422).send({ message: 'アクセス権限が必要。' });
    }
  });
};

exports.create = function (req, res) {
  req.checkBody('data', 'サーバーエラーが発生しました。').notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(help.getMessage(errors));
  }

  var report = new Report(req.body.data);
  report.number = moment().valueOf().toString();
  report.save(function (err) {
    if (err) {
      logger.error(err);
      return res.status(422).send({ message: 'サーバーエラーが発生しました。' });
    }
    return res.end();
  });
};

function getListReports(userIds, keyword, kind, page) {
  return new Promise((resolve, reject) => {
    var sort = '-created';
    var limit = 20;
    var query = {};
    var and_arr = [];
    var twoYearBefore = moment().subtract(2, 'years').format('YYYY-MM-DD HH:mm');
    and_arr.push({ created: { '$gte': twoYearBefore } });
    and_arr.push({ kind: kind });
    and_arr.push({ author: { $in: userIds } });

    if (keyword && keyword !== '') {
      var key_lower = keyword.toLowerCase();
      var key_upper = keyword.toUpperCase();
      var or_arr = [
        { number: { $regex: '.*' + keyword + '.*' } },
        { number: { $regex: '.*' + key_lower + '.*' } },
        { number: { $regex: '.*' + key_upper + '.*' } },
        { author_name: { $regex: '.*' + keyword + '.*' } },
        { author_name: { $regex: '.*' + key_lower + '.*' } },
        { author_name: { $regex: '.*' + key_upper + '.*' } },
        { supplier: { $regex: '.*' + keyword + '.*' } },
        { supplier: { $regex: '.*' + key_lower + '.*' } },
        { supplier: { $regex: '.*' + key_upper + '.*' } },
        { address1: { $regex: '.*' + keyword + '.*' } },
        { address1: { $regex: '.*' + key_lower + '.*' } },
        { address1: { $regex: '.*' + key_upper + '.*' } },
        { address2: { $regex: '.*' + keyword + '.*' } },
        { address2: { $regex: '.*' + key_lower + '.*' } },
        { address2: { $regex: '.*' + key_upper + '.*' } },
        { unit_name: { $regex: '.*' + keyword + '.*' } },
        { unit_name: { $regex: '.*' + key_lower + '.*' } },
        { unit_name: { $regex: '.*' + key_upper + '.*' } },
        { location: { $regex: '.*' + keyword + '.*' } },
        { location: { $regex: '.*' + key_lower + '.*' } },
        { location: { $regex: '.*' + key_upper + '.*' } },
        { manager: { $regex: '.*' + keyword + '.*' } },
        { manager: { $regex: '.*' + key_lower + '.*' } },
        { manager: { $regex: '.*' + key_upper + '.*' } },
        { saler: { $regex: '.*' + keyword + '.*' } },
        { saler: { $regex: '.*' + key_lower + '.*' } },
        { saler: { $regex: '.*' + key_upper + '.*' } }
      ];
      and_arr.push({ $or: or_arr });
    }

    if (and_arr.length > 0) {
      query = { $and: and_arr };
    }

    Report.paginate(query, {
      select: 'created number supplier pdf',
      sort: sort,
      page: page,
      limit: limit
    })
      .then(function (result) {
        resolve(result.docs);
      }, err => {
        reject(err);
      });
  });
}
