'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Report = mongoose.model('Report'),
  path = require('path'),
  moment = require('moment'),
  _ = require('lodash'),
  logger = require(path.resolve('./modules/core/server/controllers/logger.server.controller')),
  help = require(path.resolve('./modules/core/server/controllers/help.server.controller'));

exports.create = function (req, res) {
  var report = new Report(req.body);
  report.save(function (err) {
    if (err) {
      logger.error(err);
      return res.status(422).send({ message: '報告書を登録できません。' });
    }
    return res.json(report);
  });
};

exports.read = function (req, res) {
  res.json(req.model);
};

exports.update = function (req, res) {
  var report = req.model;
  report = _.extend(report, req.body);
  report.save(function (err) {
    if (err) {
      logger.error(err);
      return res.status(422).send({ message: '報告書を変更できません。' });
    }
    res.json(report);
  });
};

exports.delete = function (req, res) {
  var report = req.model;
  report.remove(function (err) {
    if (err) {
      logger.error(err);
      return res.status(400).send({ message: '報告書を削除できません。' });
    }
    res.json(report);
  });
};

exports.list = function (req, res) {
  Report.find().sort('-created').exec(function (err, result) {
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

exports.paging = function (req, res) {
  var condition = req.body.condition || {};
  var page = condition.page || 1;
  var query = getQuery(condition);
  var sort = help.getSort(condition);
  var limit = help.getLimit(condition);

  Report.paginate(query, {
    select: 'created number supplier pdf author_name status kind unit_name',
    sort: sort,
    page: page,
    limit: limit
  }).then(function (result) {
    return res.json(result);
  }, err => {
    logger.error(err);
    return res.status(400).send({ message: 'サーバーでエラーが発生しました。' });
  });
};

exports.reportByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: '報告書が見つかりません。'
    });
  }

  Report.findById(id).exec(function (err, report) {
    if (err) {
      logger.error(err);
      return next(err);
    } else if (!report) {
      return next(new Error('報告書が見つかりません。'));
    }

    req.model = report;
    next();
  });
};


/** ====== PRIVATE ========= */
function getQuery(condition) {
  var query = {};
  var and_arr = [];
  if (condition.keyword && condition.keyword !== '') {
    var key_lower = condition.keyword.toLowerCase();
    var key_upper = condition.keyword.toUpperCase();
    var or_arr = [
      { reportname: { $regex: '.*' + condition.keyword + '.*' } },
      { reportname: { $regex: '.*' + key_lower + '.*' } },
      { reportname: { $regex: '.*' + key_upper + '.*' } },
      { description: { $regex: '.*' + condition.keyword + '.*' } },
      { description: { $regex: '.*' + key_lower + '.*' } },
      { description: { $regex: '.*' + key_upper + '.*' } }
    ];
    and_arr.push({ $or: or_arr });
  }
  if (condition.created_min) {
    and_arr.push({ created: { '$gte': condition.created_min } });
  }
  if (condition.created_max) {
    var max = moment(condition.created_max).endOf('day');
    and_arr.push({ created: { '$lte': max } });
  }
  if (and_arr.length > 0) {
    query = { $and: and_arr };
  }

  return query;
}
