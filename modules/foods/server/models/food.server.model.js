'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  path = require('path'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

/**
 * Food Schema
 */
var FoodSchema = new Schema({
  foodname: { type: String, trim: true, require: true, maxlength: 12 },
  description: { type: String, default: '', require: true, maxlength: 50 },
  created: { type: Date, default: Date.now }
});
FoodSchema.plugin(paginate);
FoodSchema.pre('save', function (next) {
  if (this.password && this.isModified('password')) {
    // edit
  }
  next();
});

FoodSchema.statics.common = function () {
  return new Promise(function (resolve, reject) {
    return resolve(true);
  });
};
mongoose.model('Food', FoodSchema);

