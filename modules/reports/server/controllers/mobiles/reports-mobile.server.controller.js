'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  mongoose = require('mongoose'),
  Report = mongoose.model('Report'),
  User = mongoose.model('User'),
  Partner = mongoose.model('Partner'),
  path = require('path'),
  moment = require('moment'),
  help = require(path.resolve(
    './modules/core/server/controllers/help.server.controller'
  )),
  logger = require(path.resolve(
    './modules/core/server/controllers/logger.server.controller'
  ));

exports.histories = function (req, res) {
  req.checkBody('userId', 'サーバーエラーが発生しました。').notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(help.getMessage(errors));
  }

  var userId = req.body.userId;
  var keyword = req.body.keyword || '';
  var page = req.body.page || 1;
  var kind = req.body.kind || 1;

  User.findById(userId).exec((err, user) => {
    if (err) {
      logger.error(err);
      return res
        .status(422)
        .send({ message: 'サーバーエラーが発生しました。' });
    }
    if (!user) {
      return res
        .status(422)
        .send({ message: 'このデータは無効または削除されています。' });
    }
    if (user.roles[0] === 'partner') {
      Partner.findOne({ account: userId })
        .select('workers')
        .exec()
        .then(function (partner) {
          var userIds = [userId].concat(partner.workers);
          return getListReports(userIds, keyword, kind, page);
        })
        .then(function (result) {
          res.json(result);
        })
        .catch(err => {
          logger.error(err);
          return res
            .status(422)
            .send({ message: 'サーバーエラーが発生しました。' });
        });
    } else if (
      user.roles[0] === 'user' ||
      user.roles[0] === 'dispatcher' ||
      user.roles[0] === 'employee'
    ) {
      getListReports([userId], keyword, kind, page)
        .then(function (result) {
          res.json(result);
        })
        .catch(err => {
          logger.error(err);
          return res
            .status(422)
            .send({ message: 'サーバーエラーが発生しました。' });
        });
    } else {
      return res.status(422).send({ message: 'アクセス権限が必要。' });
    }
  });
};

exports.create = function (req, res) {
  req.checkBody('userId', 'サーバーエラーが発生しました。').notEmpty();
  req.checkBody('data', 'サーバーエラーが発生しました。').notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(help.getMessage(errors));
  }
  var userId = req.body.userId;
  var report = new Report(req.body.data);
  User.findById(userId).exec((err, user) => {
    if (err) {
      logger.error(err);
      return res
        .status(422)
        .send({ message: 'サーバーエラーが発生しました。' });
    }
    if (!user) {
      return res
        .status(422)
        .send({ message: 'このデータは無効または削除されています。' });
    }
    if (user.roles[0] === 'partner' ||
    user.roles[0] === 'user' ||
    user.roles[0] === 'dispatcher' ||
    user.roles[0] === 'employee') {
      report.number = moment()
        .valueOf()
        .toString();
      report.save(function (err) {
        if (err) {
          logger.error(err);
          return res
            .status(422)
            .send({ message: 'サーバーエラーが発生しました。' });
        }
        return res.end();
      });
    } else {
      return res.status(422).send({ message: 'アクセス権限が必要。' });
    }
  });
};

function getListReports(userIds, keyword, kind, page) {
  return new Promise((resolve, reject) => {
    var sort = '-created';
    var limit = 20;
    var query = {};
    var and_arr = [];
    var twoYearBefore = moment()
      .subtract(2, 'years')
      .format('YYYY-MM-DD HH:mm');
    and_arr.push({ created: { $gte: twoYearBefore } });
    and_arr.push({ kind: kind });
    and_arr.push({ author: { $in: userIds } });

    if (keyword && keyword !== '') {
      var key_lower = keyword.toLowerCase();
      var key_upper = keyword.toUpperCase();
      var or_arr = [
        { number: { $regex: '.*' + keyword + '.*' } },
        { number: { $regex: '.*' + key_lower + '.*' } },
        { number: { $regex: '.*' + key_upper + '.*' } },
        { author_name: { $regex: '.*' + keyword + '.*' } },
        { author_name: { $regex: '.*' + key_lower + '.*' } },
        { author_name: { $regex: '.*' + key_upper + '.*' } },
        { supplier: { $regex: '.*' + keyword + '.*' } },
        { supplier: { $regex: '.*' + key_lower + '.*' } },
        { supplier: { $regex: '.*' + key_upper + '.*' } },
        { address1: { $regex: '.*' + keyword + '.*' } },
        { address1: { $regex: '.*' + key_lower + '.*' } },
        { address1: { $regex: '.*' + key_upper + '.*' } },
        { address2: { $regex: '.*' + keyword + '.*' } },
        { address2: { $regex: '.*' + key_lower + '.*' } },
        { address2: { $regex: '.*' + key_upper + '.*' } },
        { unit_name: { $regex: '.*' + keyword + '.*' } },
        { unit_name: { $regex: '.*' + key_lower + '.*' } },
        { unit_name: { $regex: '.*' + key_upper + '.*' } },
        { location: { $regex: '.*' + keyword + '.*' } },
        { location: { $regex: '.*' + key_lower + '.*' } },
        { location: { $regex: '.*' + key_upper + '.*' } },
        { manager: { $regex: '.*' + keyword + '.*' } },
        { manager: { $regex: '.*' + key_lower + '.*' } },
        { manager: { $regex: '.*' + key_upper + '.*' } },
        { saler: { $regex: '.*' + keyword + '.*' } },
        { saler: { $regex: '.*' + key_lower + '.*' } },
        { saler: { $regex: '.*' + key_upper + '.*' } }
      ];
      and_arr.push({ $or: or_arr });
    }

    if (and_arr.length > 0) {
      query = { $and: and_arr };
    }

    Report.paginate(query, {
      select: 'created number supplier pdf',
      sort: sort,
      page: page,
      limit: limit
    }).then(
      function (result) {
        resolve(result.docs);
      },
      err => {
        reject(err);
      }
    );
  });
}

exports.config = function (req, res) {
  var config = {
    // メーカー
    makers: [
      'ダイキン',
      '三菱電機',
      '三菱重工',
      '日立',
      '東芝',
      'Panasonic',
      '三洋',
      'ヤンマー',
      'アイシン',
      'ピーマック',
      '木村工機',
      '暖冷工業',
      '富士通ゼネラル',
      'コロナ',
      'ノーリツ',
      'クボタ',
      'LG'
    ],
    // タイプ
    types: [
      '天カセ四方向',
      '天カセ二方向',
      '天カセ一方向',
      '壁掛け',
      '天吊り',
      '天埋め',
      'ビルトイン',
      '床置き',
      'ルーム壁掛け',
      'ルーム一方向',
      'ルーム二方向',
      'ユニットクーラー',
      'ファンコイル'
    ],
    // 冷媒
    type_taps: [{ id: false, value: '冷' }, { id: true, value: '暖' }],
    // 破損確認 無/有
    two_taps: [{ id: false, value: '無' }, { id: true, value: '有' }],
    // 作業箇所
    three_taps: [{ id: 1, value: '－' }, { id: 2, value: '▲' }, { id: 3, value: '●' }],
    // 作業前（後）
    four_taps: [{ id: 1, value: '－' }, { id: 2, value: '△' }, { id: 3, value: '○' }, { id: 4, value: '×' }],
    // 作業結果
    work_status: [{ id: true, value: '完了' }, { id: false, value: '継続' }],
    // 営業所
    locations: [
      '東京本社　〒160-0023 東京都新宿区西新宿7-20-1　住友不動産西新宿ビル22F',
      '大阪営業所　〒567-0817 大阪府茨木市別院町5-7　ハヤシビル3F',
      '名古屋オフィス　〒465-0057 愛知県名古屋市名東区陸前町3001'
    ],
    // 指摘事項
    phrases: [
      '試運転実施後、正常運転の確認が取れています。',
      '機器の更新をお薦めいたします。',
      '部品交換をお薦めいたします。',
      '別途点検を推奨いたします。',
      '黒ススの恐れがありますのでガーゼを貼らさせて頂きました。',
      'ポンプダウンによる洗浄をおすすめします。'
    ],
    // 冷媒
    refrigerant_kinds: [
      'R410A',
      'R407C',
      'R22',
      'R32',
      'R404a',
      'R12',
      'R134a'
    ],
    // その他作業→作業内容
    work_title: [
      'フィルター',
      'エレメント',
      'ダクト',
      '換気扇',
      '制気口',
      '空気清浄機',
      '加湿器',
      '防虫網',
      '防鳥網',
      '空気清浄機',
      '全熱交換機',
      'ユニットクーラー'
    ],
    // 仕様
    specifications: ['空調機', 'ルーム', '冷機', 'チラー', 'その他'],
    // 作業内容(Chỉ dùng cho Repair)
    repair_work_kind: [
      {
        id: 1, // Sử dụng trường hợp cần so sánh
        title: '故障診断', // Dùng để hiển thị lên dialog select
        content: '◎上記機器の故障診断実施\n状況：\n原因：\n処置：\n現状：\n指摘事項：\nその他：' // Nếu option này được chọn, thì set content nào vào 報告内容
      },
      {
        id: 2,
        title: '修理',
        content: '◎上記機器の修理作業実施\n作業内容：\n指摘事項：'
      },
      {
        id: 3,
        title: '修理',
        content: '◎保守点検作業実施\n作業内容：\n指摘事項：\nその他'
      },
      {
        id: 4,
        title: '現場調査（入替現場調査）',
        content: '◎空調機入替工事の現場調査実施。\n○○系統　●台\n（※機器情報、設置状況　等記入）'
      },
      {
        id: 5,
        title: '現場調査（新設現場調査）',
        content: '◎空調機新設工事の現場調査実施\n○○系統　●台\n（※機器情報、設置状況　等記入）'
      },
      {
        id: 6,
        title: '現場調査（照明現場調査）',
        content: '◎照明現場調査実施\n・調査場所：\n　・台数：\n　・逆富士型：　〇台\n　・ダウンライト：　〇台（開口φ〇〇）\n　・スクエア：　〇台（開口寸法　〇〇㎜）\n　・ブレーカー位置：\n　・必要な鍵：'
      },
      {
        id: 7,
        title: '現場調査（EMS現場調査）',
        content: '◎EMS現場調査実施\n　・キュービクル設置場所：\n　・計測点：\n　・必要な鍵：\n　・室外機設置場所：\n　・室外機台数：　〇台\n　・その他特記事項：\n　・ガスメーター：'
      },
      {
        id: 8,
        title: '現場調査（空調機洗浄現場調査）',
        content: '◎空調機洗浄作業の現場調査実施\n（※調査機器、内容を記載）'
      },
      {
        id: 9,
        title: '現場調査（その他）',
        content: '〇〇〇の現場調査実施\n（※調査機器、内容を記載）'
      },
      {
        id: 10,
        title: '他（ダクト清掃）',
        content: '◎ダクト清掃実施\n作業内容：\n指摘事項：'
      },
      {
        id: 11,
        title: '他（照明工事）',
        content: '◎照明工事実施\n　・工事場所：\n　・作業台数：\n　・逆富士型：　〇台\n　・ダウンライト：　〇台\n　・スクエア：　〇台\n　・通線作業実施'
      },
      {
        id: 12,
        title: '他（EMS工事）',
        content: '◎EMS工事実施\n　・作業場所：\n　・作業内容：\n　・屋外配管作業\n　・アダプタ取付け作業\n　・停電作業\n　・通線作業\n　・主装置取付け\n　・電力系取付け\n　・CT取付け'
      },
      {
        id: 13,
        title: '他（その他）',
        content: '作業内容：\n指摘事項：'
      }
    ],
    // 作業内容(Chỉ dùng cho Construct)
    construct_work_kind: [
      {
        id: 1, // Sử dụng trường hợp cần so sánh
        title: '故障診断', // Dùng để hiển thị lên dialog select
        content: '◎上記機器の故障診断実施\n状況：\n原因：\n処置：\n現状：\n指摘事項：\nその他：' // Nếu option này được chọn, thì set content nào vào 報告内容
      },
      {
        id: 2,
        title: '修理',
        content: '◎上記機器の修理作業実施\n作業内容：\n指摘事項：'
      },
      {
        id: 3,
        title: '修理',
        content: '◎保守点検作業実施\n作業内容：\n指摘事項：\nその他'
      },
      {
        id: 4,
        title: '現場調査（入替現場調査）',
        content: '◎空調機入替工事の現場調査実施。\n○○系統　●台\n（※機器情報、設置状況　等記入）'
      },
      {
        id: 5,
        title: '現場調査（新設現場調査）',
        content: '◎空調機新設工事の現場調査実施\n○○系統　●台\n（※機器情報、設置状況　等記入）'
      },
      {
        id: 6,
        title: '現場調査（照明現場調査）',
        content: '◎照明現場調査実施\n・調査場所：\n　・台数：\n　・逆富士型：　〇台\n　・ダウンライト：　〇台（開口φ〇〇）\n　・スクエア：　〇台（開口寸法　〇〇㎜）\n　・ブレーカー位置：\n　・必要な鍵：'
      },
      {
        id: 7,
        title: '現場調査（EMS現場調査）',
        content: '◎EMS現場調査実施\n　・キュービクル設置場所：\n　・計測点：\n　・必要な鍵：\n　・室外機設置場所：\n　・室外機台数：　〇台\n　・その他特記事項：\n　・ガスメーター：'
      },
      {
        id: 8,
        title: '現場調査（空調機洗浄現場調査）',
        content: '◎空調機洗浄作業の現場調査実施\n（※調査機器、内容を記載）'
      },
      {
        id: 9,
        title: '現場調査（その他）',
        content: '〇〇〇の現場調査実施\n（※調査機器、内容を記載）'
      },
      {
        id: 10,
        title: '他（ダクト清掃）',
        content: '◎ダクト清掃実施\n作業内容：\n指摘事項：'
      },
      {
        id: 11,
        title: '他（照明工事）',
        content: '◎照明工事実施\n　・工事場所：\n　・作業台数：\n　・逆富士型：　〇台\n　・ダウンライト：　〇台\n　・スクエア：　〇台\n　・通線作業実施'
      },
      {
        id: 12,
        title: '他（EMS工事）',
        content: '◎EMS工事実施\n　・作業場所：\n　・作業内容：\n　・屋外配管作業\n　・アダプタ取付け作業\n　・停電作業\n　・通線作業\n　・主装置取付け\n　・電力系取付け\n　・CT取付け'
      },
      {
        id: 13,
        title: '他（その他）',
        content: '作業内容：\n指摘事項：'
      }
    ]

  };

  return res.json(config);
};
