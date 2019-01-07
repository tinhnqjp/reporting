'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Food = mongoose.model('Food'),
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
  var food = new Food(req.body);
  Food.findOne({ foodname: req.body.foodname }).exec((err, _food) => {
    if (_food)
      return res.status(422).send({ message: 'IDが既存しますのでアカウントを登録できません。' });
    food.save(function (err) {
      if (err)
        return res.status(422).send({ message: 'アカウントを登録できません。' });
      return res.json(food);
    });
  });
};

exports.read = function (req, res) {
  res.json(req.model);
};

exports.update = function (req, res) {
  var food = req.model;
  food = _.extend(food, req.body);
  food.save(function (err) {
    if (err)
      return res.status(422).send({ message: 'アカウントを変更できません。' });
    res.json(food);
  });
};

exports.delete = function (req, res) {
  var food = req.model;
  food.remove(function (err) {
    if (err)
      return res.status(400).send({ message: 'アカウントを削除できません。' });
    res.json(food);
  });
};

exports.list = function (req, res) {
  var condition = req.body.condition || {};
  var page = condition.page || 1;
  var query = getQuery(condition);
  var sort = help.getSort(condition);
  var limit = help.getLimit(condition);

  Food.paginate(query, {
    sort: sort,
    page: page,
    limit: limit
  }).then(function (result) {
    return res.json(result);
  }, err => {
    console.log('​exports.list -> err', err);
    return res.status(400).send({ message: 'サーバーでエラーが発生しました。' });
  });
};

exports.foodByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'アカウントが見つかりません。'
    });
  }

  Food.findById(id).exec(function (err, food) {
    if (err) {
      return next(err);
    } else if (!food) {
      return next(new Error('Failed to load food ' + id));
    }

    req.model = food;
    next();
  });
};


exports.import = function (req, res) {

};

exports.export = function (req, res) {
  const TEMPLATE_PATH = config.uploads.foods.excel.template;
  const OUT_FILE_PATH = config.uploads.foods.excel.export;
  const FILE_NAME = 'AccountList_';
  const FILE_EXT = '.xlsx';

  var strtime = moment().format('YYYYMMDDHHmmss');
  var outputExcelFileName = OUT_FILE_PATH + FILE_NAME + strtime + FILE_EXT;
  var workbook = new Excel.Workbook();
  var condition = req.body.condition || {};

  workbook.xlsx.readFile(TEMPLATE_PATH)
    .then(function () {
      return getFoods(condition);
    })
    .then(function (foods) {
      var wsExport = workbook.getWorksheet(SHEET_NAME);
      var row = 2;
      foods.forEach(food => {
        files.setValue(wsExport, row, 1, food.foodname || '不明');
        files.setValue(wsExport, row, 2, food.description || '不明');
        row++;
      });
      return workbook.xlsx.writeFile(outputExcelFileName);
    })
    .then(function () {
      return res.json({ url: outputExcelFileName });
    })
    .catch(function (err) {
      return res.status(422).send({
        message: 'サーバーでエラーが発生しました。'
      });
    });

  function getFoods(condition) {
    return new Promise(function (resolve, reject) {
      var query = getQuery(condition);
      var sort = help.getSort(condition);
      Food.find(query).sort(sort).exec((err, foods) => {
        if (err) return reject({ message: 'サーバーでエラーが発生しました。' });
        return resolve(foods);
      });
    });
  }
};
exports.report = function (req, res) {
  var result = {};
  Food.aggregate([
    { $unwind: '$roles' },
    { $group: { _id: '$roles', count: { $sum: 1 } } }
  ]).exec()
    .then(function (food) {
      result.food = food;
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
      { foodname: { $regex: '.*' + condition.keyword + '.*' } },
      { foodname: { $regex: '.*' + key_lower + '.*' } },
      { foodname: { $regex: '.*' + key_upper + '.*' } },
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
    and_arr.push({ created: { '$lte': condition.created_max } });
  }

  if (and_arr.length > 0) {
    query = { $and: and_arr };
  }

  return query;
}
