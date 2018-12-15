'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema,
  relationship = require('mongoose-relationship');

/**
 * Dispatcher Schema
 */
var DispatcherSchema = new Schema({
  name: { type: String, trim: true, require: true },
  description: { type: String, default: '', require: true },
  account: { type: Schema.ObjectId, ref: 'User' },
  partners: [{ type: Schema.ObjectId, ref: 'Partner' }],
  created: { type: Date, default: Date.now }
});
DispatcherSchema.plugin(paginate);

DispatcherSchema.pre('save', function (next) {
  var self = this;
  if (self.isNew()) {
    var User = mongoose.model('User');
    User.generateAccount('roles')
      .then((user) => {
        self.account = user._id;
        next();
      }).catch((err) => {
        next(err);
      });
  } else {
    return next();
  }
});

DispatcherSchema.statics.common = function () {
  return new Promise(function (resolve, reject) {
    return resolve(true);
  });
};


mongoose.model('Dispatcher', DispatcherSchema);

