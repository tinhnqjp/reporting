'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

/**
 * Report Schema
 */
var ReportSchema = new Schema({
  no: { type: String, default: '' },
  kind: { type: Number, default: '' },
  logs: [{
    author: { type: Schema.ObjectId, ref: 'User' },
    action: { type: Number },
    time: { type: Date }
  }],
  author: { type: Schema.ObjectId, ref: 'User' },
  author_name: { type: String, default: '' },
  unit: { type: Schema.ObjectId, ref: 'Unit' },
  unit_name: { type: String, default: '' },
  

  // 氏名
  name: { type: String, default: '', require: true, maxlength: 50 },
  // 社名
  company: { type: String, default: '', require: true },
  // ユーザーID
  username: { type: String, trim: true, unique: true, require: true, maxlength: 12 },
  // パスワード
  password: { type: String, default: '' },
  // 役割
  // user = worker, partner, dispatcher, admin = account
  // System info
  updated: { type: Date },
  created: { type: Date, default: Date.now },
  salt: { type: String }
});
ReportSchema.plugin(paginate);
mongoose.model('Report', ReportSchema);
