'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  mongoose = require('mongoose'),
  Report = mongoose.model('Report'),
  User = mongoose.model('User'),
  Unit = mongoose.model('Unit'),
  Partner = mongoose.model('Partner'),
  Worker = mongoose.model('Worker'),
  path = require('path'),
  moment = require('moment'),
  crypto = require('crypto'),
  fs = require('fs'),
  config = require(path.resolve('./config/config')),
  help = require(path.resolve(
    './modules/core/server/controllers/help.server.controller'
  )),
  logger = require(path.resolve(
    './modules/core/server/controllers/logger.server.controller'
  ));

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

  getUserById(userId)
    .then(user => {
      if (user.roles[0] === 'partner') {
        Partner.findOne({ account: userId })
          .select('workers')
          .exec((err, partner) => {
            if (err) return new Promise((resolve, reject) => { return reject({ status: 422, message: 'サーバーエラーが発生しました。' }); });
            var userIds = [userId].concat(partner.workers);
            return new Promise((resolve, reject) => { return resolve(userIds); });
          });
      } else {
        return new Promise((resolve, reject) => { return resolve([userId]); });
      }
    })
    .then(userIds => {
      return getListReports(userIds, keyword, kind, page);
    })
    .then(result => {
      return res.json(result);
    })
    .catch(err => {
      if (err.status)
        return res.status(err.status).send(err);
      return res.status(422).send({ message: 'サーバーエラーが発生しました。' });
    });

  function getUserById(userId) {
    return new Promise((resolve, reject) => {
      User.findById(userId).exec((err, user) => {
        if (err) {
          logger.error(err);
          return reject({ status: 422, message: 'サーバーエラーが発生しました。' });
        }
        if (!user)
          return reject({ status: 422, message: 'このアカウントは無効または削除されています。' });
        return resolve(user);
      });
    });
  }
  function getListReports(userIds, keyword, kind, page) {
    return new Promise((resolve, reject) => {
      var sort = '-created';
      var limit = 20;
      var query = {};
      var and_arr = [];
      var twoYearBefore = moment().subtract(2, 'years').format('YYYY-MM-DD HH:mm');
      and_arr.push({ created: { $gte: twoYearBefore } });
      and_arr.push({ kind: kind });
      and_arr.push({ author: { $in: userIds } });

      var or_arr = [];
      var key_lower,
        key_upper;
      if (keyword.indexOf(' ') >= 0) {
        keyword.split(' ').forEach(function (value, index) {
          if (value && value !== '') {
            key_lower = value.toLowerCase();
            key_upper = value.toUpperCase();
            or_arr = [
              { search: { $regex: '.*' + value + '.*' } },
              { search: { $regex: '.*' + key_lower + '.*' } },
              { search: { $regex: '.*' + key_upper + '.*' } }
            ];
            and_arr.push({ $or: or_arr });
          }
        });
      } else if (keyword.indexOf('　') >= 0) {
        keyword.split('　').forEach(function (value, index) {
          if (value && value !== '') {
            key_lower = value.toLowerCase();
            key_upper = value.toUpperCase();
            or_arr = [
              { search: { $regex: '.*' + value + '.*' } },
              { search: { $regex: '.*' + key_lower + '.*' } },
              { search: { $regex: '.*' + key_upper + '.*' } }
            ];
            and_arr.push({ $or: or_arr });
          }
        });
      } else {
        key_lower = keyword.toLowerCase();
        key_upper = keyword.toUpperCase();
        or_arr = [
          { search: { $regex: '.*' + keyword + '.*' } },
          { search: { $regex: '.*' + key_lower + '.*' } },
          { search: { $regex: '.*' + key_upper + '.*' } }
        ];
        and_arr.push({ $or: or_arr });
      }

      if (and_arr.length > 0) {
        query = { $and: and_arr };
      }

      Report.paginate(query, {
        select: 'created number supplier pdf start',
        sort: sort,
        page: page,
        limit: limit
      }).then(result => {
        resolve(result);
      },
      err => {
        reject(err);
      }
      );
    });
  }
};

exports.create = function (req, res) {
  req.checkBody('userId', 'サーバーエラーが発生しました。').notEmpty();
  req.checkBody('data', 'データーを入力してください。').notEmpty();
  req.checkBody('data.kind', '報告書種類を入力してください。').notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(help.getMessage(errors));
  }
  var userId = req.body.userId;

  User.findById(userId).exec((err, user) => {
    if (err) {
      logger.error(err);
      return res
        .status(422)
        .send({ message: 'サーバーエラーが発生しました。' });
    }
    if (!user) {
      return res
        .status(422)
        .send({ message: 'このデータは無効または削除されています。' });
    }
    if (user.roles[0] === 'partner' ||
      user.roles[0] === 'user' ||
      user.roles[0] === 'dispatcher' ||
      user.roles[0] === 'employee') {
      var unit;
      var report = new Report(req.body.data);

      checkUnit(report)
        .then(function (_unit) {
          unit = _unit;
          if (report.signature) {
            var signature_path = config.uploads.reports.signature.dest;
            return createImage(signature_path, report.signature);
          } else {
            return Promise.resolve('');
          }
        })
        .then(function (signature) {
          report.signature = signature;

          if (report.drawings && report.drawings.length > 0) {
            var drawings_path = config.uploads.reports.drawings.dest;
            var promises = [];
            report.drawings.forEach(draw => {
              promises.push(createImage(drawings_path, draw));
            });
            return Promise.all(promises);
          } else {
            return Promise.resolve([]);
          }
        })
        .then(function (drawings) {
          report.drawings = drawings;
          return findPartner(user);
        })
        .then(function (partner) {
          return createReport(report, user, unit, partner);
        })
        .then(function (report) {
          return Report.exportClean(report._id);
        })
        .then(function () {
          return res.end();
        })
        .catch(function (err) {
          logger.error(err);
          return res
            .status(422)
            .send({ message: err.message });
        });
    } else {
      return res.status(422).send({ message: 'アクセス権限が必要。' });
    }
  });
  function createReport(report, user, unit, partner) {
    return new Promise((resolve, reject) => {
      report.author = user._id;
      report.author_name = user.name;
      report.role = user.roles[0];
      report.status = 1;

      report.logs = [{
        author: user._id,
        author_name: user.name,
        action: 1,
        time: Date.now()
      }];

      if (partner) {
        report.partner = partner._id;
        report.partner_id = partner._id;
      }
      if (unit) {
        report.unit = unit;
        report.unit_id = unit._id;
        report.unit_name = unit.name;
      }

      report.save(function (err) {
        if (err) {
          reject(err);
        }
        resolve(report);
      });
    });
  }
  function checkUnit(report) {
    return new Promise((resolve, reject) => {
      if (!report.unit_id) {
        return resolve(null);
      }
      Unit.findById(report.unit_id).exec((err, unit) => {
        if (err) {
          logger.error(err);
          reject({ message: 'サーバーエラーが発生しました。' });
        }
        if (!unit) {
          reject({ message: '提出先が削除されました。インタネット環境でアプリを再起動してください。' });
        }
        resolve(unit);
      });
    });
  }
  function findPartner(user) {
    return new Promise((resolve, reject) => {
      if (!user) {
        reject({ message: 'サーバーエラーが発生しました。' });
      }
      if (user.roles[0] === 'user') {
        Worker.findWorker(user._id)
          .then(function (worker) {
            resolve(worker.partner);
          })
          .catch(function (err) {
            reject(err);
          });
      } else {
        resolve(null);
      }
    });
  }
  function createImage(path, input) {
    return new Promise((resolve, reject) => {
      if (input) {
        var data = input.replace(/^data:image\/\w+;base64,/, '');
        var name = crypto.randomBytes(16).toString('hex');
        var fileName = path + name + '.jpg';

        fs.writeFile(fileName, data, { encoding: 'base64' }, function (err) {
          if (err) {
            logger.error(err);
            reject({ message: 'ファイルのアップロードに失敗しました。' });
          } else {
            fileName = fileName.substr(1);
            resolve(fileName);
          }
        });
      } else {
        resolve('');
      }
    });
  }
};

