'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

/**
 * Unit Schema
 */
var UnitSchema = new Schema({
  name: { type: String, trim: true, require: true },
  description: { type: String, default: '', require: true },
  operators: [{ type: Schema.ObjectId, ref: 'User' }],
  dispatchers: [{ type: Schema.ObjectId, ref: 'Dispatcher' }],
  created: { type: Date, default: Date.now }
});
UnitSchema.plugin(paginate);
UnitSchema.pre('save', function (next) {
  var unit = this;
  if (this.isNew) {
    var User = mongoose.model('User');
    User.generateAccount('admin')
      .then((user) => {
        unit.operators = user;
        next();
      })
      .catch((err) => {
        next(err);
      });
  } else {
    next();
  }
});

UnitSchema.statics.common = function () {
  return new Promise(function (resolve, reject) {
    return resolve(true);
  });
};
mongoose.model('Unit', UnitSchema);

