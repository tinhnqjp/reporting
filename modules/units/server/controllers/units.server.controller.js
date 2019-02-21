'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Unit = mongoose.model('Unit'),
  path = require('path'),
  moment = require('moment-timezone'),
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

exports.importdata = function (req, res) {
  var arr = [
    '1部1課',
    '2部3課',
    '2部1課',
    '2部2課',
    '3部1課',
    '3部2課',
    '杉並CK',
    '多摩CK',
    '横浜CK',
    '品川CK',
    '三郷CK',
    '栃木CK',
    '杉並CS1',
    '多摩CS1',
    '横浜CS1',
    '三郷CS2',
    '多摩CS2',
    '中関東CK',
    'EM課',
    '営業推進課',
    '技術推進課',
    '住環境開発課',
    '経営管理課',
    '経営管理部',
    '人事部',
    '大阪営業',
    '大阪営業推進',
    '名古屋営業',
    '大阪CK',
    '大阪CS1',
    '大阪CS2',
    '西日本EM',
    '大阪技術推進',
    '名古屋CK',
    '名古屋CS1',
    '名古屋CS2',
    '福岡TC',
    'ｱﾙﾊﾞｲﾄ'
  ];

  var promises = [];
  arr.forEach(item => {
    var unit = new Unit({ name: item });
    promises.push(saveSchema(unit));
  });

  Promise.all(promises)
    .then(function (result) {
      return res.json({
        message: 'OK'
      });
    });

  function saveSchema(doc) {
    return new Promise(function (resolve, reject) {
      doc.save(function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(doc);
        }
      });
    });
  }
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
