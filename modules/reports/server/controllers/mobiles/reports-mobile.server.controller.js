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
  master_data = require(path.resolve('./config/lib/master-data')),
  help = require(path.resolve(
    './modules/core/server/controllers/help.server.controller'
  )),
  logger = require(path.resolve(
    './modules/core/server/controllers/logger.server.controller'
  )),
  exportUtil = require(path.resolve('./modules/reports/server/utils/exports.server.util')),
  imageUtil = require(path.resolve('./modules/reports/server/utils/images.server.util'));
var CONFIG = master_data.config;

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
      return getUserIds(user);
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

  function getUserIds(user) {
    return new Promise((resolve, reject) => {
      if (user.roles[0] === 'partner') {
        Partner.findOne({ account: userId })
          .select('workers')
          .exec((err, partner) => {
            if (err) return reject({ status: 422, message: 'サーバーエラーが発生しました。' });
            var userIds = [userId].concat(partner.workers);
            return resolve(userIds);
          });
      } else {
        return resolve([userId]);
      }
    });
  }
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
  console.log('TCL: exports.create -> errors', errors);
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
      var data = req.body.data;
      var report = new Report(data);
      // console.log('TCL: exports.create -> report', report.picture);

      switch (report.kind) {
        case 1:
          report.clean = {
            number_of_internal: data.number_of_internal,
            number_of_external: data.number_of_external,
            number_of_internal_room: data.number_of_internal_room,
            number_of_external_room: data.number_of_external_room,
            internals: data.internals,
            externals: data.externals,
            other_works: data.other_works
          };
          // console.log(report.clean);
          break;
        case 2:
          // var work_kind = _.find(CONFIG.repair_work_kind, { title: data.work_kind });
          // var work_content = work_kind ? work_kind.content : '';
          report.repair = {
            work_kind: data.work_kind,
            internals: data.internals,
            externals: data.externals,
            image1: data.image1,
            image2: data.image2,
            work_content: data.work_content
          };
          break;
        case 3:
          report.construct = {
            work_kind: data.work_kind,
            day: data.day,
            internals: data.internals,
            externals: data.externals,
            summary: data.summary,
            other_note: data.other_note
          };
          break;
        case 4:
          report.picture = {
            store_image: data.store_image,
            machines: data.machines
          };
          break;
      }

      checkUnit(report)
        .then(function (_unit) {
          unit = _unit;

          return imageUtil.signature(report.signature);
        })
        .then(function (signature) {
          report.signature = signature;
          return imageUtil.drawings(report.drawings);
        })
        .then(function (drawings) {
          report.drawings = drawings;
          return imageUtil.picture_image(report.picture);
        })
        .then(function (picture) {
          if (report.picture) {
            report.picture = picture;
          }
          return imageUtil.repair_image(report.repair);
        })
        .then(function (repair) {
          if (report.repair) {
            report.repair = repair;
          }
          return findPartner(user);
        })
        .then(function (partner) {
          return createReport(report, user, unit, partner);
        })
        .then(function (report) {
          return exportUtil.exportFile(report._id);
        })
        .then(function (url) {
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
      report.created = Date.now();

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
};

