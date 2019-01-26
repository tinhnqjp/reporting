'use strict';
exports.version = '20190123';
exports.config = {
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
  // 写真撮影機器
  pic_taps: [{
    id: false,
    value: '－'
  }, {
    id: true,
    value: '○'
  }],
  // 冷媒
  type_taps: [{
    id: false,
    value: '冷'
  }, {
    id: true,
    value: '暖'
  }],
  // 破損確認 無/有
  two_taps: [{
    id: false,
    value: '無'
  }, {
    id: true,
    value: '有'
  }],
  // 作業箇所
  three_taps: [
    { id: 1, value: '－' },
    { id: 2, value: '▲' },
    { id: 3, value: '●' }
  ],
  // 作業前（後）
  four_taps: [
    { id: 1, value: '－' },
    { id: 2, value: '△' },
    { id: 3, value: '○' },
    { id: 4, value: '×' }
  ],
  // 作業結果
  work_status: [{
    id: true,
    value: '完了'
  }, {
    id: false,
    value: '継続'
  }],
  // 営業所
  locations: [{
    id: '東京本社',
    value: '東京本社　〒160-0023 東京都新宿区西新宿7-20-1 住友不動産西新宿ビル22F'
  },
  {
    id: '大阪営業所',
    value: '大阪営業所　〒567-0817 大阪府茨木市別院町5-7 ハヤシビル3F'
  },
  {
    id: '名古屋オフィス',
    value: '名古屋オフィス　〒465-0057 愛知県名古屋市名東区陸前町3001'
  }
  ],
  // 指摘事項
  phrases: [
    '試運転実施後、正常運転の確認が取れています。',
    '機器の更新をお薦めいたします。',
    '部品交換をお薦めいたします。',
    '別途点検を推奨いたします。',
    '黒ススの恐れがありますのでガーゼを貼らさせて頂きました。',
    'ポンプダウンによる洗浄をおすすめします。',
    '設置上ドレンパンは取り付けたまま洗浄しています。',
    '本体と一体型の為、ドレンパンは取り付けたまま洗浄しています。',
    '外装パネルが塗装されている為、薬品を使用せずに清掃しています。',
    '機器本体と天井面に若干の隙間が見られました。機能上は問題ありません。',
    '機器付近の天井にヒビがありました。',
    '部品の欠損が見られました。',
    'エラー履歴がありました。作業前後試運転は問題ありませんでしたが、注意を要します。',
    '臭い対策として殺菌消臭水を噴霧しております。様子を見てください。',
    '他と比べ、汚れが目立ちました。洗浄周期の見直しを推奨します。',
    'ドレン配管内の汚れが目立ちました。',
    '室外機が汚れやすい設置環境です。定期的な洗浄を要します。',
    '室外機周辺に排熱が溜まりやすい設置環境です。',
    'FCU熱源停止の為、作業前後で温度測定未実施です。'
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
  repair_work_kind: [{
    id: 1, // Sử dụng trường hợp cần so sánh
    title: '故障診断', // Dùng để hiển thị lên dialog select
    content: '◎　上記機器の故障診断実施しました。\n状況：\n原因：\n処置：\n現状：\n対策：\n指摘事項：' // Nếu option này được chọn, thì set content nào vào 報告内容
  },
  {
    id: 2,
    title: '修理',
    content: '◎　上記機器の修理作業実施\n　　作業内容：\n　　現状：\n　　備考：'
  },
  {
    id: 3,
    title: '保守点検',
    content: '◎　保守点検作業実施致しました。\n　　（室外機　　台、　室内機　　台）\n　　※詳細は別途　点検表参照下さい。　　'
  },
  {
    id: 4,
    title: 'フロン漏洩簡易点検',
    content: '◎　フロン漏洩簡易点検作業実施致しました。\n　　（室外機　　台、　室内機　　台）\n　　※詳細は別途　点検表参照下さい。'
  },
  {
    id: 5,
    title: 'フロン漏洩定期点検',
    content: '◎　フロン漏洩定期点検作業実施致しました。\n　　（室外機　　台、　室内機　　台）\n　　※詳細は別途　点検表参照下さい。'
  },
  {
    id: 6,
    title: 'その他',
    content: '◎　●●●作業実施致しました。\n　　（作業内容記載）'
  }
  ],
  // 作業内容(Chỉ dùng cho Construct)
  construct_work_kind: [{
    id: 1, // Sử dụng trường hợp cần so sánh
    title: '入替工事', // Dùng để hiển thị lên dialog select
    content: '◎　空調機入替工事実施致しました。\n作業内容：\n　　　・冷媒回収作業・室内外機撤去作業\n　　　・配管接続工事・室内機据付工事\n　　　・室外機据付工事・窒素耐圧試験・真空乾燥作業\n　　　・試運転調整' // Nếu option này được chọn, thì set content nào vào 報告内容
  }, {
    id: 2,
    title: '新設工事',
    content: '◎　空調機新設工事実施致しました。\n作業内容：\n　　　・配管工事・室内機据付工事・電源工事\n　　　・室外機据付工事・窒素耐圧試験・真空乾燥作業\n　　　・試運転調整'
  }, {
    id: 3,
    title: '移設工事',
    content: '◎　空調機移設工事実施致しました。\n作業内容：'
  }, {
    id: 4,
    title: 'その他',
    content: '◎　●●●工事実施致しました \n'
  }],
  // 作業内容(Chỉ dùng cho Free)
  free_work_kind: [{
    id: 1,
    title: '入替現場調査（空調）',
    content: '◎　空調機入替工事の現場調査実施致しました\n（※機器情報、設置状況　等記入）' // Nếu option này được chọn, thì set content nào vào 報告内容
  }, {
    id: 2,
    title: '新設現場調査（空調）',
    content: '◎　空調機新設工事の現場調査実施致しました\n（※機器情報、設置状況　等記入）' // Nếu option này được chọn, thì set content nào vào 報告内容
  }, {
    id: 3,
    title: '空調機洗浄現場調査',
    content: '◎　空調機洗浄作業の現場調査実施\n　　室内機　　　　台\n　　室外機　　　　台\n（※調査機器、台数、内容を記載）' // Nếu option này được chọn, thì set content nào vào 報告内容
  }, {
    id: 4,
    title: 'ダクト現場調査',
    content: '◎　ダクト現場調査実施致しました\n\n　　　フード　　　箇所\n　　　Vバンク　　　　台\n　　　防火ダンパー　　　個\n　　　立上りダクト　　　箇所\n　　　グリスフィルター　　　枚\n　　　排気ファン　　　　　　 台\n　　　　　　　　メーカー：\n　　　　　　　　型式　　：\n　　　Vベルト\n　　　　　　　ベルト型式：\n　　　　　　　　　　本数　：\n　　　その他' // Nếu option này được chọn, thì set content nào vào 報告内容
  }, {
    id: 5,
    title: 'EMS現場調査',
    content: '◎　EMS現場調査実施致しました。\n\n   キュービクル設置場所　：\n  主幹ブレーカータイプ(表面接続/バックスタッド)　：\n  室外機設置場所、台数　：\n  計測箇所　：' // Nếu option này được chọn, thì set content nào vào 報告内容
  }, {
    id: 6,
    title: '照明現場調査',
    content: '◎　照明現場調査実施致しました。\n\n   調査箇所：\n  台数　　：'
  }, {
    id: 7,
    title: '太陽光現場調査',
    content: '◎　太陽光現場調査実施致しました。\n\n（※調査機器、内容を記載）'
  }, {
    id: 8,
    title: 'その他（調査）',
    content: '◎　●●●の現場調査実施致しました。\n\n（※調査機器、内容を記載）'
  }, {
    id: 9,
    title: 'ダクト清掃',
    content: '◎　ダクト清掃実施致しました。\n　　　フード　　　　　　　　　箇所\n　　　Vバンク　　　　　　　　台\n　　　防火ダンパー　　　 　個\n　　　立上りダクト　　　　　箇所\n　　　グリスフィルター　　　枚\n　　　排気ファン　　　　　　 台\n　　　　　　　　メーカー：\n　　　　　　　　型式　　：\n　　　Vベルト\n　　　　　　　　ベルト型式（本数）：\n　　　その他\n　【風速データ】\n　　　No,・名称　　作業前（ｍ/ｓ）　　作業後（ｍ/ｓ）',
    // 指摘事項
    phrases: [
      '排気ファンより異音がしていました。',
      'Vベルトに劣化が見られました。',
      '防火ダンパーのヒューズが切れていました。',
      '防火ダンパーが壊れていました。',
      '排気ファンの動作確認ができていませんので、不明点ありましたら連絡ください。'
    ]
  }, {
    id: 10,
    title: 'ロースター清掃',
    content: '◎　ダクト清掃実施致しました。\n\n　　　ロースター　　　　　　箇所\n　　　アームフード　　　　　箇所\n　　【風速データ】\n　　　　卓番　　作業前（ｍ/ｓ）　　作業後（ｍ/ｓ）',
    // 指摘事項
    phrases: [
      '排気ファンより異音がしていました。',
      'Vベルトに劣化が見られました。',
      '防火ダンパーのヒューズが切れていました。',
      '防火ダンパーが壊れていました。',
      '排気ファンの動作確認ができていませんので、何かありましたらご連絡ください。',
      '点火時に不具合があります'
    ]
  }, {
    id: 11,
    title: 'EMS工事',
    content: '◎　EMS工事実施致しました。\n\n　　　機器取り付け\n　　　配管、配線\n　　　停電作業'
  }, {
    id: 12,
    title: '照明工事',
    content: '◎　照明工事実施致しました。\n\n　　作業箇所：\n　　作業台数：'
  }, {
    id: 13,
    title: '太陽光工事',
    content: '◎　太陽光工事実施致しました。\n\n　　（作業内容記入）'
  }, {
    id: 14,
    title: 'その他',
    content: '作業内容：'
  }
  ],
  // 対象機
  targets: ['内機', '外機']
};
