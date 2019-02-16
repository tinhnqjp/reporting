'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate-v2'),
  moment = require('moment-timezone'),
  Schema = mongoose.Schema;

/**
 * Unit Schema
 */
var UnitSchema = new Schema({
  name: { type: String, trim: true, require: true },
  description: { type: String, default: '', require: true },
  created: { type: Date, default: Date.now }
});
UnitSchema.plugin(paginate);

UnitSchema.statics.common = function () {
  return new Promise(function (resolve, reject) {
    return resolve(true);
  });
};

UnitSchema.pre('save', function (next) {
  updateConfig()
    .then(function () {
      next();
    })
    .catch(err => {
      next(err);
    });
});
UnitSchema.pre('remove', function (next) {
  updateConfig()
    .then(function () {
      next();
    })
    .catch(err => {
      next(err);
    });
});

mongoose.model('Unit', UnitSchema);

function updateConfig() {
  return new Promise((resolve, reject) => {
    var Config = mongoose.model('Config');
    Config.findOne().exec((err, conf) => {
      if (err) {
        reject(err);
      } else {
        if (!conf) {
          conf = new Config();
        }
        conf.unitVersion = moment().format('YYYYMMDDHHmmss');
        conf.save(function (err) {
          if (err) reject(err);
          resolve();
        });
      }
    });
  });
}
