'use strict';

var _ = require('lodash'),
  path = require('path'),
  config = require(path.resolve('./config/config')),
  fs = require('fs');

exports.excute = function () {
  clear_export();
};

function clear_export() {
  var folder = config.uploads.users.excel.export;
  fs.readdir(folder, function (err, files) {
    if (err || files.length === 0)
      return;
    _.forEach(files, function (file) {
      var filePath = folder + file + '/';
      fs.stat(filePath, function (err, stats) {
        if (stats.isFile()) {
          fs.unlink(filePath, function (err) {
            if (err) {
              console.log(err.toString());
            }
          });
        }
      });
    });
  });
}
