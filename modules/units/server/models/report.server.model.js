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
  no: { type: Number },
  pdf: { type: String },
  kind: { type: Number },
  name: { type: String, trim: true, require: true },
  description: { type: String, default: '', require: true },
  account: { type: Schema.ObjectId, ref: 'User' },
  partner: { type: Schema.ObjectId, ref: 'Partner' },
  created: { type: Date, default: Date.now }
});
ReportSchema.plugin(paginate);

ReportSchema.statics.common = function () {
  return new Promise(function (resolve, reject) {
    return resolve(true);
  });
};
mongoose.model('Report', ReportSchema);

