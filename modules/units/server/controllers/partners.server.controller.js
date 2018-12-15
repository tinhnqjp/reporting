'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Partner = mongoose.model('Partner'),
  path = require('path'),
  moment = require('moment'),
  _ = require('lodash'),
  help = require(path.resolve('./modules/core/server/controllers/help.server.controller'));


exports.create = function (req, res) {
  var partner = new Partner(req.body);
  Partner.findOne({ name: req.body.name }).exec((err, _partner) => {
    if (_partner)
      return res.status(422).send({ message: 'IDが既存しますのでアカウントを登録できません！' });
    partner.save(function (err) {
      if (err)
        return res.status(422).send({ message: 'アカウントを登録できません！' });
      return res.json(partner);
    });
  });
};

exports.read = function (req, res) {
  res.json(req.model);
};

exports.update = function (req, res) {
  var partner = req.model;
  partner = _.extend(partner, req.body);
  partner.save(function (err) {
    if (err)
      return res.status(422).send({ message: 'アカウントを変更できません！' });
    res.json(partner);
  });
};

exports.delete = function (req, res) {
  var partner = req.model;
  partner.remove(function (err) {
    if (err)
      return res.status(400).send({ message: 'アカウントを削除できません！' });
    res.json(partner);
  });
};

exports.list = function (req, res) {
  var condition = req.body.condition || {};
  var page = condition.page || 1;
  var query = getQuery(condition);
  var sort = help.getSort(condition);
  var limit = help.getLimit(condition);

  Partner.paginate(query, {
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

exports.partnerByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'アカウントが見つかりません。'
    });
  }

  Partner
    .findById(id)
    .populate('account', 'username')
    .exec(function (err, partner) {
      if (err) {
        return next(err);
      } else if (!partner) {
        return next(new Error('Failed to load partner ' + id));
      }

      req.model = partner;
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

  if (and_arr.length > 0) {
    query = { $and: and_arr };
  }

  return query;
}
