'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Partner = mongoose.model('Partner'),
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

  User.findOne({ username: username }).exec((err, user) => {
    if (err) {
      logger.error(err);
      return res.status(422).send({ message: '協力者を登録できません。' });
    }
    if (user)
      return res.status(422).send({ message: 'IDが既存しますので協力者を登録できません。' });

    User.createAccount('partner', username, password)
      .then((user) => {
        partner.account = user;
        partner.save(function (err) {
          if (err) {
            logger.error(err);
            return res.status(422).send({ message: '協力者を登録できません。' });
          }
          return res.json(partner);
        });
      })
      .catch((err) => {
        logger.error(err);
        return res.status(422).send({ message: '協力者を登録できません。' });
      });
  });
};

exports.read = function (req, res) {
  res.json(req.model);
};

exports.update = function (req, res) {
  var username = getUserName(req, res);
  var partner = req.model;

  User.findOne({ username: username, _id: { '$ne': partner.account._id } }).exec((err, user) => {
    if (err) {
      logger.error(err);
      return res.status(422).send({ message: '協力者を変更できません。' });
    }
    if (user)
      return res.status(422).send({ message: 'IDが既存しますので協力者を変更できません。' });

    partner = _.extend(partner, req.body);
    var password = null;
    if (req.body.account.password) {
      password = req.body.account.password;
    }
    User.updateAccount(partner.account._id, null, username, password)
      .then(() => {
        partner.save(function (err) {
          if (err) {
            logger.error(err);
            return res.status(422).send({ message: '協力者を変更できません。' });
          }
          return res.json(partner);
        });
      })
      .catch((err) => {
        logger.error(err);
        return res.status(422).send({ message: '協力者を変更できません。' });
      });
  });
};

exports.delete = function (req, res) {
  var partner = req.model;
  partner.remove(function (err) {
    if (err) {
      logger.error(err);
      return res.status(400).send({ message: '協力者を削除できません。' });
    }
    return res.json(partner);
  });
};

/**
 * List
 */
exports.list = function (req, res) {
  Partner.find().sort('-created').exec(function (err, partners) {
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
    logger.error(err);
    return res.status(400).send({ message: 'サーバーでエラーが発生しました。' });
  });
};

exports.partnerByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: '協力者が見つかりません。'
    });
  }

  Partner
    .findById(id)
    .populate('account', 'username')
    .exec(function (err, partner) {
      if (err) {
        logger.error(err);
        return next(err);
      } else if (!partner) {
        return next(new Error('協力者が見つかりません。'));
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
      { description: { $regex: '.*' + key_upper + '.*' } },
      { phone: { $regex: '.*' + condition.keyword + '.*' } },
      { phone: { $regex: '.*' + key_lower + '.*' } },
      { phone: { $regex: '.*' + key_upper + '.*' } }
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
