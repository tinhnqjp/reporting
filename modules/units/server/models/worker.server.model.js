'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate-v2'),
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
  password: { type: String, trim: true },
  petition: { type: Schema.ObjectId, ref: 'Petition' },
  partner: { type: Schema.ObjectId, ref: 'Partner', childPath: 'workers' },
  deleted: { type: Boolean, default: false },
  last_login: { type: Date },
  created: { type: Date, default: Date.now }
});
WorkerSchema.plugin(paginate);
WorkerSchema.plugin(relationship, { relationshipPathName: 'partner' });

// Remove
WorkerSchema.pre('remove', function (next) {
  var User = mongoose.model('User');
  User.remove({ _id: this.account }, next);
});

WorkerSchema.statics.findWorker = function (user_id) {
  return new Promise(function (resolve, reject) {
    var Worker = mongoose.model('Worker');
    Worker.findOne({ account: user_id, deleted: false })
      .populate('partner', 'name')
      .exec((err, worker) => {
        if (err) {
          reject(err);
        }
        if (!worker) {
          reject({ message: '下請けが削除されました。インタネット環境でアプリを再起動してください。' });
        }

        resolve(worker);
      });
  });
};
mongoose.model('Worker', WorkerSchema);

