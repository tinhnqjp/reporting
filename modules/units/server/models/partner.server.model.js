'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema,
  relationship = require('mongoose-relationship');

/**
 * Partner Schema
 */
var PartnerSchema = new Schema({
  name: { type: String, trim: true, require: true },
  description: { type: String, default: '', require: true },
  account: { type: Schema.ObjectId, ref: 'User' },
  dispatcher: [{ type: Schema.ObjectId, ref: 'Dispatchers', childPath: 'partners' }],
  workers: [{ type: Schema.ObjectId, ref: 'Worker' }],
  created: { type: Date, default: Date.now }
});
PartnerSchema.plugin(paginate);
PartnerSchema.plugin(relationship, { relationshipPathName: 'dispatcher' });

PartnerSchema.statics.common = function () {
  return new Promise(function (resolve, reject) {
    return resolve(true);
  });
};
mongoose.model('Partner', PartnerSchema);

