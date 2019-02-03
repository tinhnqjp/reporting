'use strict';

module.exports = {
  app: {
    title: 'DEMO',
    description: 'Working report',
    keywords: '',
    googleAnalyticsTrackingID: process.env.GOOGLE_ANALYTICS_TRACKING_ID || 'GOOGLE_ANALYTICS_TRACKING_ID'
  },
  db: {
    promise: global.Promise
  },
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  // DOMAIN config should be set to the fully qualified application accessible
  // URL. For example: https://www.myapp.com (including port if required).
  domain: process.env.DOMAIN,
  // Session Cookie settings
  sessionCookie: {
    // session expiration is set by default to 24 hours
    maxAge: 24 * (60 * 60 * 1000),
    // httpOnly flag makes sure the cookie is only accessed
    // through the HTTP protocol and not JS/browser
    httpOnly: true,
    // secure cookie should be turned to true to provide additional
    // layer of security so that the cookie is set only when working
    // in HTTPS mode.
    secure: false
  },
  // sessionSecret should be changed for security measures and concerns
  sessionSecret: process.env.SESSION_SECRET || '5931TCenter',
  // sessionKey is the cookie session name
  sessionKey: 'sessionId',
  sessionCollection: 'sessions',
  // Lusca config
  csrf: {
    csrf: false,
    csp: false,
    xframe: 'SAMEORIGIN',
    p3p: 'ABCDEF',
    xssProtection: true
  },
  logo: 'modules/core/client/img/brand/logo.png',
  favicon: 'modules/core/client/img/brand/favicon.ico',
  illegalUsernames: ['meanjs', 'administrator', 'password', 'admin', 'user',
    'unknown', 'anonymous', 'null', 'undefined', 'api'
  ],
  aws: {
    s3: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      bucket: process.env.S3_BUCKET
    }
  },
  uploads: {
    // Storage can be 'local' or 's3'
    storage: process.env.UPLOADS_STORAGE || 'local',
    profile: {
      image: {
        dest: './modules/users/client/img/profile/uploads/',
        limits: { fileSize: 5 * 1024 * 1024 }
      }
    },
    reports: {
      drawings: {
        dest: './modules/reports/client/img/drawings/',
        limits: { fileSize: 50 * 1024 * 1024 }
      },
      signature: {
        dest: './modules/reports/client/img/signature/',
        limits: { fileSize: 50 * 1024 * 1024 }
      },
      picture: {
        store_image: {
          dest: './modules/reports/client/img/store_image/',
          limits: { fileSize: 50 * 1024 * 1024 }
        },
        before: {
          dest: './modules/reports/client/img/before/',
          limits: { fileSize: 50 * 1024 * 1024 }
        },
        after: {
          dest: './modules/reports/client/img/after/',
          limits: { fileSize: 50 * 1024 * 1024 }
        }
      },
      repair: {
        image1: {
          dest: './modules/reports/client/img/image1/',
          limits: { fileSize: 50 * 1024 * 1024 }
        },
        image2: {
          dest: './modules/reports/client/img/image2/',
          limits: { fileSize: 50 * 1024 * 1024 }
        }
      },
      pdf: {
        dest: './modules/reports/client/pdf/'
      },
      excel: {
        dest: './modules/reports/client/excels/import',
        limits: { fileSize: 100 * 1024 * 1024 },
        export: './modules/reports/client/excels/export/',
        clean: './modules/reports/client/excels/template/clean.xlsx',
        picture: './modules/reports/client/excels/template/picture.xlsx'
      }
    },
    users: {
      excel: {
        dest: './modules/users/client/excels/import',
        limits: { fileSize: 100 * 1024 * 1024 },
        export: './modules/users/client/excels/export/',
        template: './modules/users/client/excels/template/Export.xlsx'
      }
    }
  },
  shared: {
  },
  other: {
    // First time number
    number: 1
  }

};
