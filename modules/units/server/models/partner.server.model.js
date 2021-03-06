'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate-v2'),
  Schema = mongoose.Schema;

/**
 * Partner Schema
 */
var PartnerSchema = new Schema({
  // 社名（氏名）
  name: { type: String, trim: true, require: true },
  // 備考
  description: { type: String, default: '', require: true },
  // 電話番号
  phone: { type: String, trim: true },
  account: { type: Schema.ObjectId, ref: 'User' },
  password: { type: String, trim: true },
  workers: [{ type: Schema.ObjectId, ref: 'Worker' }],
  deleted: { type: Boolean, default: false },
  last_login: { type: Date },
  created: { type: Date, default: Date.now }
});
PartnerSchema.plugin(paginate);

// Remove
PartnerSchema.pre('remove', function (next) {
  var User = mongoose.model('User');
  User.remove({ _id: this.account }, next);
});

PartnerSchema.statics.common = function () {
  return new Promise(function (resolve, reject) {
    return resolve(true);
  });
};
mongoose.model('Partner', PartnerSchema);

