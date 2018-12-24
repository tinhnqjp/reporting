'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema,
  relationship = require('mongoose-relationship');

/**
 * Petition Schema
 */
var PetitionSchema = new Schema({
  // 社名（氏名）
  name: { type: String, trim: true, require: true },
  // 電話番号
  phone: { type: String, trim: true },
  // 担当者
  manager: { type: String, trim: true },
  partner: { type: Schema.ObjectId, ref: 'Partner' },
  created: { type: Date, default: Date.now }
});
PetitionSchema.plugin(paginate);

mongoose.model('Petition', PetitionSchema);

