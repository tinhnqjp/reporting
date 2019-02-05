'use strict';

/**
 * Module dependencies
 */
var sharp = require('sharp'),
  path = require('path'),
  moment = require('moment-timezone'),
  mongoose = require('mongoose'),
  config = require(path.resolve('./config/config')),
  fs = require('fs');

function createThumb(imgConfig, fileName, image, hasThumb) {
  return new Promise(function (resolve, reject) {
    // rename
    var imageUrl = imgConfig.dest + fileName;
    if (hasThumb) {
      // thumb
      var height = 100;
      if (fs.existsSync(imageUrl)) {
        var image = sharp(imageUrl);
        var thumbFile = imgConfig.thumbs + fileName;

        var opaque = { r: 255, g: 255, b: 255, alpha: 0 };
        image
          .metadata()
          .then(function () {
            return image
              .flatten()
              .embed()
              .background(opaque)
              .resize(null, height)
              .jpeg({
                quality: 100
              })
              .toFile(thumbFile);
          })
          .then(function () {
            resolve({ thumb: thumbFile.substr(1), image: imageUrl.substr(1) });
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        return reject({ message: 'ファイルのアップロードに失敗しました。' });
      }
    } else {
      resolve({ thumb: '', image: imageUrl.substr(1) });
    }
  });
}

exports.thumb = function (imgConfig, file, exceptThumb) {
  return new Promise(function (resolve, reject) {
    var hasThumb = true;
    if (exceptThumb) {
      hasThumb = false;
    }
    createThumb(imgConfig, file, hasThumb)
      .then(function (file) {
        resolve(file);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

