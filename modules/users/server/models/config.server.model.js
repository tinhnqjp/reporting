'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Config Schema
 */
var ConfigSchema = new Schema({
  // リクエスト回数
  apiCnt: { type: Number, default: 0 }
});
mongoose.model('Config', ConfigSchema);
