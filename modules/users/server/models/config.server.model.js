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
  unitVersion: { type: String, default: '20180212000000' }
});
mongoose.model('Config', ConfigSchema);
