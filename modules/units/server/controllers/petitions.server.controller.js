'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Petition = mongoose.model('Petition'),
  User = mongoose.model('User'),
  path = require('path'),
  moment = require('moment'),
  _ = require('lodash'),
  logger = require(path.resolve('./modules/core/server/controllers/logger.server.controller')),
  help = require(path.resolve('./modules/core/server/controllers/help.server.controller'));

exports.create = function (req, res) {
  var petition = new Petition(req.body);
  petition.save(function (err) {
    if (err) {
      logger.error(err);
      return res.status(422).send({ message: '申請を登録できません。' });
    }
    return res.json(petition);
  });
};

exports.read = function (req, res) {
  res.json(req.model);
};

exports.delete = function (req, res) {
  var petition = req.model;
  petition.remove(function (err) {
    if (err) {
      logger.error(err);
      return res.status(400).send({ message: '申請を削除できません。' });
    }
    return res.json(petition);
  });
};


exports.paging = function (req, res) {
  var condition = req.body.condition || {};
  var page = condition.page || 1;
  var query = getQuery(condition);
  var sort = help.getSort(condition);
  var limit = help.getLimit(condition);

  Petition.paginate(query, {
    sort: sort,
    page: page,
    limit: limit,
    populate: [
      { path: 'partner', select: 'name' }
    ]
  }).then(function (result) {
    return res.json(result);
  }, err => {
    logger.error(err);
    return res.status(400).send({ message: 'サーバーでエラーが発生しました。' });
  });
};

exports.petitionByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: '申請が見つかりません。'
    });
  }

  Petition
    .findById(id)
    .populate('partner', 'name')
    .exec(function (err, petition) {
      if (err) {
        return next(err);
      } else if (!petition) {
        return next(new Error('申請が見つかりません。'));
      }

      req.model = petition;
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
      { description: { $regex: '.*' + key_upper + '.*' } },
      { phone: { $regex: '.*' + condition.keyword + '.*' } },
      { phone: { $regex: '.*' + key_lower + '.*' } },
      { phone: { $regex: '.*' + key_upper + '.*' } },
      { manager: { $regex: '.*' + condition.keyword + '.*' } },
      { manager: { $regex: '.*' + key_lower + '.*' } },
      { manager: { $regex: '.*' + key_upper + '.*' } }
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
