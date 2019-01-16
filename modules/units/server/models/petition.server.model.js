'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate-v2'),
  Schema = mongoose.Schema;

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
  // 申請種類（1: Create - 2: Delete）
  action: { type: Number },
  // Khi (2: Delete) thì cần gửi ID worker
  workerId: { type: Schema.ObjectId, ref: 'Worker' },
  partner_name: { type: String, default: '' },
  partner: { type: Schema.ObjectId, ref: 'Partner' },
  created: { type: Date, default: Date.now }
});
PetitionSchema.plugin(paginate);

mongoose.model('Petition', PetitionSchema);

