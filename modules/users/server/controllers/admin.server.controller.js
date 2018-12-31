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
  moment = require('moment'),
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
exports.import = function (req, res) {
  var filePath;
  var workbook = new Excel.Workbook();
  saveFile(req, res)
    .then(file => {
      filePath = file.path;
      return workbook.xlsx.readFile(filePath);
    })
    .then(() => {
      return validateImportFile(workbook);
    })
    .then(errors => {
      if (!errors || errors.length === 0) {
        return writeData(workbook);
      } else {
        res.jsonp({ status: false, errors: errors });
        return new Promise((resolve, reject) => { return reject(); });
      }
    })
    .then(result => {
      res.jsonp({ status: true, result: result });
      fs.unlink(filePath, (err) => {
        if (err) {
          logger.error(err);
        }
        console.log('Removed: ' + filePath);
      });
    })
    .catch(err => {
      logger.error(err);
      if (err && err.status) {
        return res.status(422).send({ message: err.message });
      }
    });
  function saveFile(req, res) {
    return new Promise(function (resolve, reject) {
      var upload = multer(config.uploads.users.excel).single('import');
      upload.fileFilter = require(path.resolve('./config/lib/multer')).exportFileFilter;
      upload(req, res, function (err) {
        if (err)
          return reject(err);
        if (req.file)
          return resolve(req.file);
        return reject({ message: 'CSVファイルのアップロードが失敗しました。' });
      });
    });
  }
  function validateImportFile(workbook) {
    return new Promise(function (resolve, reject) {
      if (!workbook) return reject({ status: 500, message: 'サーバーエラーが発生しました。' });
      var worksheet = workbook.getWorksheet(SHEET_NAME);
      if (!worksheet) return reject({ status: 400, message: 'AccountListシート名が見つかりません。' });

      var header = worksheet.getRow(1).values;

      const hCode = (header[1]) ? header[1].toString() : '';
      const hName = (header[2]) ? header[2].toString() : '';
      const hUsername = (header[3]) ? header[3].toString() : '';
      const hRemove = header[4] || '';
      if (hCode !== '顧客コード' || hName !== '顧客名' || hUsername !== 'ID' || hRemove !== '削除') {
        return reject({ status: 400, message: 'インポートファイルのヘッダが違います。' });
      }
      var promises = [];
      worksheet.eachRow(function (row, rowNumber) {
        if (rowNumber !== 1) {
          promises.push(validateRow(row, rowNumber));
        }
      });
      Promise.all(promises).then(_errors => {
        var errors = __.filter(_errors, function (item) { return (item && item.length > 0); });
        return resolve(errors);
      }).catch(err => {
        return reject({ status: 500, message: 'サーバーエラーが発生しました。' });
      });
    });
  }
  function validateRow(row, rowNumber) {
    return new Promise(function (resolve, reject) {
      var data = row.values;
      const code = (data[1]) ? data[1].toString() : '';
      const name = (data[2]) ? data[2].toString() : '';
      const username = (data[3]) ? data[3].toString() : '';
      const remove = data[4] || '';

      if (username.length > 12)
        return resolve('IDは12桁以内を入力してください。（' + rowNumber + '行目）');
      if (code.length > 9)
        return resolve('顧客コードは9桁以内を入力してください。（' + rowNumber + '行目）');
      if (name.length > 50)
        return resolve('顧客名は50桁以内を入力してください。（' + rowNumber + '行目）');

      // 削除
      if (remove && remove.toLowerCase() === 'd') {
        if (username === '' && code === '')
          return resolve('顧客コードまたはIDが未入力です（' + rowNumber + '行目）');
        return resolve();
      } else {
        if (username === '')
          return resolve('IDが未入力です（' + rowNumber + '行目）');

        User.findOne({ username: username }).exec((err, _user) => {
          if (err)
            return resolve('アカウントの既存チェックができません（' + rowNumber + '行目）');

          // 更新
          if (_user) {
            if (code === '' || name === '')
              return resolve('顧客コードまたは顧客名が未入力です（' + rowNumber + '行目）');

            if (!halfsizeAlphamericValidate(code)) {
              return resolve('顧客コードは半角英数字を入力してください。（' + rowNumber + '行目）');
            }
            return resolve();
          } else { // 新規
            if (code === '' || name === '' || username === '')
              return resolve('全項目を入力してください。（' + rowNumber + '行目）');

            if (!halfsizeAlphamericValidate(username)) {
              return resolve('IDは半角英数字を入力してください。（' + rowNumber + '行目）');
            }
            if (!halfsizeAlphamericValidate(code)) {
              return resolve('顧客コードは半角英数字を入力してください。（' + rowNumber + '行目）');
            }
            return resolve();
          }
        });
      }
    });
  }
  function writeData(workbook) {
    return new Promise(function (resolve, reject) {
      if (!workbook) return reject({ status: 500, message: 'サーバーエラーが発生しました。' });
      var worksheet = workbook.getWorksheet(SHEET_NAME);
      if (!worksheet) return reject({ status: 400, message: 'AccountListシート名が見つかりません。' });
      var promises = [];
      worksheet.eachRow(function (row, rowNumber) {
        if (rowNumber !== 1) {
          promises.push(handleWriteRow(row, rowNumber));
        }
      });
      Promise.all(promises).then(results => {
        var add = getSum(results, 1);
        var update = getSum(results, 2);
        var remove = getSum(results, 3);
        return resolve({ add: add, update: update, remove: remove });
      }).catch(err => {
        logger.error(err);
        return reject({ status: 500, message: 'サーバーエラーが発生しました。' });
      });
    });
  }
  function handleWriteRow(row, rowNumber) {
    return new Promise(function (resolve, reject) {
      var data = row.values;
      const code = (data[1]) ? data[1].toString() : '';
      const name = (data[2]) ? data[2].toString() : '';
      const username = (data[3]) ? data[3].toString() : '';
      const remove = data[4] || '';
      // 削除
      if (remove && remove.toLowerCase() === 'd') {
        var query = {};
        if (username !== '') {
          query.username = username;
        }
        if (code !== '') {
          query.code = code;
        }
        User.find(query).exec((err, users) => {
          if (err)
            return reject({ status: 500, message: 'アカウントの既存チェックができません（' + rowNumber + '行目）' });
          var promises = [];
          users.forEach(user => {
            promises.push(removeUser(user));
          });

          Promise.all(promises).then(rs => {
            var num = 0;
            for (let i = 0; i < rs.length; i++) {
              const element = rs[i];
              if (element.action === 3) {
                num += 1;
              }
            }
            return resolve({ action: 3, number: num });
          });
        });
      } else {
        User.findOne({ username: username, deleted: false }).exec((err, _user) => {
          if (err)
            return reject({ status: 500, message: 'サーバーエラーが発生しました。' });

          // 更新
          if (_user) {
            _user.code = code;
            _user.name = name;
            _user.save(err => {
              if (err)
                return reject({ status: 500, message: 'サーバーエラーが発生しました。' });
              return resolve({ action: 2, number: 1 });
            });
          } else { // 新規
            var newUser = new User({ code: code, name: name, username: username });
            newUser.save(err => {
              if (err)
                return reject({ status: 500, message: 'サーバーエラーが発生しました。' });
              return resolve({ action: 1, number: 1 });
            });
          }
        });
      }
    });
  }
  function removeUser(user) {
    return new Promise((resolve, reject) => {
      user.deleted = true;
      user.save(err => {
        if (!err)
          return resolve({ action: 3 });
        return resolve({ action: 0 });
      });
    });
  }
  function halfsizeAlphamericValidate(text) {
    var str = (!text) ? '' : text;
    // if (id.match(/^[0-9a-fA-F]{24}$/)) {
    //   query.$or.push({ _id: id });
    // }
    if (str.match(/^[A-Za-z0-9]*$/)) {
      return true;
    } else {
      return false;
    }
  }
  function getSum(arr, action) {
    var sum = 0;
    for (let i = 0; i < arr.length; i++) {
      const element = arr[i];
      if (element.action === action) {
        sum += element.number;
      }
    }
    return sum;
  }
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
  var result = {};
  User.aggregate([
    { $unwind: '$roles' },
    { $group: { _id: '$roles', count: { $sum: 1 } }, deleted: false }
  ]).exec()
    .then(function (user) {
      result.user = user;
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
      logger.error(err);
      return res.jsonp({});
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
    var max = moment(condition.created_max).endOf('day');
    and_arr.push({ created: { '$lte': max } });
  }

  var sort = (condition.sort_direction === '-') ? condition.sort_direction : '';
  sort = sort + condition.sort_column;
  return { $and: and_arr };
}
