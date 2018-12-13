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
  name: { type: String, trim: true, require: true },
  description: { type: String, default: '', require: true },
  account: { type: Schema.ObjectId, ref: 'User' },
  partner: { type: Schema.ObjectId, ref: 'Partner', childPath: 'workers' },
  created: { type: Date, default: Date.now }
});
WorkerSchema.plugin(paginate);
WorkerSchema.plugin(relationship, { relationshipPathName: 'partner' });

WorkerSchema.statics.common = function () {
  return new Promise(function (resolve, reject) {
    return resolve(true);
  });
};
mongoose.model('Worker', WorkerSchema);

