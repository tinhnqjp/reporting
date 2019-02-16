'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  path = require('path'),
  fs = require('fs'),
  crypto = require('crypto'),
  _ = require('lodash'),
  config = require(path.resolve('./config/config'));


exports.signature = function (signature) {
  return new Promise((resolve, reject) => {
    if (signature) {
      var signature_path = config.uploads.reports.signature.dest;
      createImage(signature_path, signature)
        .then(function (fileName) {
          return resolve(fileName);
        })
        .catch(function (err) {
          return reject(err);
        });
    } else {
      return resolve('');
    }
  });
};
exports.drawings = function (drawings) {
  return new Promise((resolve, reject) => {
    if (drawings && drawings.length > 0) {
      var drawings_path = config.uploads.reports.drawings.dest;
      var promises = [];
      drawings.forEach(draw => {
        promises.push(createImage(drawings_path, draw));
      });
      Promise.all(promises)
        .then(function (fileName) {
          return resolve(fileName);
        })
        .catch(function (err) {
          return reject(err);
        });
    } else {
      return resolve([]);
    }
  });
};

exports.picture_image = function (picture) {
  return new Promise((resolve, reject) => {
    if (picture) {
      store_image(picture)
        .then(function (fileName) {
          picture.store_image = fileName;
          if (picture.machines && picture.machines.length > 0) {
            var promises = [];
            picture.machines.forEach(machine => {
              promises.push(machine_image(machine));
            });
            return Promise.all(promises);
          } else {
            return Promise.all([]);
          }
        })
        .then(function (machines) {
          picture.machines = machines;
          return resolve(picture);
        })
        .catch(function (err) {
          return reject(err);
        });
    } else {
      return resolve({});
    }
  });
};
exports.repair_image = function (repair) {
  return new Promise((resolve, reject) => {
    if (repair) {
      var image1_path = config.uploads.reports.repair.image1.dest;
      var image2_path = config.uploads.reports.repair.image2.dest;
      createImage(image1_path, repair.image1)
        .then(function (fileName) {
          repair.image1 = fileName;
          return createImage(image2_path, repair.image2);
        })
        .then(function (fileName) {
          repair.image2 = fileName;
          return resolve(repair);
        })
        .catch(function (err) {
          return reject(err);
        });
    } else {
      return resolve({});
    }
  });
};

/* commons method  */
function store_image(picture) {
  return new Promise((resolve, reject) => {
    if (picture.store_image) {
      var store_image_path = config.uploads.reports.picture.store_image.dest;
      createImage(store_image_path, picture.store_image)
        .then(function (fileName) {
          return resolve(fileName);
        })
        .catch(function (err) {
          return reject(err);
        });
    } else {
      return resolve('');
    }
  });
}
function machine_image(machine) {
  return new Promise((resolve, reject) => {
    if (machine.sets && machine.sets.length > 0) {
      var promises = [];
      machine.sets.forEach(set => {
        promises.push(machine_set(set));
      });
      Promise.all(promises)
        .then(function (sets) {
          machine.sets = sets;
          return resolve(machine);
        })
        .catch(function (err) {
          return reject(err);
        });
    } else {
      return resolve([]);
    }
  });
}
function machine_set(set) {
  return new Promise((resolve, reject) => {
    var before_path = config.uploads.reports.picture.before.dest;
    var after_path = config.uploads.reports.picture.after.dest;
    createImage(before_path, set.before)
      .then(function (fileName) {
        set.before = fileName;
        return createImage(after_path, set.after);
      })
      .then(function (fileName) {
        set.after = fileName;
        return resolve(set);
      })
      .catch(function (err) {
        return reject(err);
      });
  });
}

function createImage(path, input) {
  return new Promise((resolve, reject) => {
    if (input) {
      var data = input.replace(/^data:image\/\w+;base64,/, '');
      var name = crypto.randomBytes(16).toString('hex');
      var fileName = path + name + '.jpg';

      fs.writeFile(fileName, data, {
        encoding: 'base64',
        mode: '777'
      }, function (err) {
        if (err) {
          reject(err);
        } else {
          fs.chmodSync(fileName, '777');
          fileName = fileName.substr(1);
          resolve(fileName);
        }
      });
    } else {
      resolve('');
    }
  });
}
