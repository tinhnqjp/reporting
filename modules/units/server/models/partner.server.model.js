'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate-v2'),
  Schema = mongoose.Schema;

/**
 * Partner Schema
 */
var PartnerSchema = new Schema({
  // 社名（氏名）
  name: { type: String, trim: true, require: true },
  // 備考
  description: { type: String, default: '', require: true },
  // 電話番号
  phone: { type: String, trim: true },
  account: { type: Schema.ObjectId, ref: 'User' },
<<<<<<< HEAD
  dispatcher: [{ type: Schema.ObjectId, ref: 'Dispatchers' }],
=======
>>>>>>> ec5acda89d5313e5687648dcfb8f39e6a5993e75
  workers: [{ type: Schema.ObjectId, ref: 'Worker' }],
  deleted: { type: Boolean, default: false },
  created: { type: Date, default: Date.now }
});
PartnerSchema.plugin(paginate);

<<<<<<< HEAD
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

=======
>>>>>>> ec5acda89d5313e5687648dcfb8f39e6a5993e75
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

