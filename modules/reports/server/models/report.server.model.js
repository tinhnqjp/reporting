'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate-v2'),
  path = require('path'),
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
  start: { type: Date }, // YYYY/MM/DD HH:mm (Picure report có format: YYY/MM/DD)
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
    exportClean(doc._id)
      .then(() => {
        next();
      })
      .catch(err => {
        next(err);
      });
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
        doc.search = (doc.supplier ? doc.supplier : '') + '-' + doc.number;
        resolve(doc);
      });
    });
  });
}
function exportClean(reportId) {
  var CONFIG = master_data.config;
  var Report = mongoose.model('Report');
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
      .then(function (report) {
        if (!report) {
          reject({
            message: 'このデータは無効または削除されています。'
          });
        }
        urlOutput = OUT_FILE_PATH + reportId + FILE_EXT;
        var wsExport = workbook.getWorksheet('報告書');

        // clone sheet
        // var totalSheet = sheetTotalMax(report);
        // for (var i = 0; i < totalSheet; i++) {
        //   var copySheet = workbook.addWorkSheet('sheet' + i);
        //   copySheet.model = wsExport.model;
        //   copySheet.name = 'SHEET' + 1;
        // }

        // export
        wsExport.getCell('D1').value = report.number;
        wsExport.getCell('D3').value = report.supplier;
        wsExport.getCell('D4').value = report.address1;
        wsExport.getCell('D5').value = report.address2;

        var startStr = moment(report.start).format('YYYY/MM/DD/ddd/HH/mm');
        var starts = startStr.split('/');
        wsExport.getCell('AB3').value = starts[0];
        wsExport.getCell('AF3').value = starts[1];
        wsExport.getCell('AI3').value = starts[2];
        wsExport.getCell('AM3').value = starts[3];
        wsExport.getCell('AQ3').value = starts[4];
        wsExport.getCell('AU3').value = starts[5];

        var endStr = moment(report.end).format('YYYY/MM/DD/ddd/HH/mm');
        var ends = endStr.split('/');
        wsExport.getCell('AB4').value = ends[0];
        wsExport.getCell('AF4').value = ends[1];
        wsExport.getCell('AI4').value = ends[2];
        wsExport.getCell('AM4').value = ends[3];
        wsExport.getCell('AQ4').value = ends[4];
        wsExport.getCell('AU4').value = ends[5];

        wsExport.getCell('AD5').value = report.clean.number_of_internal;
        wsExport.getCell('AI5').value = report.clean.number_of_external;
        wsExport.getCell('AO5').value = report.clean.number_of_internal_room;
        wsExport.getCell('AU5').value = report.clean.number_of_external_room;

        wsExport.getCell('F7').value = report.manager;
        wsExport.getCell('F8').value = report.saler;
        wsExport.getCell('R7').value = report.author_name;
        wsExport.getCell('AQ7').value = report.clean.other_works.length > 0 ? 'あり' : 'なし';
        wsExport.getCell('AQ8').value = report.clean.work_result ? '完了' : '継続';
        if (report.signature) {
          var draw1 = workbook.addImage({
            filename: '.' + report.signature,
            extension: 'jpg'
          });
          wsExport.addImage(draw1, 'AP82:AW84');
        }

        var row = 12;
        report.clean.internals.forEach(inter => {
          if (row <= 21) {
            wsExport.getCell('A' + row).value = inter.number;
            wsExport.getCell('C' + row).value = inter.maker;
            wsExport.getCell('H' + row).value = inter.type;
            wsExport.getCell('M' + row).value = inter.model;
            wsExport.getCell('U' + row).value = inter.serial;

            wsExport.getCell('Z' + row).value = three_taps(inter.drain_pump);
            wsExport.getCell('AC' + row).value = three_taps(inter.hose);
            wsExport.getCell('AF' + row).value = three_taps(inter.heat_exchanger);
            wsExport.getCell('AI' + row).value = three_taps(inter.drain_pan);
            wsExport.getCell('AL' + row).value = three_taps(inter.grill);
            wsExport.getCell('AO' + row).value = three_taps(inter.filter);
            wsExport.getCell('AR' + row).value = pic_taps(inter.has_picture);
            wsExport.getCell('AU' + row).value = inter.assembler;
            row++;
          }
        });

        row = 25;
        report.clean.internals.forEach(inter => {
          if (row <= 34) {
            wsExport.getCell('A' + row).value = inter.number;
            wsExport.getCell('C' + row).value = four_taps(inter.before_confirmed);
            wsExport.getCell('F' + row).value = two_taps(inter.damage);
            wsExport.getCell('I' + row).value = four_taps(inter.drainage);
            wsExport.getCell('L' + row).value = four_taps(inter.noise_and_vibration);
            wsExport.getCell('O' + row).value = four_taps(inter.after_confirmed);
            wsExport.getCell('R' + row).value = type_taps(inter.measure);

            wsExport.getCell('Z' + row).value = three_taps(inter.drain_pump);
            wsExport.getCell('AC' + row).value = three_taps(inter.hose);
            wsExport.getCell('AF' + row).value = three_taps(inter.heat_exchanger);
            wsExport.getCell('AI' + row).value = three_taps(inter.drain_pan);
            wsExport.getCell('AL' + row).value = three_taps(inter.grill);
            wsExport.getCell('AO' + row).value = three_taps(inter.filter);

            wsExport.getCell('T' + row).value = inter.temp_before_suction;
            wsExport.getCell('V' + row).value = inter.temp_before_blow;
            wsExport.getCell('X' + row).value = inter.temp_before_diff;
            wsExport.getCell('Z' + row).value = inter.temp_after_suction;
            wsExport.getCell('AB' + row).value = inter.temp_after_blow;
            wsExport.getCell('AD' + row).value = inter.temp_after_diff;

            wsExport.getCell('AF' + row).value = inter.wind_before_suction;
            wsExport.getCell('AH' + row).value = inter.wind_before_blow;
            wsExport.getCell('AJ' + row).value = inter.wind_before_diff;
            wsExport.getCell('AL' + row).value = inter.wind_after_suction;
            wsExport.getCell('AN' + row).value = inter.wind_after_blow;
            wsExport.getCell('AP' + row).value = inter.wind_after_diff;
            wsExport.getCell('AR' + row).value = inter.exterior_type;
            row++;
          }
        });

        row = 38;
        report.clean.externals.forEach(exter => {
          if (row <= 47) {
            wsExport.getCell('A' + row).value = exter.number;
            wsExport.getCell('C' + row).value = exter.maker;
            wsExport.getCell('H' + row).value = exter.internals;
            wsExport.getCell('L' + row).value = exter.model;
            wsExport.getCell('T' + row).value = exter.serial;
            wsExport.getCell('Y' + row).value = exter.refrigerant_kind;
            wsExport.getCell('AB' + row).value = exter.made_date;

            wsExport.getCell('AF' + row).value = four_taps(exter.before_noise_and_vibration);
            wsExport.getCell('AI' + row).value = four_taps(exter.breakage_dent);
            wsExport.getCell('AL' + row).value = four_taps(exter.heat_exchanger);
            wsExport.getCell('AO' + row).value = four_taps(exter.exterior_clean);
            wsExport.getCell('AR' + row).value = four_taps(exter.after_noise_and_vibration);
            wsExport.getCell('AU' + row).value = pic_taps(exter.has_picture);
            row++;
          }
        });

        // 指摘事項
        var rowDesc = 50;
        report.clean.externals.forEach(exter => {
          if (rowDesc <= 59) {
            wsExport.getCell('A' + rowDesc).value = '内機';
            wsExport.getCell('C' + rowDesc).value = exter.number;
            wsExport.getCell('E' + rowDesc).value = exter.description;
            rowDesc++;
          }
        });
        report.clean.externals.forEach(exter => {
          if (rowDesc <= 59) {
            wsExport.getCell('A' + rowDesc).value = '外機';
            wsExport.getCell('C' + rowDesc).value = exter.number;
            wsExport.getCell('E' + rowDesc).value = exter.description;
            rowDesc++;
          }
        });

        row = 50;
        report.clean.other_works.forEach(other => {
          if (row <= 59) {
            wsExport.getCell('AH' + row).value = other.title;
            row++;
            wsExport.getCell('AI' + row).value = other.detail;
            row++;
          }
        });

        row = 63;
        report.drawings.forEach(draw => {
          if (row <= 63) {
            if (draw) {
              var draw1 = workbook.addImage({
                filename: '.' + draw,
                extension: 'jpg'
              });
              wsExport.addImage(draw1, 'B' + row + ':AD' + (row + 12));
            }
            
            row++;
          }
        });

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
    var workers = report.clean.other_works;
    var internals = report.clean.internals;
    var externals = report.clean.externals;
    var max = 1;
    if (drawings && drawings.length > 1) {
      max = drawings.length;
    }
    if (workers && workers.length > 5) {
      var workerPage = Math.ceil(workers.length / 5);
      if (workerPage > max) {
        max = workerPage;
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
