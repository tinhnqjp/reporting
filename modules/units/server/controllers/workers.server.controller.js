'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Worker = mongoose.model('Worker'),
  Petition = mongoose.model('Petition'),
  User = mongoose.model('User'),
  path = require('path'),
  moment = require('moment'),
  _ = require('lodash'),
  logger = require(path.resolve('./modules/core/server/controllers/logger.server.controller')),
  help = require(path.resolve('./modules/core/server/controllers/help.server.controller'));


exports.create = function (req, res) {
  var username = getUserName(req, res);
  var password = getPass(req, res);
  var worker = new Worker(req.body);

  User.findOne({ username: username, deleted: false }).exec((err, user) => {
    if (err) {
      logger.error(err);
      return res.status(422).send({ message: '下請けを登録できません。' });
    }
    if (user)
      return res.status(422).send({ message: 'IDが既存しますので下請けを登録できません。' });

    User.createAccount('user', username, password)
      .then((user) => {
        worker.account = user;
        if (worker.petition) {
          return Petition.findByIdAndRemove(worker.petition).exec();
        }
        return Promise.resolve({});
      })
      .then(() => {
        worker.save(function (err) {
          if (err) {
            logger.error(err);
            return res.status(422).send({ message: '下請けを登録できません。' });
          }
          return res.json(worker);
        });
      })
      .catch((err) => {
        logger.error(err);
        return res.status(422).send({ message: '下請けを登録できません。' });
      });
  });
};

exports.read = function (req, res) {
  res.json(req.model);
};

exports.update = function (req, res) {
  var username = getUserName(req, res);
  var worker = req.model;

  User.findOne({ username: username, deleted: false, _id: { '$ne': worker.account._id } }).exec((err, user) => {
    if (err) {
      logger.error(err);
      return res.status(422).send({ message: '下請けを変更できません。' });
    }
    if (user)
      return res.status(422).send({ message: 'IDが既存しますので下請けを変更できません。' });

    worker = _.extend(worker, req.body);
    var password = null;
    if (req.body.account.password) {
      password = req.body.account.password;
    }
    User.updateAccount(worker.account._id, null, username, password)
      .then(() => {
        worker.save(function (err) {
          if (err) {
            logger.error(err);
            return res.status(422).send({ message: '下請けを変更できません。' });
          }
          return res.json(worker);
        });
      })
      .catch((err) => {
        logger.error(err);
        return res.status(422).send({ message: '下請けを変更できません。' });
      });
  });
};

exports.delete = function (req, res) {
  var worker = req.model;
  worker.deleted = true;
  worker.save(function (err) {
    if (err) {
      logger.error(err);
      return res.status(400).send({ message: '下請けを削除できません。' });
    }
    User.findByIdAndUpdate(worker.account, { deleted: true }, function (err) {
      if (err) {
        logger.error(err);
        return res.status(400).send({ message: '下請けを削除できません。' });
      }
      return res.json(worker);
    });

  });
};

exports.list = function (req, res) {
  Worker.find({ deleted: false }).sort('-created').exec(function (err, result) {
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

  Worker.paginate(query, {
    sort: sort,
    page: page,
    limit: limit,
    populate: [
      { path: 'account', select: 'username' },
      { path: 'partner', select: 'name' }
    ]
  }).then(function (result) {
    return res.json(result);
  }, err => {
    logger.error(err);
    return res.status(400).send({ message: 'サーバーでエラーが発生しました。' });
  });
};

exports.workerByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: '下請けが見つかりません。'
    });
  }

  Worker
    .findById(id)
    .populate('account', 'username')
    .populate('partner', 'name')
    .exec(function (err, worker) {
      if (err) {
        return next(err);
      } else if (!worker) {
        return next(new Error('下請けが見つかりません。'));
      }

      req.model = worker;
      next();
    });
};

/** ====== PRIVATE ========= */
function getQuery(condition) {
  var query = {};
  var and_arr = [{ deleted: false }];
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
  if (condition.partner) {
    and_arr.push({ partner: condition.partner });
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
