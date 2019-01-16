'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Report = mongoose.model('Report'),
  path = require('path'),
  config = require(path.resolve('./config/config')),
  moment = require('moment'),
  _ = require('lodash'),
  Excel = require('exceljs'),
  master_data = require(path.resolve('./config/lib/master-data')),
  logger = require(path.resolve('./modules/core/server/controllers/logger.server.controller')),
  help = require(path.resolve('./modules/core/server/controllers/help.server.controller')),
  reports_mobile = require(path.resolve('./modules/reports/server/controllers/mobiles/reports-mobile.server.controller')),
  files = require(path.resolve('./modules/core/server/controllers/files.server.controller'));

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
    Report.updateLogs(report, req.user, 2)
      .then(function (result) {
        return res.json(result);
      }, err => {
        logger.error(err);
        return res.status(400).send({ message: 'サーバーでエラーが発生しました。' });
      });
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
    select: 'created number supplier pdf author_name status kind unit_name start end',
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

exports.updateStatus = function (req, res) {
  var reportId = req.body.reportId;
  var status = req.body.status;
  if (!mongoose.Types.ObjectId.isValid(reportId)) {
    return res.status(400).send({
      message: '報告書が見つかりません。'
    });
  }

  Report.findById(reportId).select('_id status logs').exec(function (err, report) {
    if (err) {
      logger.error(err);
      return res.status(422).send({ message: 'サーバーでエラーが発生しました。' });
    } else if (!report) {
      return res.status(422).send({ message: '報告書が見つかりません。' });
    }
    var status_before = report.status;
    report.status = status;
    report.save(function (err) {
      if (err) {
        logger.error(err);
        return res.status(422).send({ message: '報告書を変更できません。' });
      }

      var action = 3;
      if (status_before > status) {
        switch (status) {
          case 1:
            action = 6; break;
          case 2:
            action = 7; break;
          case 3:
            action = 8; break;
        }
      } else {
        switch (status) {
          case 2:
            action = 3; break;
          case 3:
            action = 4; break;
          case 4:
            action = 5; break;
        }
      }

      Report.updateLogs(report, req.user, action)
        .then(function () {
          return res.end();
        }, err => {
          logger.error(err);
          return res.status(400).send({ message: 'サーバーでエラーが発生しました。' });
        });
      res.end();
    });


  });
};

exports.export = function (req, res) {
  var reportId = req.body.reportId;
  if (!mongoose.Types.ObjectId.isValid(reportId)) {
    return res.status(400).send({
      message: '報告書が見つかりません。'
    });
  }
  Report.exportClean(reportId)
    .then(function (urlOutput) {
      res.json(urlOutput);
    })
    .catch(function (err) {
      logger.error(err);
      return res.status(422).send({ message: 'サーバーでエラーが発生しました。' });
    });

};

/** ====== PRIVATE ========= */
function getQuery(condition) {
  var key_lower = '';
  var key_upper = '';
  var or_arr = [];

  var query = {};
  var and_arr = [];
  if (condition.keyword && condition.keyword !== '') {
    key_lower = condition.keyword.toLowerCase();
    key_upper = condition.keyword.toUpperCase();
    or_arr = [
      { search: { $regex: '.*' + condition.keyword + '.*' } },
      { search: { $regex: '.*' + key_lower + '.*' } },
      { search: { $regex: '.*' + key_upper + '.*' } }
    ];
    and_arr.push({ $or: or_arr });
  }
  if (condition.unit) {
    and_arr.push({ unit: condition.unit });
  }
  if (condition.role) {
    and_arr.push({ role: condition.role });
  }
  if (condition.status) {
    and_arr.push({ status: condition.status });
  }
  if (condition.kind) {
    and_arr.push({ kind: condition.kind });
  }
  if (condition.location) {
    and_arr.push({ location: condition.location });
  }
  if (condition.manager && condition.manager !== '') {
    key_lower = condition.manager.toLowerCase();
    key_upper = condition.manager.toUpperCase();
    or_arr = [
      { manager: { $regex: '.*' + condition.manager + '.*' } },
      { manager: { $regex: '.*' + key_lower + '.*' } },
      { manager: { $regex: '.*' + key_upper + '.*' } }
    ];
    and_arr.push({ $or: or_arr });
  }
  if (condition.author_name && condition.author_name !== '') {
    key_lower = condition.author_name.toLowerCase();
    key_upper = condition.author_name.toUpperCase();
    or_arr = [
      { author_name: { $regex: '.*' + condition.author_name + '.*' } },
      { author_name: { $regex: '.*' + key_lower + '.*' } },
      { author_name: { $regex: '.*' + key_upper + '.*' } }
    ];
    and_arr.push({ $or: or_arr });
  }

  if (condition.start_min) {
    and_arr.push({ start: { '$gte': condition.start_min } });
  }
  if (condition.start_max) {
    and_arr.push({ start: { '$lte': condition.start_max } });
  }

  if (condition.end_min) {
    and_arr.push({ end: { '$gte': condition.end_min } });
  }
  if (condition.end_max) {
    and_arr.push({ end: { '$lte': condition.end_max } });
  }

  if (condition.created_min) {
    and_arr.push({ created: { '$gte': condition.created_min } });
  }
  if (condition.created_max) {
    and_arr.push({ created: { '$lte': condition.created_max } });
  }
  if (and_arr.length > 0) {
    query = { $and: and_arr };
  }

  return query;
}

