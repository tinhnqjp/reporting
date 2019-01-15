'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Partner = mongoose.model('Partner'),
<<<<<<< HEAD
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
=======
  User = mongoose.model('User'),
  path = require('path'),
  moment = require('moment'),
  _ = require('lodash'),
  logger = require(path.resolve('./modules/core/server/controllers/logger.server.controller')),
  help = require(path.resolve('./modules/core/server/controllers/help.server.controller'));

exports.create = function (req, res) {
  var username = getUserName(req, res);
  var password = getPass(req, res);
  var partner = new Partner(req.body);
  var expire = req.body.account.expire;

  User.findOne({ username: username, deleted: false }).exec((err, user) => {
    if (err) {
      logger.error(err);
      return res.status(422).send({ message: '協力会社を登録できません。' });
    }
    if (user)
      return res.status(422).send({ message: 'IDが既存しますので協力会社を登録できません。' });

    User.createAccount('partner', username, password, partner.name, expire)
      .then((user) => {
        partner.account = user;
        partner.save(function (err) {
          if (err) {
            logger.error(err);
            return res.status(422).send({ message: '協力会社を登録できません。' });
          }
          return res.json(partner);
        });
      })
      .catch((err) => {
        logger.error(err);
        return res.status(422).send({ message: '協力会社を登録できません。' });
      });
>>>>>>> ec5acda89d5313e5687648dcfb8f39e6a5993e75
  });
};

exports.read = function (req, res) {
  res.json(req.model);
};

exports.update = function (req, res) {
<<<<<<< HEAD
  var partner = req.model;
  partner = _.extend(partner, req.body);
  partner.save(function (err) {
    if (err)
      return res.status(422).send({ message: 'アカウントを変更できません！' });
    res.json(partner);
=======
  var username = getUserName(req, res);
  var partner = req.model;

  User.findOne({ username: username, deleted: false, _id: { '$ne': partner.account._id } }).exec((err, user) => {
    if (err) {
      logger.error(err);
      return res.status(422).send({ message: '協力会社を変更できません。' });
    }
    if (user)
      return res.status(422).send({ message: 'IDが既存しますので協力会社を変更できません。' });

    partner = _.extend(partner, req.body);
    var password = null;
    var expire = null;
    if (req.body.account.password) {
      password = req.body.account.password;
    }
    if (req.body.account.expire) {
      expire = req.body.account.expire;
    }
    User.updateAccount(partner.account._id, null, username, password, partner.name, expire)
      .then(() => {
        partner.save(function (err) {
          if (err) {
            logger.error(err);
            return res.status(422).send({ message: '協力会社を変更できません。' });
          }
          return res.json(partner);
        });
      })
      .catch((err) => {
        logger.error(err);
        return res.status(422).send({ message: '協力会社を変更できません。' });
      });
>>>>>>> ec5acda89d5313e5687648dcfb8f39e6a5993e75
  });
};

exports.delete = function (req, res) {
  var partner = req.model;
<<<<<<< HEAD
  partner.remove(function (err) {
    if (err)
      return res.status(400).send({ message: 'アカウントを削除できません！' });
    res.json(partner);
  });
};

exports.list = function (req, res) {
=======
  partner.deleted = true;
  partner.save(function (err) {
    if (err) {
      logger.error(err);
      return res.status(400).send({ message: '協力会社を削除できません。' });
    }
    User.findByIdAndUpdate(partner.account, { deleted: true }, function (err) {
      if (err) {
        logger.error(err);
        return res.status(400).send({ message: '協力会社を削除できません。' });
      }
      return res.json(partner);
    });
  });
};

/**
 * List
 */
exports.list = function (req, res) {
  Partner.find({ deleted: false }).sort('-created').exec(function (err, partners) {
    if (err) {
      logger.error(err);
      return res.status(422).send({
        message: 'サーバーエラーが発生しました。'
      });
    } else {
      res.json(partners);
    }
  });
};

exports.paging = function (req, res) {
>>>>>>> ec5acda89d5313e5687648dcfb8f39e6a5993e75
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
<<<<<<< HEAD
      { path: 'account', select: 'username' }
=======
      { path: 'account', select: 'username expire' }
>>>>>>> ec5acda89d5313e5687648dcfb8f39e6a5993e75
    ]
  }).then(function (result) {
    return res.json(result);
  }, err => {
<<<<<<< HEAD
    console.log('​exports.list -> err', err);
    return res.status(400).send({ message: 'サーバーでエラーが発生しました！' });
=======
    logger.error(err);
    return res.status(400).send({ message: 'サーバーでエラーが発生しました。' });
>>>>>>> ec5acda89d5313e5687648dcfb8f39e6a5993e75
  });
};

exports.partnerByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
<<<<<<< HEAD
      message: 'アカウントが見つかりません。'
=======
      message: '協力会社が見つかりません。'
>>>>>>> ec5acda89d5313e5687648dcfb8f39e6a5993e75
    });
  }

  Partner
    .findById(id)
<<<<<<< HEAD
    .populate('account', 'username')
    .exec(function (err, partner) {
      if (err) {
        return next(err);
      } else if (!partner) {
        return next(new Error('Failed to load partner ' + id));
=======
    .populate('account', 'username expire')
    .exec(function (err, partner) {
      if (err) {
        logger.error(err);
        return next(err);
      } else if (!partner) {
        return next(new Error('協力会社が見つかりません。'));
>>>>>>> ec5acda89d5313e5687648dcfb8f39e6a5993e75
      }

      req.model = partner;
      next();
    });
};

/** ====== PRIVATE ========= */
function getQuery(condition) {
  var query = {};
<<<<<<< HEAD
  var and_arr = [];
=======
  var and_arr = [{ deleted: false }];
>>>>>>> ec5acda89d5313e5687648dcfb8f39e6a5993e75
  if (condition.keyword && condition.keyword !== '') {
    var key_lower = condition.keyword.toLowerCase();
    var key_upper = condition.keyword.toUpperCase();
    var or_arr = [
      { name: { $regex: '.*' + condition.keyword + '.*' } },
      { name: { $regex: '.*' + key_lower + '.*' } },
      { name: { $regex: '.*' + key_upper + '.*' } },
      { description: { $regex: '.*' + condition.keyword + '.*' } },
      { description: { $regex: '.*' + key_lower + '.*' } },
<<<<<<< HEAD
      { description: { $regex: '.*' + key_upper + '.*' } }
=======
      { description: { $regex: '.*' + key_upper + '.*' } },
      { phone: { $regex: '.*' + condition.keyword + '.*' } },
      { phone: { $regex: '.*' + key_lower + '.*' } },
      { phone: { $regex: '.*' + key_upper + '.*' } }
>>>>>>> ec5acda89d5313e5687648dcfb8f39e6a5993e75
    ];
    and_arr.push({ $or: or_arr });
  }
  if (condition.created_min) {
    and_arr.push({ created: { '$gte': condition.created_min } });
  }
  if (condition.created_max) {
<<<<<<< HEAD
    var max = moment(condition.created_max).endOf('day');
    and_arr.push({ created: { '$lte': max } });
=======
    and_arr.push({ created: { '$lte': condition.created_max } });
>>>>>>> ec5acda89d5313e5687648dcfb8f39e6a5993e75
  }

  if (and_arr.length > 0) {
    query = { $and: and_arr };
  }

  return query;
}
<<<<<<< HEAD
=======

function getUserName(req, res) {
  if (req.body.account && req.body.account.username) {
    return req.body.account.username;
  } else {
    return res.status(422).send({ message: 'ユーザーIDを入力してください。' });
  }
}

function getPass(req, res) {
  if (req.body.account && req.body.account.password) {
    return req.body.account.password;
  } else {
    return res.status(422).send({ message: 'パスワードを入力してください。' });
  }
}
>>>>>>> ec5acda89d5313e5687648dcfb8f39e6a5993e75
