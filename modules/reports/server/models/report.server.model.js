'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate-v2'),
  Schema = mongoose.Schema;

/**
 * Report Schema
 */
var ReportSchema = new Schema({
  // 報告書番号
  // Số hiệu của Report, được tạo khi Worker Send lên SV
  number: { type: String, default: '' },
  // ログ一覧
  // List log (Lưu lại các thao tác của các Actor trên web)
  logs: [{
    author: { type: Schema.ObjectId, ref: 'User' },
    author_name: { type: String, default: '' },
    // 1: 提出 - 2: 編集 - 3: 確認 - 4: 承認 - 5: 確定 - 6: 提出戻す - 7: 確定戻す - 8: 承認戻す
    // 1: Send - 2: Edit - 3: Confirm - 4: Approve - 5: Done - 6: Back to Sended - 7: Back to Confirmed - 8: Back to Approved
    action: { type: Number },
    time: { type: Date }
  }],
  // 作業者
  // Worker
  author: { type: Schema.ObjectId, ref: 'User' },
  // 作業者名
  author_name: { type: String, default: '' },
  // 状態 1: 提出 - 2: 確認済 - 3: 承認済 - 4: 確定済
  // Status 1: Send - 2: Confirmed - 3: Approved - 4: Done
  status: { type: Number, default: 1 },
  // 提出日
  created: { type: Date, default: Date.now },
  // Thông tin hỗ trợ Quan hệ, tìm kiếm
  // 部署
  unit: { type: Schema.ObjectId, ref: 'Unit' },
  partner: { type: Schema.ObjectId, ref: 'Partner' },
  partner_id: { type: String, default: '' },
  search: { type: String, default: '' },

  // ///////////////////////////////////////////////////////////////////
  // ////////////////// アプリ Input from app ///////////////////////////
  // ///////////////////////////////////////////////////////////////////

  // ------------------------- Common ------------------------------
  // 報告書種類 （1: 洗浄 - 2: 修理 - 3: 設置 - 4: 写真 - 5: フリ）
  // Loại Report (1: Clean - 2: Repair - 3: Construct - 4: Picture - 5: Free)
  kind: { type: Number, default: '' },
  // 納入先
  supplier: { type: String, trim: true, default: '' },
  // 住所 (1)
  address1: { type: String, trim: true, default: '' },
  // 住所 (2)
  address2: { type: String, trim: true, default: '' },
  // 開始
  start: { type: Date },
  // 終了
  end: { type: Date },
  // 提出先 (id)
  unit_id: { type: String, default: '' },
  // 提出先 (name)
  unit_name: { type: String, default: '' },
  // 営業所
  location: { type: String, default: '' },
  // 見取り図 (Ảnh từ màn hình drag - Từ app gửi lên 1 list Base64)
  drawings: [{ type: String }],
  // サイン (Ảnh Signature - Từ app gửi lên Base64)
  signature: { type: String },
  // 連絡事項 (Note thêm)
  notice: { type: String }, // Multiple lines
  // 作業者 (List workers)
  workers: [{
    // 氏名
    name: { type: String, default: '' }, // Require
    // 会社名
    company: { type: String, default: '' },
    // 開始時間
    work_start: { type: Date },
    // 終了時間
    work_end: { type: Date }
  }],
  // 責任者
  manager: { type: String, default: '' },
  // 営業担当者
  saler: { type: String, default: '' },
  // PATH PDF
  pdf: { type: String, default: '' },
  // // GPS
  // longitude: { type: String, default: '' },
  // latitude: { type: String, default: '' },
  // ------------------------- 洗浄報告書 Clean Report------------------------------
  clean: {
    // 内機
    number_of_internal: { type: Number }, // Int
    // 外機
    number_of_external: { type: Number }, // Int
    // ルーム（内）
    number_of_internal_room: { type: Number }, // Int
    // ルーム（外）
    number_of_external_room: { type: Number }, // Int
    // 作業結果
    work_result: { type: Boolean }, // Select (true: 完了, false: 継続)
    // 内機 (Internal machine)
    internals: [{
      // 管理No
      number: { type: Number }, // Int
      // 写真撮影機器
      has_picture: { type: Boolean, default: false }, // Button tap to change (false: bar, true: circle)
      // メーカー
      maker: { type: String, default: '' }, // Select and Free input (Chọn từ list text cố định hoặc free input)
      // タイプ
      type: { type: String, default: '' }, // Select and Free input (Chọn từ list text cố định hoặc free input)
      // 機器型式
      model: { type: String, default: '', maxlength: 13 }, // Free input
      // 製造番号
      serial: { type: String, default: '', maxlength: 12 }, // Free input
      // ドレンポンプ
      drain_pump: { type: Number, default: 1 }, // Button tap to change (1: bar, 2: triangle, 3: circle)
      // ホース内
      hose: { type: Number, default: 1 }, // Button tap to change (1: bar, 2: triangle, 3: circle)
      // 熱交換器
      heat_exchanger: { type: Number, default: 1 }, // Button tap to change (1: bar, 2: triangle, 3: circle)
      // ドレンパン
      drain_pan: { type: Number, default: 1 }, // Button tap to change (1: bar, 2: triangle, 3: circle)
      // グリル
      grill: { type: Number, default: 1 }, // Button tap to change (1: bar, 2: triangle, 3: circle)
      // フィルター
      filter: { type: Number, default: 1 }, // Button tap to change (1: bar, 2: triangle, 3: circle)
      // 動作確認
      before_confirmed: { type: Number, default: 1 }, // Button tap to change (1: bar, 2: triangle, 3: circle, 4: X)
      // 破損確認
      damage: { type: Boolean, default: false }, // Button tap to change (false: 無, true: 有)
      // 排水確認
      drainage: { type: Number, default: 1 }, // Button tap to change (1: bar, 2: triangle, 3: circle, 4: X)
      // 異音・振動
      noise_and_vibration: { type: Number, default: 1 }, // Button tap to change (1: bar, 2: triangle, 3: circle, 4: X)
      // 動作確認
      after_confirmed: { type: Number, default: 1 }, // Button tap to change (1: bar, 2: triangle, 3: circle, 4: X)
      // 測定（冷暖）
      measure: { type: Boolean, default: false }, // Button tap to change (false: 冷, true: 暖)

      // 温度 => 作業前 => 吸込
      temp_before_suction: { type: Number }, // Float (0-9 and .)
      // 温度 => 作業前 => 吹出
      temp_before_blow: { type: Number }, // Float (0-9 and .)
      // 温度 => 作業前 => 差
      temp_before_diff: { type: Number }, // Float (0-9 and .)
      // 温度 => 作業後 => 吸込
      temp_after_suction: { type: Number }, // Float (0-9 and .)
      // 温度 => 作業後 => 吹出
      temp_after_blow: { type: Number }, // Float (0-9 and .)
      // 温度 => 作業後 => 差
      temp_after_diff: { type: Number }, // Float (0-9 and .)

      // 風速 => 作業前 => 吸込
      wind_before_suction: { type: Number }, // Float (0-9 and .)
      // 風速 => 作業前 => 吹出
      wind_before_blow: { type: Number }, // Float (0-9 and .)
      // 風速 => 作業前 => 差
      wind_before_diff: { type: Number }, // Float (0-9 and .)
      // 風速 => 作業後 => 吸込
      wind_after_suction: { type: Number }, // Float (0-9 and .)
      // 風速 => 作業後 => 吹出
      wind_after_blow: { type: Number }, // Float (0-9 and .)
      // 風速 => 作業後 => 差
      wind_after_diff: { type: Number }, // Float (0-9 and .)
      // 組立者
      assembler: { type: String }, // Select from wokers
      // 外装パネル型式
      exterior_type: { type: String, maxlength: 14 }, // Free input
      // 指摘事項
      description: { type: String } // Multiple lines
    }],
    // 外機 (External machine)
    externals: [{
      // 写真撮影機器
      has_picture: { type: Boolean, default: false }, // Button tap to change (false: bar, true: circle)
      // メーカー
      maker: { type: String, default: '' }, // Select and Free input (Chọn từ list text cố định hoặc free input)
      // 機器型式
      model: { type: String, default: '', maxlength: 13 }, // Free input
      // 製造番号
      serial: { type: String, default: '', maxlength: 12 }, // Free input
      // 冷媒種類
      refrigerant_kind: { type: String, default: '' }, // Select and Free input (Chọn từ list text cố định hoặc free input)
      // 製造年月
      made_date: { type: String, maxlength: 7 }, // YYYY/MM (MM có thể không nhập YYYY/-)
      // 作業前 -> 異音・振動
      before_noise_and_vibration: { type: Number, default: 1 }, // Button tap to change (1: bar, 2: triangle, 3: circle, 4: X)
      // 破損・凹み
      breakage_dent: { type: Number, default: 1 }, // Button tap to change (1: bar, 2: triangle, 3: circle, 4: X)
      // 熱交換器
      heat_exchanger: { type: Number, default: 1 }, // Button tap to change (1: bar, 2: triangle, 3: circle, 4: X)
      // 外装清掃
      exterior_clean: { type: Number, default: 1 }, // Button tap to change (1: bar, 2: triangle, 3: circle, 4: X)
      // 作業後 -> 異音・振動
      after_noise_and_vibration: { type: Number, default: 1 }, // Button tap to change (1: bar, 2: triangle, 3: circle, 4: X)
      // 指摘事項
      description: { type: String } // Multiple lines
    }],
    // その他作業
    other_works: [{
      // 作業内容
      title: { type: String }, // Select (Chọn từ list text cố định hoặc free input)
      // 作業詳細
      detail: { type: String } // Multiple lines
    }]
  },
  // ------------------------- 修理報告書 Repair Report------------------------------
  repair: {
    // 内機 (Internal machine)
    internals: [],
    // 外機 (External machine)
    externals: []
  },
  // ------------------------- 設置報告書 Construct Report------------------------------
  construct: {
    // 内機 (Internal machine)
    internals: [],
    // 外機 (External machine)
    externals: []
  },
  // ------------------------- 写真報告書 Picture Report------------------------------
  picture: {
    // 機器
    machines: []
  }
});
ReportSchema.plugin(paginate);
mongoose.model('Report', ReportSchema);
