'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema,
  relationship = require('mongoose-relationship');

/**
 * Worker Schema
 */
var WorkerSchema = new Schema({
  // 社名（氏名）
  name: { type: String, trim: true, require: true },
  // 備考
  description: { type: String, default: '', require: true },
  // 電話番号
  phone: { type: String, trim: true },
  // 担当者
  manager: { type: String, trim: true },
  // アカウント
  account: { type: Schema.ObjectId, ref: 'User' },
  partner: { type: Schema.ObjectId, ref: 'Partner', childPath: 'workers' },
  created: { type: Date, default: Date.now }
});
WorkerSchema.plugin(paginate);
WorkerSchema.plugin(relationship, { relationshipPathName: 'partner' });

// Remove
WorkerSchema.pre('remove', function (next) {
  var User = mongoose.model('User');
  User.remove({ _id: this.account }, next);
});

WorkerSchema.statics.common = function () {
  return new Promise(function (resolve, reject) {
    return resolve(true);
  });
};
mongoose.model('Worker', WorkerSchema);

