'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  path = require('path'),
  paginate = require('mongoose-paginate-v2'),
  config = require(path.resolve('./config/config')),
  Schema = mongoose.Schema,
  crypto = require('crypto'),
  chalk = require('chalk');

/**
 * User Schema
 */
var UserSchema = new Schema({
  // 氏名
  name: { type: String, default: '', require: true, maxlength: 50 },
  // ログインID
  username: { type: String, trim: true, require: true },
  // パスワード
  password: { type: String, default: '' },
  // 役割
  // 社員の役割
  // システム管理者 S = admin
  // オペレーター A = operator
  // 営業者 A- = bsoperator (Business operator)
  // 手配者 B = dispatcher
  // 一般社員 B- = employee
  // 社外のアカウント
  // 協力業者 C = partner
  // 下請け D = user
  roles: {
    type: [{
      type: String,
      enum: ['user', 'partner', 'operator', 'bsoperator', 'dispatcher', 'employee', 'admin']
    }],
    default: ['user'],
    required: true
  },
  unit: { type: Schema.ObjectId, ref: 'Unit' },
  // 有効期限
  expire: { type: Date },
  deleted: { type: Boolean, default: false },
  // System info
  last_login: { type: Date },
  updated: { type: Date },
  created: { type: Date, default: Date.now },
  salt: { type: String }
});
UserSchema.plugin(paginate);
UserSchema.pre('save', function (next) {
  var doc = this;
  if (this.password && this.isModified('password')) {
    this.salt = crypto.randomBytes(16).toString('base64');
    this.password = this.hashPassword(this.password);
  }
  if (doc.last_login && doc.isModified('last_login')) {
    if (doc.roles && doc.roles[0] === 'user') {
      var Worker = mongoose.model('Worker');
      Worker.findOne({ account: doc._id, deleted: false })
        .exec((err, worker) => {
          if (err) {
            next(err);
          }
          if (!worker) {
            next({ message: '下請けが削除されました。インタネット環境でアプリを再起動してください。' });
          }
          worker.last_login = doc.last_login;
          worker.save(function (err) {
            if (err) next(err);
            next();
          });
        });
    } else if (doc.roles && doc.roles[0] === 'partner') {
      var Partner = mongoose.model('Partner');
      Partner.findOne({ account: doc._id, deleted: false })
        .exec((err, partner) => {
          if (err) {
            next(err);
          }
          if (!partner) {
            next({ message: '協力業者が削除されました。インタネット環境でアプリを再起動してください。' });
          }
          partner.last_login = doc.last_login;
          partner.save(function (err) {
            if (err) next(err);
            next();
          });
        });
    }
  }
  next();
});

UserSchema.methods.hashPassword = function (password) {
  if (this.salt && password) {
    return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64, 'SHA1').toString('base64');
  } else {
    return password;
  }
};

UserSchema.methods.authenticate = function (password) {
  return this.password === this.hashPassword(password);
};

UserSchema.statics.generateRandomPassphrase = function () {
  return new Promise(function (resolve, reject) {
    var password = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 8; i++) {
      password += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return resolve(password);
  });
};
UserSchema.statics.uniqueUserName = function (username, id) {
  return new Promise(function (resolve, reject) {
    var User = mongoose.model('User');
    var query = { username: username, deleted: false };
    if (id) {
      query._id = { '$ne': id };
    }

    User.findOne(query).exec(function (err, user) {
      if (err) return reject(err);
      if (!user) return resolve(false);
      if (user) return resolve(true);
    });
  });
};

UserSchema.statics.generateAccount = function (roles) {
  return new Promise(function (resolve, reject) {
    var User = mongoose.model('User');
    var username = '';
    User.generateRandomPassphrase()
      .then((passphrase) => {
        username = passphrase;
        return User.uniqueUserName(username);
      })
      .then((unique) => {
        if (unique) {
          reject({ message: 'IDが既存しますのでアカウントを登録できません。' });
        } else {
          var user = new User();
          user.username = username;
          user.password = username;
          user.roles = roles;
          user.save(function (err) {
            if (err) reject(err);
            resolve(user);
          });
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

UserSchema.statics.createAccount = function (roles, username, password, name, expire) {
  return new Promise(function (resolve, reject) {
    var User = mongoose.model('User');
    User.uniqueUserName(username)
      .then((unique) => {
        if (unique) {
          reject({ message: 'IDが既存しますのでアカウントを登録できません。' });
        } else {
          var user = new User();
          user.username = username;
          user.password = password;
          user.roles = roles;
          user.name = name;
          user.expire = expire;
          user.save(function (err) {
            if (err) reject(err);
            resolve(user);
          });
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

UserSchema.statics.updateAccount = function (userId, roles, username, password, name, expire) {
  return new Promise(function (resolve, reject) {
    var User = mongoose.model('User');
    User.uniqueUserName(username, userId)
      .then((unique) => {
        if (unique) {
          reject({ message: 'IDが既存しますのでアカウントを変更できません。' });
        } else {
          User.findById(userId).exec(function (err, user) {
            user.username = username;
            if (password) {
              user.password = password;
            }
            if (roles) {
              user.roles = roles;
            }
            user.name = name;
            user.expire = expire;
            user.save(function (err) {
              if (err) reject(err);
              resolve(user);
            });
          });
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

UserSchema.statics.removeAccount = function (userId) {
  return new Promise(function (resolve, reject) {
    var User = mongoose.model('User');
    User.findById(userId).exec(function (err, user) {
      user.remove(function (err) {
        if (err) reject(err);
        resolve(user);
      });
    });
  });
};

UserSchema.statics.seed = seed;
mongoose.model('User', UserSchema);

/**
* Seeds the User collection with document (User)
* and provided options.
*/
function seed(doc, options) {
  var User = mongoose.model('User');

  return new Promise(function (resolve, reject) {

    skipDocument()
      .then(add)
      .then(function (response) {
        return resolve(response);
      })
      .catch(function (err) {
        return reject(err);
      });

    function skipDocument() {
      return new Promise(function (resolve, reject) {
        User.findOne({ username: doc.username }).exec(function (err, user) {
          if (err) return reject(err);
          if (!user) return resolve(false);
          if (user && !options.overwrite) return resolve(true);

          // Remove User (overwrite)
          user.remove(function (err) {
            if (err) return reject(err);
            return resolve(false);
          });
        });
      });
    }

    function add(skip) {
      return new Promise(function (resolve, reject) {
        if (skip)
          return resolve({ message: chalk.yellow('アカウント情報作成: User\t\t' + doc.username + ' skipped') });

        User.generateRandomPassphrase()
          .then(function (passphrase) {
            var user = new User(doc);
            user.password = passphrase;
            user.save(function (err) {
              if (err) return reject(err);
              return resolve({ message: 'ログインID： ' + user.username + ' ・パスワード： ' + passphrase });
            });
          })
          .catch(function (err) { return reject(err); });
      });
    }

  });
}
