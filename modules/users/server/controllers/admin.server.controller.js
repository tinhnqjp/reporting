'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Config = mongoose.model('Config'),
  path = require('path'),
  config = require(path.resolve('./config/config')),
  multer = require('multer'),
  moment = require('moment-timezone'),
  fs = require('fs'),
  Excel = require('exceljs'),
  __ = require('underscore'),
  _ = require('lodash'),
  logger = require(path.resolve('./modules/core/server/controllers/logger.server.controller')),
  help = require(path.resolve('./modules/core/server/controllers/help.server.controller')),
  files = require(path.resolve('./modules/core/server/controllers/files.server.controller'));

var SHEET_NAME = 'AccountList';

exports.create = function (req, res) {
  var user = new User(req.body);

  User.findOne({ username: req.body.username, deleted: false }).exec((err, _user) => {
    if (err) {
      logger.error(err);
      return res.status(422).send({ message: 'アカウントを登録できません。' });
    }
    if (_user)
      return res.status(422).send({ message: 'IDが既存しますのでアカウントを登録できません。' });
    user.save(function (err) {
      if (err) {
        logger.error(err);
        return res.status(422).send({ message: 'アカウントを登録できません。' });
      }
      return res.json(user);
    });
  });
};

exports.read = function (req, res) {
  res.json(req.model);
};

exports.update = function (req, res) {
  var user = req.model;
  if (user.username !== req.body.username) {
    User.findOne({ username: req.body.username, deleted: false }).exec((err, _user) => {
      if (_user)
        return res.status(422).send({ message: 'IDが既存しますのでアカウントを変更できません。' });
      user = _.extend(user, req.body);
      user.save(function (err) {
        if (err) {
          logger.error(err);
          return res.status(422).send({ message: 'アカウントを変更できません。' });
        }
        res.json(user);
      });
    });
  } else {
    user = _.extend(user, req.body);
    user.save(function (err) {
      if (err) {
        logger.error(err);
        return res.status(422).send({ message: 'アカウントを変更できません。' });
      }
      res.json(user);
    });
  }
};

exports.delete = function (req, res) {
  var user = req.model;
  user.deleted = true;
  user.save(function (err) {
    if (err) {
      logger.error(err);
      return res.status(400).send({ message: 'アカウントを削除できません。' });
    }
    res.json(user);
  });
};

exports.list = function (req, res) {
  var condition = req.body.condition || {};
  var page = condition.page || 1;
  var query = getQuery(condition);
  var sort = help.getSort(condition);
  var limit = help.getLimit(condition);

  User.paginate(query, {
    sort: sort,
    page: page,
    limit: limit,
    populate: [
      { path: 'unit', select: 'name' }
    ]
  }).then(function (result) {
    return res.json(result);
  }, err => {
    logger.error(err);
    return res.status(400).send({ message: 'サーバーでエラーが発生しました。' });
  });
};

exports.userByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'アカウントが見つかりません。'
    });
  }

  User.findById(id, '-salt -password -providerData')
    .populate('unit', 'name')
    .exec(function (err, user) {
      if (err) {
        logger.error(err);
        return next(err);
      } else if (!user) {
        return next(new Error('Failed to load user ' + id));
      }

      req.model = user;
      next();
    });
};

exports.export = function (req, res) {
  const TEMPLATE_PATH = config.uploads.users.excel.template;
  const OUT_FILE_PATH = config.uploads.users.excel.export;
  const FILE_NAME = 'AccountList_';
  const FILE_EXT = '.xlsx';

  var strtime = moment().format('YYYYMMDDHHmmss');
  var outputExcelFileName = OUT_FILE_PATH + FILE_NAME + strtime + FILE_EXT;
  var workbook = new Excel.Workbook();
  var condition = req.body.condition || {};

  workbook.xlsx.readFile(TEMPLATE_PATH)
    .then(function () {
      return getUsers(condition);
    })
    .then(function (users) {
      var wsExport = workbook.getWorksheet(SHEET_NAME);
      var row = 2;
      users.forEach(user => {
        files.setValue(wsExport, row, 1, user.code || '不明');
        files.setValue(wsExport, row, 2, user.name || '不明');
        files.setValue(wsExport, row, 3, user.username || '不明');
        files.setValue(wsExport, row, 4, '');
        files.setValue(wsExport, row, 5, user.count, 'center');
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

  function getUsers(condition) {
    return new Promise(function (resolve, reject) {
      var query = getQuery(condition);
      var sort = help.getSort(condition);
      User.find(query).sort(sort).exec((err, users) => {
        if (err) {
          logger.error(err);
          return reject({ message: 'サーバーでエラーが発生しました。' });
        }
        return resolve(users);
      });
    });
  }
};

exports.report = function (req, res) {
  var result = {
    total: {},
    today: {}
  };
  var today = moment().startOf('day');
  var tomorrow = moment(today).endOf('day');
  var Unit = mongoose.model('Unit');
  var Report = mongoose.model('Report');
  var Petition = mongoose.model('Petition');

  Promise.all([
    User.countDocuments({ roles: { $in: ['operator', 'bsoperator', 'dispatcher', 'employee', 'admin'] }, deleted: false }).exec(),
    User.countDocuments({ roles: 'partner', deleted: false }).exec(),
    User.countDocuments({ roles: 'user', deleted: false }).exec(),
    Unit.countDocuments().exec(),
    Report.countDocuments({ kind: 1 }).exec(),
    Report.countDocuments({ kind: 2 }).exec(),
    Report.countDocuments({ kind: 3 }).exec(),
    Report.countDocuments({ kind: 4 }).exec(),
    Petition.countDocuments({ action: 1 }).exec(),
    Petition.countDocuments({ action: 2 }).exec(),
    Report.countDocuments({ kind: 1, created: { '$gte': today, '$lte': tomorrow } }).exec(),
    Report.countDocuments({ kind: 2, created: { '$gte': today, '$lte': tomorrow } }).exec(),
    Report.countDocuments({ kind: 3, created: { '$gte': today, '$lte': tomorrow } }).exec(),
    Report.countDocuments({ kind: 4, created: { '$gte': today, '$lte': tomorrow } }).exec()
  ])
    .then(function (array) {
      result.total.employes = array[0];
      result.total.partners = array[1];
      result.total.workers = array[2];
      result.total.units = array[3];
      result.total.cleans = array[4];
      result.total.repairs = array[5];
      result.total.constructs = array[6];
      result.total.pictures = array[7];

      result.total.petitions_create = array[8];
      result.total.petitions_delete = array[9];

      result.today.cleans = array[10];
      result.today.repairs = array[11];
      result.today.constructs = array[12];
      result.today.pictures = array[13];

      res.json(result);
    })
    .catch(err => {
      logger.error(err);
      return res.status(422).send({ message: 'サーバーエラーが発生しました。' });
    });
};


/** ====== PRIVATE ========= */
function getQuery(condition) {
  var and_arr = [{ deleted: false }];
  if (condition.roles) {
    and_arr.push({ roles: { $in: condition.roles } });
  }
  if (condition.role) {
    and_arr.push({ roles: condition.role });
  }

  if (condition.keyword && condition.keyword !== '') {
    var key_lower = condition.keyword.toLowerCase();
    var key_upper = condition.keyword.toUpperCase();
    var or_arr = [
      { username: { $regex: '.*' + condition.keyword + '.*' } },
      { username: { $regex: '.*' + key_lower + '.*' } },
      { username: { $regex: '.*' + key_upper + '.*' } },
      { name: { $regex: '.*' + condition.keyword + '.*' } },
      { name: { $regex: '.*' + key_lower + '.*' } },
      { name: { $regex: '.*' + key_upper + '.*' } }
    ];
    and_arr.push({ $or: or_arr });
  }
  if (condition.created_min) {
    and_arr.push({ created: { '$gte': condition.created_min } });
  }
  if (condition.created_max) {
    and_arr.push({ created: { '$lte': condition.created_max } });
  }

  var sort = (condition.sort_direction === '-') ? condition.sort_direction : '';
  sort = sort + condition.sort_column;
  return { $and: and_arr };
}
