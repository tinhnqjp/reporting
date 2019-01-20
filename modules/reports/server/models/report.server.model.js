'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate-v2'),
  path = require('path'),
  fs = require('fs'),
  moment = require('moment'),
  _ = require('lodash'),
  master_data = require(path.resolve('./config/lib/master-data')),
  config = require(path.resolve('./config/config')),
  Excel = require('exceljs'),
  Schema = mongoose.Schema;

var CounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});
mongoose.model('Counter', CounterSchema);

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
    // 1: 提出 - 2: 編集 - 3: 確認 - 4: 承認 - 5: 確定 - 6: 提出済に戻す - 7: 確認済に戻す - 8: 承認済に戻す
    // 1: Send - 2: Edit - 3: Confirm - 4: Approve - 5: Done - 6: Back to Sended - 7: Back to Confirmed - 8: Back to Approved
    action: { type: Number },
    time: { type: Date }
  }],
  // 作業者
  // Worker
  author: { type: Schema.ObjectId, ref: 'User' },
  // 作業者名
  author_name: { type: String, default: '' },
  // 状態 1: 提出済 - 2: 確認済 - 3: 承認済 - 4: 確定済
  // Status 1: Send - 2: Confirmed - 3: Approved - 4: Done
  status: { type: Number, default: 1 },
  // 提出日
  created: { type: Date, default: Date.now },
  // Thông tin hỗ trợ Quan hệ, tìm kiếm
  // 部署
  unit: { type: Schema.ObjectId, ref: 'Unit' },
  partner: { type: Schema.ObjectId, ref: 'Partner' },
  partner_id: { type: String, default: '' },
  search: { type: String, default: '' }, // supplier + '-' + number
  role: { type: String, default: '' }, // Role của người đã send report (gán lúc create)
  // 備考
  note: { type: String, default: '' }, // Multiple lines (dành riêng cho CMS)
  // PATH PDF
  pdf: { type: String, default: '' },
  excel: { type: String, default: '' },

  // ///////////////////////////////////////////////////////////////////
  // ////////////////// アプリ Input from app ///////////////////////////
  // ///////////////////////////////////////////////////////////////////

  // ------------------------- Common ------------------------------
  // 報告書種類 （1: 洗浄 - 2: 修理 - 3: 設置 - 4: 写真 - 5: フリ）
  // Loại Report (1: Clean - 2: Repair - 3: Construct - 4: Picture - 5: Free)
  kind: { type: Number, default: 1 },
  // 納入先 (Picture report sẽ là 店舗名)
  supplier: { type: String, trim: true, default: '' },
  // 住所 (1)
  address1: { type: String, trim: true, default: '' },
  // 住所 (2)
  address2: { type: String, trim: true, default: '' },
  // 開始 (Picture report sẽ là 実施日時)
  start: { type: Date }, // YYYY/MM/DD HH:mm
  // 終了
  end: { type: Date }, // YYYY/MM/DD HH:mm (Picure report không có end)
  // 提出先 (id)
  unit_id: { type: String, default: '' },
  // 提出先 (name)
  unit_name: { type: String, default: '' },
  // 作業結果
  work_result: { type: Boolean }, // Select (true: 完了, false: 継続)
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
  // 責任者 (Picture report sẽ là 現場担当者)
  manager: { type: String, default: '' },
  // 営業担当者
  saler: { type: String, default: '' },
  // // GPS
  // longitude: { type: String, default: '' },
  // latitude: { type: String, default: '' },
  // ------------------------- 洗浄報告書 Clean Report------------------------------
  clean: {
    // 内機
    number_of_internal: { type: Number, max: 999, min: 0 }, // Int
    // 外機
    number_of_external: { type: Number, max: 999, min: 0 }, // Int
    // ルーム（内）
    number_of_internal_room: { type: Number, max: 999, min: 0 }, // Int
    // ルーム（外）
    number_of_external_room: { type: Number, max: 999, min: 0 }, // Int
    // 内機 (Internal machine)
    internals: [{
      // 管理No
      number: { type: Number, required: true }, // Int
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
      // 管理No
      number: { type: Number, required: true }, // Int
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
      // 対応内機
      internals: { type: String }, // Chuỗi các number của Máy trong nhà, ngăn cách nhau bởi dấu [,]
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
  // ------------------------- 写真報告書 Picture Report------------------------------
  picture: {
    // 店舗外観写真
    store_image: { type: String }, // Đường dẫn đến image (trên sv), từ mobile gửi lên Base64
    // 機器一覧
    machines: [{
      // 管理No
      number: { type: Number, required: true }, // Int
      // 備考
      note: { type: String, default: '' }, // Multiple lines
      sets: [{
        // コメント
        comment: { type: String }, // Tối đa 2 line
        // Before写真
        before: { type: String }, // Đường dẫn đến image (trên sv), từ mobile gửi lên Base64
        // After写真
        after: { type: String } // Đường dẫn đến image (trên sv), từ mobile gửi lên Base64
      }]
    }]
  },
  // ------------------------- 修理報告書 Repair Report------------------------------
  repair: {
    // 作業内容
    work_kind: { type: String }, // Đây là field title trong Master data repair_work_kind
    // 内機 (Internal machine)
    internals: [{
      // 管理No
      number: { type: Number, required: true }, // Int
      // 設置場所
      posision: { type: String },
      // メーカー
      maker: { type: String, default: '' }, // Select and Free input (Chọn từ list text cố định hoặc free input)
      // タイプ
      type: { type: String, default: '' }, // Select and Free input (Chọn từ list text cố định hoặc free input)
      // 機器型式
      model: { type: String, default: '', maxlength: 13 }, // Free input
      // 製造番号
      serial: { type: String, default: '', maxlength: 12 }, // Free input
      // 外装パネル型式
      exterior_type: { type: String, maxlength: 14 }, // Free input
      // 製造年月
      made_date: { type: String, maxlength: 7 }, // YYYY/MM (MM có thể không nhập YYYY/-)
      // 室内吸込
      indoor_suction: { type: Number }, // ℃ Float có dạng: 123.12 (phía trước [.] tối đa 3 số, phía sau [.] tối đa 2 số)
      // 室内吹出
      outdoor_suction: { type: Number }, // ℃ Float có dạng: 123.12 (phía trước [.] tối đa 3 số, phía sau [.] tối đa 2 số)
      // 高圧
      high_pressure: { type: Number }, // Mpa Float có dạng: 123.12 (phía trước [.] tối đa 3 số, phía sau [.] tối đa 2 số)
      // 低圧
      low_pressure: { type: Number }, // Mpa Float có dạng: 123.12 (phía trước [.] tối đa 3 số, phía sau [.] tối đa 2 số)
      // 吐出管
      discharge_pipe: { type: Number }, // ℃ Float có dạng: 123.12 (phía trước [.] tối đa 3 số, phía sau [.] tối đa 2 số)
      // 吸入管
      suction_pipe: { type: Number }, // ℃ Float có dạng: 123.12 (phía trước [.] tối đa 3 số, phía sau [.] tối đa 2 số)
      // U
      u: { type: Number }, // Float có dạng: 123.12 (phía trước [.] tối đa 3 số, phía sau [.] tối đa 2 số)
      // V
      v: { type: Number }, // Float có dạng: 123.12 (phía trước [.] tối đa 3 số, phía sau [.] tối đa 2 số)
      // W
      w: { type: Number } // Float có dạng: 123.12 (phía trước [.] tối đa 3 số, phía sau [.] tối đa 2 số)
    }],
    // 外機 (External machine)
    externals: [{
      // 管理No
      number: { type: Number, required: true }, // Int
      // 設置場所
      posision: { type: String },
      // メーカー
      maker: { type: String, default: '' }, // Select and Free input (Chọn từ list text cố định hoặc free input)
      // 機器型式
      model: { type: String, default: '', maxlength: 13 }, // Free input
      // 対応内機
      internals: { type: String }, // Chuỗi các number của Máy trong nhà, ngăn cách nhau bởi dấu [,]
      // 冷媒種類
      refrigerant_kind: { type: String, default: '' }, // Select and Free input (Chọn từ list text cố định hoặc free input)
      // 規定量
      specified_amount: { type: Number }, // Kg Float có dạng: 123.12 (phía trước [.] tối đa 3 số, phía sau [.] tối đa 2 số)
      // 製造番号
      serial: { type: String, default: '', maxlength: 12 }, // Free input
      // 製造年月
      made_date: { type: String, maxlength: 7 }, // YYYY/MM (MM có thể không nhập YYYY/-)
      // 回収量
      recovery_amount: { type: Number }, // Kg Float có dạng: 123.12 (phía trước [.] tối đa 3 số, phía sau [.] tối đa 2 số)
      // 充填量
      filling_amount: { type: Number }, // Kg Float có dạng: 123.12 (phía trước [.] tối đa 3 số, phía sau [.] tối đa 2 số)
      // 備考
      remarks: { type: String, maxlength: 15 },
      // 対象機
      target: { type: Number }, // Chọn giữa 内機 và 外機
      // 室内吸込
      indoor_suction: { type: Number }, // ℃ Float có dạng: 123.12 (phía trước [.] tối đa 3 số, phía sau [.] tối đa 2 số)
      // 室内吹出
      outdoor_suction: { type: Number }, // ℃ Float có dạng: 123.12 (phía trước [.] tối đa 3 số, phía sau [.] tối đa 2 số)
      // 高圧
      high_pressure: { type: Number }, // Mpa Float có dạng: 123.12 (phía trước [.] tối đa 3 số, phía sau [.] tối đa 2 số)
      // 低圧
      low_pressure: { type: Number }, // Mpa Float có dạng: 123.12 (phía trước [.] tối đa 3 số, phía sau [.] tối đa 2 số)
      // 吐出管
      discharge_pipe: { type: Number }, // ℃ Float có dạng: 123.12 (phía trước [.] tối đa 3 số, phía sau [.] tối đa 2 số)
      // 吸入管
      suction_pipe: { type: Number }, // ℃ Float có dạng: 123.12 (phía trước [.] tối đa 3 số, phía sau [.] tối đa 2 số)
      // U
      u: { type: Number }, // Float có dạng: 123.12 (phía trước [.] tối đa 3 số, phía sau [.] tối đa 2 số)
      // V
      v: { type: Number }, // Float có dạng: 123.12 (phía trước [.] tối đa 3 số, phía sau [.] tối đa 2 số)
      // W
      w: { type: Number } // Float có dạng: 123.12 (phía trước [.] tối đa 3 số, phía sau [.] tối đa 2 số)
    }],
    // 写真データ
    image1: { type: String }, // Đường dẫn đến image (trên sv), từ mobile gửi lên Base64
    image2: { type: String }, // Đường dẫn đến image (trên sv), từ mobile gửi lên Base64
    // 報告内容
    work_content: { type: String } // Multiple lines
  },
  // ------------------------- 設置報告書 Construct Report------------------------------
  construct: {
    // 作業内容
    work_kind: { type: String }, // Đây là field title trong Master data construct_work_kind
    // 日目
    day: { type: Number },
    // 内機 (Internal machine)
    internals: [{
      // 管理No
      number: { type: Number, required: true }, // Int
      // 系統名
      lineage_name: { type: String },
      // 既設機器 -> メーカー
      old_maker: { type: String, default: '' }, // Select and Free input (Chọn từ list text cố định hoặc free input)
      // 既設機器 -> 機器型式
      old_model: { type: String, default: '', maxlength: 13 }, // Free input
      // 既設機器 -> 製造番号
      old_serial: { type: String, default: '', maxlength: 12 }, // Free input
      // 新規機器 -> メーカー
      new_maker: { type: String, default: '' }, // Select and Free input (Chọn từ list text cố định hoặc free input)
      // 新規機器 -> 機器型式
      new_model: { type: String, default: '', maxlength: 13 }, // Free input
      // 新規機器 -> 製造番号
      new_serial: { type: String, default: '', maxlength: 12 }, // Free input
      // 耐圧試験
      pressure_test: { type: Number, default: 1 }, // Button tap to change (1: bar, 2: triangle, 3: circle, 4: X)
      // 通水確認
      Water_flow: { type: Number, default: 1 }, // Button tap to change (1: bar, 2: triangle, 3: circle, 4: X)
      // 試運転
      test: { type: Number, default: 1 }, // Button tap to change (1: bar, 2: triangle, 3: circle, 4: X)
      // 吸込温度
      suction_temperature: { type: Number }, // ℃ Float có dạng: 123.12 (phía trước [.] tối đa 3 số, phía sau [.] tối đa 2 số)
      // 吹出温度
      blowing_temperature: { type: Number } // ℃ Float có dạng: 123.12 (phía trước [.] tối đa 3 số, phía sau [.] tối đa 2 số)
    }],
    // 外機 (External machine)
    externals: [{
      // 管理No
      number: { type: Number, required: true }, // Int
      // 系統名
      lineage_name: { type: String },
      // 既設機器 -> メーカー
      old_maker: { type: String, default: '' }, // Select and Free input (Chọn từ list text cố định hoặc free input)
      // 既設機器 -> 機器型式
      old_model: { type: String, default: '', maxlength: 13 }, // Free input
      // 既設機器 -> 製造番号
      old_serial: { type: String, default: '', maxlength: 12 }, // Free input
      // 新規機器 -> メーカー
      new_maker: { type: String, default: '' }, // Select and Free input (Chọn từ list text cố định hoặc free input)
      // 新規機器 -> 機器型式
      new_model: { type: String, default: '', maxlength: 13 }, // Free input
      // 新規機器 -> 製造番号
      new_serial: { type: String, default: '', maxlength: 12 }, // Free input
      // 既設仕様
      old_spec: { type: String }, // Select and Free input (Chọn từ list text cố định hoặc free input)
      // 新規仕様
      new_spec: { type: String }, // Select and Free input (Chọn từ list text cố định hoặc free input)
      // 冷媒種類
      recovery_refrigerant_kind: { type: String, default: '' }, // Select and Free input (Chọn từ list text cố định hoặc free input)
      // 回収量
      recovery_amount: { type: Number }, // Kg Float có dạng: 123.12 (phía trước [.] tối đa 3 số, phía sau [.] tối đa 2 số)
      // 冷媒種類
      specified_refrigerant_kind: { type: String, default: '' }, // Select and Free input (Chọn từ list text cố định hoặc free input)
      // 規定量
      specified_amount: { type: Number }, // Kg Float có dạng: 123.12 (phía trước [.] tối đa 3 số, phía sau [.] tối đa 2 số)
      // 設置時追加充填量
      filling_amount: { type: Number }, // Kg Float có dạng: 123.12 (phía trước [.] tối đa 3 số, phía sau [.] tối đa 2 số)
      // 対象機
      target: { type: Number }, // Chọn giữa 内機 và 外機
      // 備考
      remarks: { type: String, maxlength: 15 }
    }],
    // 工事概要
    summary: { type: String }, // Multiple lines
    // その他特記事項
    other_note: { type: String } // Multiple lines
  }
});

ReportSchema.pre('save', function (next) {
  var doc = this;
  if (this.isNew) {
    // number
    createReport(doc)
      .then(_doc => {
        doc = _doc;
        next();
      })
      .catch(err => {
        next(err);
      });
  } else {
    next();
  }
});

ReportSchema.statics.updateLogs = function (report, user, action) {
  return new Promise(function (resolve, reject) {
    report.logs.push({
      author: user._id,
      author_name: user.name,
      action: action,
      time: Date.now()
    });
    report.save(function (err) {
      if (err) {
        reject(err);
      }
      resolve(report);
    });
  });
};

ReportSchema.statics.exportClean = function (reportId) {
  return exportClean(reportId);
};

ReportSchema.plugin(paginate);
mongoose.model('Report', ReportSchema);

function createReport(doc) {
  return new Promise((resolve, reject) => {
    var sqDefault = config.other.number;
    var Counter = mongoose.model('Counter');
    Counter.findById({ _id: 'entityId' }, function (error, counter) {
      if (error)
        return reject(error);
      if (counter) {
        counter.seq = counter.seq + 1;
      } else {
        counter = new Counter({
          _id: 'entityId',
          seq: sqDefault
        });
      }
      counter.save(function (err) {
        if (err)
          return reject(err);

        doc.number = counter.seq;
        var pdf = config.uploads.reports.pdf.dest + doc._id + '.pdf';
        doc.pdf = pdf.substr(1);
        var excel = config.uploads.reports.excel.export + doc._id + '.xlsx';
        doc.excel = excel.substr(1);
        doc.search = (doc.supplier ? doc.supplier : '') + '-' + doc.number;
        resolve(doc);
      });
    });
  });
}
function exportClean(reportId) {
  var CONFIG = master_data.config;
  var Report = mongoose.model('Report');
  var wsTemplate;
  var report;
  return new Promise((resolve, reject) => {
    var TEMPLATE_PATH = config.uploads.reports.excel.clean;
    var OUT_FILE_PATH = config.uploads.reports.excel.export;
    var FILE_EXT = '.xlsx';
    var urlOutput = '';
    var workbook = new Excel.Workbook();

    workbook.xlsx.readFile(TEMPLATE_PATH)
      .then(function () {
        return getReportId(reportId);
      })
      .then(function (_report) {
        if (!_report) {
          reject({
            message: 'このデータは無効または削除されています。'
          });
        }
        report = _report;
        urlOutput = OUT_FILE_PATH + reportId + FILE_EXT;
        var wsExport = workbook.getWorksheet('報告書');
        wsExport.pageSetup.printArea = 'A1:AX85';
        wsTemplate = _.cloneDeep(wsExport);

        // export
        write_basic(workbook, wsExport, report);
        write_works(wsExport, report, 1);
        write_drawing(workbook, wsExport, report, 1);
        write_clean_internals(wsExport, report, 1);
        write_clean_externals(wsExport, report, 1);
        write_clean_description(wsExport, report, 1);
        write_other_works(wsExport, report, 1);

        return workbook.xlsx.writeFile(urlOutput);
      })
      .then(function () {
        // other sheet
        var total = sheetTotalMax(report);
        for (var index = 2; index <= total; index++) {
          var copySheet = workbook.addWorksheet('報告書' + index);
          var ws = _.cloneDeep(wsTemplate);
          copySheet.model = Object.assign(ws.model, {
            mergeCells: ws.model.merges
          });
          copySheet.name = '報告書' + index;
          // export
          write_basic(workbook, copySheet, report);
          write_works(copySheet, report, index);
          write_drawing(workbook, copySheet, report, index);
          write_clean_internals(copySheet, report, index);
          write_clean_externals(copySheet, report, index);
          write_clean_description(copySheet, report, index);
          write_other_works(copySheet, report, index);
        }

        return workbook.xlsx.writeFile(urlOutput);
      })
      .then(function () {
        return converPdf(urlOutput);
      })
      .then(function () {
        return resolve(urlOutput);
      })
      .catch(function (err) {
        return reject(err);
      });
  });

  function getReportId(reportId) {
    return new Promise(function (resolve, reject) {
      Report.findById(reportId).exec(function (err, report) {
        if (err) {
          reject(err);
        }
        resolve(report);
      });
    });
  }
  function three_taps(value) {
    var result = _.find(CONFIG.three_taps, { id: value });
    if (result) {
      return result.value;
    }
    return '';
  }
  function pic_taps(value) {
    var result = _.find(CONFIG.pic_taps, { id: value });
    if (result) {
      return result.value;
    }
    return '';
  }
  function type_taps(value) {
    var result = _.find(CONFIG.type_taps, { id: value });
    if (result) {
      return result.value;
    }
    return '';
  }
  function two_taps(value) {
    var result = _.find(CONFIG.two_taps, { id: value });
    if (result) {
      return result.value;
    }
    return '';
  }
  function four_taps(value) {
    var result = _.find(CONFIG.four_taps, { id: value });
    if (result) {
      return result.value;
    }
    return '';
  }
  function sheetTotalMax(report) {
    var drawings = report.drawings;
    var other_works = report.clean.other_works;
    var workers = report.workers;
    var internals = report.clean.internals;
    var externals = report.clean.externals;
    var max = 1;
    if (drawings && drawings.length > 1) {
      max = drawings.length;
    }
    if (workers && workers.length > 12) {
      var workersPage = Math.ceil(workers.length / 12);
      if (workersPage > max) {
        max = workersPage;
      }
    }
    if (other_works && other_works.length > 5) {
      var otherPage = Math.ceil(other_works.length / 5);
      if (otherPage > max) {
        max = otherPage;
      }
    }
    if (internals && internals.length > 10) {
      var intPage = Math.ceil(internals.length / 10);
      if (intPage > max) {
        max = intPage;
      }
    }
    if (externals && externals.length > 10) {
      var extPage = Math.ceil(externals.length / 10);
      if (extPage > max) {
        max = extPage;
      }
    }
    if (internals && internals.length > 1 && externals && externals.length > 1) {
      var totalIntExt = 0;
      internals.forEach(item => {
        if (item.description) {
          totalIntExt++;
        }
      });
      externals.forEach(item => {
        if (item.description) {
          totalIntExt++;
        }
      });
      var intExtPage = Math.ceil(totalIntExt / 10);
      if (totalIntExt > 10 && intExtPage > max) {
        max = intExtPage;
      }
    }
    return max;
  }
  function checkSheet(sheetNo, limit, index) {
    if ((sheetNo * limit - limit) <= index && index < (sheetNo * limit)) {
      return true;
    }
    return false;
  }
  function write_basic(workbook, sheet, report) {
    sheet.getCell('D1').value = report.number;
    sheet.getCell('D3').value = report.supplier;
    sheet.getCell('D4').value = report.address1;
    sheet.getCell('D5').value = report.address2;

    var startStr = moment(report.start).format('YYYY/MM/DD/ddd/HH/mm');
    var starts = startStr.split('/');
    sheet.getCell('AB3').value = starts[0];
    sheet.getCell('AF3').value = starts[1];
    sheet.getCell('AI3').value = starts[2];
    sheet.getCell('AM3').value = starts[3];
    sheet.getCell('AQ3').value = starts[4];
    sheet.getCell('AU3').value = starts[5];

    var endStr = moment(report.end).format('YYYY/MM/DD/ddd/HH/mm');
    var ends = endStr.split('/');
    sheet.getCell('AB4').value = ends[0];
    sheet.getCell('AF4').value = ends[1];
    sheet.getCell('AI4').value = ends[2];
    sheet.getCell('AM4').value = ends[3];
    sheet.getCell('AQ4').value = ends[4];
    sheet.getCell('AU4').value = ends[5];

    sheet.getCell('AD5').value = report.clean.number_of_internal;
    sheet.getCell('AI5').value = report.clean.number_of_external;
    sheet.getCell('AO5').value = report.clean.number_of_internal_room;
    sheet.getCell('AU5').value = report.clean.number_of_external_room;

    sheet.getCell('F7').value = report.manager;
    sheet.getCell('F8').value = report.saler;

    sheet.getCell('AQ7').value = report.clean.other_works.length > 0 ? 'あり' : 'なし';
    sheet.getCell('AQ8').value = report.clean.work_result ? '完了' : '継続';
    sheet.getCell('F83').value = report.location;
    if (report.signature && fs.existsSync('.' + report.signature)) {
      var draw1 = workbook.addImage({
        filename: '.' + report.signature,
        extension: 'jpg'
      });
      sheet.addImage(draw1, {
        tl: { col: 41.5, row: 81.5 },
        br: { col: 47.5, row: 83.5 }
      });
    }
  }
  function write_works(sheet, report, sheetNo) {
    var limit = 12;
    var arrWorker = ['R7', 'U7', 'X7', 'AA7', 'AD7', 'AG7', 'R8', 'U8', 'X8', 'AA8', 'AD8', 'AG8'];
    var col = 0;
    report.workers.forEach((worker, index) => {
      if (col === limit) {
        col = 0;
      }
      if (checkSheet(sheetNo, limit, index)) {
        sheet.getCell(arrWorker[col]).value = worker.name;
        col++;
      }
    });
  }
  function write_drawing(workbook, sheet, report, sheetNo) {
    var row = 63;
    if (report.drawings && report.drawings[sheetNo - 1]) {
      var draw = report.drawings[sheetNo - 1];
      if (draw && fs.existsSync('.' + draw)) {
        var draw1 = workbook.addImage({
          filename: '.' + draw,
          extension: 'jpg'
        });
        sheet.addImage(draw1, 'B' + row + ':AV' + (row + 15));
      }
    }
  }
  function write_clean_description(sheet, report, sheetNo) {
    var limit = 10;
    // 指摘事項
    var index = 0;
    var rowDesc = 50;
    report.clean.internals.forEach(inter => {
      if (rowDesc <= 59 && inter.description) {
        if (checkSheet(sheetNo, limit, index)) {
          sheet.getCell('A' + rowDesc).value = '内機';
          sheet.getCell('C' + rowDesc).value = inter.number;
          sheet.getCell('E' + rowDesc).value = inter.description;
          rowDesc++;
        }
        index++;
      }
    });
    report.clean.externals.forEach(exter => {
      if (rowDesc <= 59 && exter.description) {
        if (checkSheet(sheetNo, limit, index)) {
          sheet.getCell('A' + rowDesc).value = '外機';
          sheet.getCell('C' + rowDesc).value = exter.number;
          sheet.getCell('E' + rowDesc).value = exter.description;
          rowDesc++;
        }
        index++;
      }
    });
  }
  function write_clean_externals(sheet, report, sheetNo) {
    var row = 38;
    var limit = 10;
    report.clean.externals.forEach((exter, index) => {
      if (row <= 47 && checkSheet(sheetNo, limit, index)) {
        sheet.getCell('A' + row).value = exter.number;
        sheet.getCell('C' + row).value = exter.maker;
        sheet.getCell('H' + row).value = exter.internals;
        sheet.getCell('L' + row).value = exter.model;
        sheet.getCell('T' + row).value = exter.serial;
        sheet.getCell('Y' + row).value = exter.refrigerant_kind;
        sheet.getCell('AB' + row).value = exter.made_date;

        sheet.getCell('AF' + row).value = four_taps(exter.before_noise_and_vibration);
        sheet.getCell('AI' + row).value = four_taps(exter.breakage_dent);
        sheet.getCell('AL' + row).value = four_taps(exter.heat_exchanger);
        sheet.getCell('AO' + row).value = four_taps(exter.exterior_clean);
        sheet.getCell('AR' + row).value = four_taps(exter.after_noise_and_vibration);
        sheet.getCell('AU' + row).value = pic_taps(exter.has_picture);
        row++;
      }
    });
  }
  function write_clean_internals(sheet, report, sheetNo) {
    var limit = 10;
    var row = 12;
    report.clean.internals.forEach((inter, index) => {
      if (row <= 21 && checkSheet(sheetNo, limit, index)) {
        sheet.getCell('A' + row).value = inter.number;
        sheet.getCell('C' + row).value = inter.maker;
        sheet.getCell('H' + row).value = inter.type;
        sheet.getCell('M' + row).value = inter.model;
        sheet.getCell('U' + row).value = inter.serial;

        sheet.getCell('Z' + row).value = three_taps(inter.drain_pump);
        sheet.getCell('AC' + row).value = three_taps(inter.hose);
        sheet.getCell('AF' + row).value = three_taps(inter.heat_exchanger);
        sheet.getCell('AI' + row).value = three_taps(inter.drain_pan);
        sheet.getCell('AL' + row).value = three_taps(inter.grill);
        sheet.getCell('AO' + row).value = three_taps(inter.filter);
        sheet.getCell('AR' + row).value = pic_taps(inter.has_picture);
        sheet.getCell('AU' + row).value = inter.assembler;
        row++;
      }
    });

    row = 25;
    report.clean.internals.forEach((inter, index) => {
      if (row <= 34 && checkSheet(sheetNo, limit, index)) {
        sheet.getCell('A' + row).value = inter.number;
        sheet.getCell('C' + row).value = four_taps(inter.before_confirmed);
        sheet.getCell('F' + row).value = two_taps(inter.damage);
        sheet.getCell('I' + row).value = four_taps(inter.drainage);
        sheet.getCell('L' + row).value = four_taps(inter.noise_and_vibration);
        sheet.getCell('O' + row).value = four_taps(inter.after_confirmed);
        sheet.getCell('R' + row).value = type_taps(inter.measure);

        sheet.getCell('Z' + row).value = three_taps(inter.drain_pump);
        sheet.getCell('AC' + row).value = three_taps(inter.hose);
        sheet.getCell('AF' + row).value = three_taps(inter.heat_exchanger);
        sheet.getCell('AI' + row).value = three_taps(inter.drain_pan);
        sheet.getCell('AL' + row).value = three_taps(inter.grill);
        sheet.getCell('AO' + row).value = three_taps(inter.filter);

        sheet.getCell('T' + row).value = inter.temp_before_suction;
        sheet.getCell('V' + row).value = inter.temp_before_blow;
        sheet.getCell('X' + row).value = inter.temp_before_diff;
        sheet.getCell('Z' + row).value = inter.temp_after_suction;
        sheet.getCell('AB' + row).value = inter.temp_after_blow;
        sheet.getCell('AD' + row).value = inter.temp_after_diff;

        sheet.getCell('AF' + row).value = inter.wind_before_suction;
        sheet.getCell('AH' + row).value = inter.wind_before_blow;
        sheet.getCell('AJ' + row).value = inter.wind_before_diff;
        sheet.getCell('AL' + row).value = inter.wind_after_suction;
        sheet.getCell('AN' + row).value = inter.wind_after_blow;
        sheet.getCell('AP' + row).value = inter.wind_after_diff;
        sheet.getCell('AR' + row).value = inter.exterior_type;
        row++;
      }
    });
  }
  function write_other_works(sheet, report, sheetNo) {
    var row = 50;
    var limit = 10;
    report.clean.other_works.forEach((other, index) => {
      if (row <= 59 && checkSheet(sheetNo, limit, index)) {
        sheet.getCell('AH' + row).value = other.title;
        row++;
        sheet.getCell('AI' + row).value = other.detail;
        row++;
      }
    });
  }

  function converPdf(file) {
    return new Promise(function (resolve, reject) {
      var exec = require('child_process').exec;
      var command = 'soffice --headless --convert-to pdf ' + file + ' --outdir ' + config.uploads.reports.pdf.dest;

      exec(command, function (err) {
        if (err) {
          reject(err);
        }
        resolve(true);
      });
    });
  }
}
