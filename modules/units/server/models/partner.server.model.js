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
  dispatcher: [{ type: Schema.ObjectId, ref: 'Dispatchers' }],
  workers: [{ type: Schema.ObjectId, ref: 'Worker' }],
  created: { type: Date, default: Date.now }
});
PartnerSchema.plugin(paginate);

PartnerSchema.pre('save', function (next) {
  var self = this;
  if (self.isNew) {
    var User = mongoose.model('User');
    User.generateAccount('partner')
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

// Remove
PartnerSchema.pre('remove', function (next) {
  var User = mongoose.model('User');
  User.remove({ _id: this.account }, next);
});

PartnerSchema.statics.common = function () {
  return new Promise(function (resolve, reject) {
    return resolve(true);
  });
};
mongoose.model('Partner', PartnerSchema);

