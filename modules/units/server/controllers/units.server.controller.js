'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Unit = mongoose.model('Unit'),
  path = require('path'),
  moment = require('moment'),
  _ = require('lodash'),
  logger = require(path.resolve('./modules/core/server/controllers/logger.server.controller')),
  help = require(path.resolve('./modules/core/server/controllers/help.server.controller'));

exports.create = function (req, res) {
  var unit = new Unit(req.body);
  unit.save(function (err) {
    if (err) {
      logger.error(err);
      return res.status(422).send({ message: '部署を登録できません。' });
    }
    return res.json(unit);
  });
};

exports.read = function (req, res) {
  res.json(req.model);
};

exports.update = function (req, res) {
  var unit = req.model;
  unit = _.extend(unit, req.body);
  unit.save(function (err) {
    if (err) {
      logger.error(err);
      return res.status(422).send({ message: '部署を変更できません。' });
    }
    res.json(unit);
  });
};

exports.delete = function (req, res) {
  var unit = req.model;
  unit.remove(function (err) {
    if (err) {
      logger.error(err);
      return res.status(400).send({ message: '部署を削除できません。' });
    }
    res.json(unit);
  });
};

exports.list = function (req, res) {
  Unit.find().sort('-created').exec(function (err, result) {
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

  Unit.paginate(query, {
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

exports.unitByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: '部署が見つかりません。'
    });
  }

  Unit.findById(id).exec(function (err, unit) {
    if (err) {
      logger.error(err);
      return next(err);
    } else if (!unit) {
      return next(new Error('部署が見つかりません。'));
    }

    req.model = unit;
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
    and_arr.push({ created: { '$lte': condition.created_max } });
  }
  if (and_arr.length > 0) {
    query = { $and: and_arr };
  }

  return query;
}
