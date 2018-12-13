'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Unit = mongoose.model('Unit'),
  Config = mongoose.model('Config'),
  path = require('path'),
  config = require(path.resolve('./config/config')),
  multer = require('multer'),
  moment = require('moment'),
  fs = require('fs'),
  Excel = require('exceljs'),
  __ = require('underscore'),
  _ = require('lodash'),
  help = require(path.resolve('./modules/core/server/controllers/help.server.controller')),
  files = require(path.resolve('./modules/core/server/controllers/files.server.controller'));

var SHEET_NAME = 'AccountList';

exports.create = function (req, res) {
  var unit = new Unit(req.body);
  Unit.findOne({ unitname: req.body.unitname }).exec((err, _unit) => {
    if (_unit)
      return res.status(422).send({ message: 'IDが既存しますのでアカウントを登録できません！' });
    unit.save(function (err) {
      if (err)
        return res.status(422).send({ message: 'アカウントを登録できません！' });
      return res.json(unit);
    });
  });
};

exports.read = function (req, res) {
  res.json(req.model);
};

exports.update = function (req, res) {
  var unit = req.model;
  unit = _.extend(unit, req.body);
  unit.save(function (err) {
    if (err)
      return res.status(422).send({ message: 'アカウントを変更できません！' });
    res.json(unit);
  });
};

exports.delete = function (req, res) {
  var unit = req.model;
  unit.remove(function (err) {
    if (err)
      return res.status(400).send({ message: 'アカウントを削除できません！' });
    res.json(unit);
  });
};

exports.list = function (req, res) {
  var condition = req.body.condition || {};
  var page = condition.page || 1;
  var query = getQuery(condition);
  var sort = help.getSort(condition);
  var limit = help.getLimit(condition);

  Unit.paginate(query, {
    sort: sort,
    page: page,
    limit: limit
  }).then(function (result) {
    return res.json(result);
  }, err => {
    console.log('​exports.list -> err', err);
    return res.status(400).send({ message: 'サーバーでエラーが発生しました！' });
  });
};

exports.unitByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'アカウントが見つかりません。'
    });
  }

  Unit.findById(id).exec(function (err, unit) {
    if (err) {
      return next(err);
    } else if (!unit) {
      return next(new Error('Failed to load unit ' + id));
    }

    req.model = unit;
    next();
  });
};


exports.import = function (req, res) {

};

exports.export = function (req, res) {
  const TEMPLATE_PATH = config.uploads.units.excel.template;
  const OUT_FILE_PATH = config.uploads.units.excel.export;
  const FILE_NAME = 'AccountList_';
  const FILE_EXT = '.xlsx';

  var strtime = moment().format('YYYYMMDDHHmmss');
  var outputExcelFileName = OUT_FILE_PATH + FILE_NAME + strtime + FILE_EXT;
  var workbook = new Excel.Workbook();
  var condition = req.body.condition || {};

  workbook.xlsx.readFile(TEMPLATE_PATH)
    .then(function () {
      return getUnits(condition);
    })
    .then(function (units) {
      var wsExport = workbook.getWorksheet(SHEET_NAME);
      var row = 2;
      units.forEach(unit => {
        files.setValue(wsExport, row, 1, unit.unitname || '不明');
        files.setValue(wsExport, row, 2, unit.description || '不明');
        row++;
      });
      return workbook.xlsx.writeFile(outputExcelFileName);
    })
    .then(function () {
      return res.json({ url: outputExcelFileName });
    })
    .catch(function (err) {
      return res.status(422).send({
        message: 'サーバーでエラーが発生しました！'
      });
    });

  function getUnits(condition) {
    return new Promise(function (resolve, reject) {
      var query = getQuery(condition);
      var sort = help.getSort(condition);
      Unit.find(query).sort(sort).exec((err, units) => {
        if (err) return reject({ message: 'サーバーでエラーが発生しました！' });
        return resolve(units);
      });
    });
  }
};
exports.report = function (req, res) {
  var result = {};
  Unit.aggregate([
    { $unwind: '$roles' },
    { $group: { _id: '$roles', count: { $sum: 1 } } }
  ]).exec()
    .then(function (unit) {
      result.unit = unit;
      return Config.findOne().exec();
    })
    .then(conf => {
      if (conf) {
        result.apiCnt = conf.apiCnt;
        res.json(result);
      } else {
        conf = new Config();
        conf.save();
        result.apiCnt = 0;
        res.json(result);
      }
    })
    .catch(err => {
      console.log(err);
      return res.jsonp({});
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
      { unitname: { $regex: '.*' + condition.keyword + '.*' } },
      { unitname: { $regex: '.*' + key_lower + '.*' } },
      { unitname: { $regex: '.*' + key_upper + '.*' } },
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
