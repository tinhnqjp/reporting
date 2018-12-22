'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Worker = mongoose.model('Worker'),
  path = require('path'),
  moment = require('moment'),
  _ = require('lodash'),
  logger = require(path.resolve('./modules/core/server/controllers/logger.server.controller')),
  help = require(path.resolve('./modules/core/server/controllers/help.server.controller'));


exports.create = function (req, res) {
  var worker = new Worker(req.body);
  worker.save(function (err) {
    if (err) {
      logger.error(err);
      return res.status(422).send({
        message: 'サーバーエラーが発生しました。'
      });
    } else {
      res.json(worker);
    }
  });
};

exports.read = function (req, res) {
  res.json(req.model);
};

exports.update = function (req, res) {
  var worker = req.model;
  worker = _.extend(worker, req.body);
  worker.save(function (err) {
    if (err)
      return res.status(422).send({ message: 'アカウントを変更できません！' });
    res.json(worker);
  });
};

exports.delete = function (req, res) {
  var worker = req.model;
  worker.remove(function (err) {
    if (err)
      return res.status(400).send({ message: 'アカウントを削除できません！' });
    res.json(worker);
  });
};

exports.list = function (req, res) {
  var condition = req.body.condition || {};
  var page = condition.page || 1;
  var query = getQuery(condition);
  var sort = help.getSort(condition);
  var limit = help.getLimit(condition);

  Worker.paginate(query, {
    sort: sort,
    page: page,
    limit: limit,
    populate: [
      { path: 'account', select: 'username' }
    ]
  }).then(function (result) {
    return res.json(result);
  }, err => {
    console.log('​exports.list -> err', err);
    return res.status(400).send({ message: 'サーバーでエラーが発生しました！' });
  });
};

exports.workerByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'アカウントが見つかりません。'
    });
  }

  Worker
    .findById(id)
    .populate('account', 'username')
    .exec(function (err, worker) {
      if (err) {
        return next(err);
      } else if (!worker) {
        return next(new Error('Failed to load worker ' + id));
      }

      req.model = worker;
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
      { name: { $regex: '.*' + condition.keyword + '.*' } },
      { name: { $regex: '.*' + key_lower + '.*' } },
      { name: { $regex: '.*' + key_upper + '.*' } },
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
  if (condition.notIds) {
    and_arr.push({ _id: { $nin: condition.notIds } });
  }

  if (and_arr.length > 0) {
    query = { $and: and_arr };
  }

  return query;
}
