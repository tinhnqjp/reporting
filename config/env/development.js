'use strict';

var defaultEnvConfig = require('./default');

module.exports = {
  db: {
    uri: process.env.MONGOHQ_URL || process.env.MONGODB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || '127.0.0.1:27017') + '/ep-dev',
    options: {},
    // Enable mongoose debug mode
    debug: process.env.MONGODB_DEBUG || false
  },
  log: {
    // logging with Morgan - https://github.com/expressjs/morgan
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'dev',
    fileLogger: {
      directoryPath: process.cwd(),
      fileName: 'app.log',
      maxsize: 10485760,
      maxFiles: 2,
      json: false
    }
  },
  app: {
    title: defaultEnvConfig.app.title + ' - 開発環境'
  },
  // mailer: {
  //   from: process.env.MAILER_FROM || defaultEnvConfig.app.title + ' - 開発環境',
  //   options: {
  //     service: process.env.MAILER_SERVICE_PROVIDER || 'gmail',
  //     auth: {
  //       user: process.env.MAILER_EMAIL_ID || 'ktc.innovation.center@gmail.com',
  //       pass: process.env.MAILER_PASSWORD || 'otyccywwsykkgofr' // 'UtUAEMknYiDp'
  //     }
  //   }
  // },
  livereload: false,
  seedDB: {
    seed: process.env.MONGO_SEED === 'true',
    options: {
      logResults: process.env.MONGO_SEED_LOG_RESULTS !== 'false'
    },
    // Order of collections in configuration will determine order of seeding.
    // i.e. given these settings, the User seeds will be complete before
    // Article seed is performed.
    collections: [{
      model: 'User',
      docs: [{
        data: {
          username: 'admin',
          firstName: 'Admin',
          lastName: 'Local',
          roles: ['admin']
        }
      }
        // , {
        //   // Set to true to overwrite this document
        //   // when it already exists in the collection.
        //   // If set to false, or missing, the seed operation
        //   // will skip this document to avoid overwriting it.
        //   overwrite: true,
        //   data: {
        //     username: 'user',
        //     firstName: 'User',
        //     lastName: 'Local',
        //     roles: ['manager', 'user']
        //   }
        // }
      ]
    }]
  }
};
