'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  path = require('path'),
  fs = require('fs'),
  moment = require('moment'),
  _ = require('lodash'),
  master_data = require(path.resolve('./config/lib/master-data')),
  config = require(path.resolve('./config/config')),
  Excel = require('exceljs');

var CONFIG = master_data.config;
var OUT_FILE_PATH = config.uploads.reports.excel.export;
var FILE_EXT = '.xlsx';
var wsTemplate;
var urlOutput;
var report;
var Report = mongoose.model('Report');

exports.exportFile = function (reportId) {
  return new Promise((resolve, reject) => {
    getReportId(reportId)
      .then(function (_report) {
        report = _report;
        if (report.kind === 1) {
          return exportClean(report);
        }
        if (report.kind === 4) {
          return exportPicture(report);
        }
      })
      .then(function (_urlOutput) {
        urlOutput = _urlOutput;
        return converPdf(urlOutput);
      })
      .then(function () {
        return resolve(urlOutput);
      })
      .catch(function (err) {
        return reject(err);
      });
  });
};

/* private method  */
function exportClean(report) {
  return new Promise((resolve, reject) => {
    var TEMPLATE_PATH = config.uploads.reports.excel.clean;
    var urlOutput = '';
    var workbook = new Excel.Workbook();

    workbook.xlsx.readFile(TEMPLATE_PATH)
      .then(function () {

        urlOutput = OUT_FILE_PATH + report._id + FILE_EXT;
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
          var copySheet = workbook.addWorksheet('報告書' + index, { state: 'visible' });
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
        return resolve(urlOutput);
      })
      .catch(function (err) {
        return reject(err);
      });
  });

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

    if (report.location) {
      sheet.getCell('F83').value = report.location.replace('　', '\r\n');
    }

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
}

function exportPicture(report) {
  return new Promise((resolve, reject) => {
    var TEMPLATE_PATH = config.uploads.reports.excel.picture;
    var urlOutput = '';
    var workbook = new Excel.Workbook();

    workbook.xlsx.readFile(TEMPLATE_PATH)
      .then(function () {

        urlOutput = OUT_FILE_PATH + report._id + FILE_EXT;
        var wsExport = workbook.getWorksheet('基本情報');
        wsExport.state = 'visible';
        // basics
        write_basic(workbook, wsExport, report);

        // machines
        var wsMachine = workbook.getWorksheet(2);
        wsTemplate = _.cloneDeep(wsMachine);

        var total = report.picture.machines.length;
        for (var index = 1; index <= total; index++) {
          var copySheet = workbook.addWorksheet('管理No' + index, { state: 'visible' });
          var ws = _.cloneDeep(wsTemplate);
          copySheet.model = Object.assign(ws.model, {
            mergeCells: ws.model.merges
          });
          copySheet.name = '管理No' + index;
          // export
          process_machine(workbook, copySheet, report.picture.machines[index - 1]);
        }

        wsMachine.state = 'hidden';

        return workbook.xlsx.writeFile(urlOutput);
      })
      .then(function () {
        return resolve(urlOutput);
      })
      .catch(function (err) {
        return reject(err);
      });
  });

  function checkSheet(sheetNo, limit, index) {
    if ((sheetNo * limit - limit) <= index && index < (sheetNo * limit)) {
      return true;
    }
    return false;
  }
  function write_basic(workbook, sheet, report) {
    sheet.getCell('D15').value = report.supplier;

    var startStr = moment(report.start).format('YYYY年MM月DD(ddd)/HH:mm');
    var starts = startStr.split('/');
    sheet.getCell('D17').value = starts[0];
    sheet.getCell('D19').value = starts[1];

    sheet.getCell('D40').value = report.saler;
    sheet.getCell('F40').value = report.manager;


    if (report.location) {
      var locations = report.location.split('　');
      sheet.getCell('F36').value = locations[0];
      sheet.getCell('B37').value = locations[1];
    }

    if (report.picture.store_image && fs.existsSync('.' + report.picture.store_image)) {
      var store_image = workbook.addImage({
        filename: '.' + report.picture.store_image,
        extension: 'jpg'
      });
      sheet.addImage(store_image, {
        tl: { col: 1.1, row: 21.1 },
        br: { col: 6.99, row: 30.99 }
      });
    }
  }

  function process_machine(workbook, sheet, machine) {
    sheet.getCell('B1').value = machine.number;
    var wsTemplate;
    var total_page = Math.ceil(machine.sets.length / 4);
    if (total_page > 1) {
      wsTemplate = _.cloneDeep(sheet);
    }
    for (let sheetNo = 1; sheetNo <= total_page; sheetNo++) {
      if (sheetNo === 1) {
        sheet.getCell('B1').value = machine.number;
        write_machine(workbook, sheet, machine, sheetNo);
      } else {
        var ws = _.cloneDeep(wsTemplate);
        var sheetName = ws.name;
        var copySheet = workbook.addWorksheet(sheetName + '_' + sheetNo, { state: 'visible' });
        copySheet.model = Object.assign(ws.model, {
          mergeCells: ws.model.merges
        });
        copySheet.name = sheetName + '_' + sheetNo;
        copySheet.getCell('B1').value = machine.number;
        write_machine(workbook, copySheet, machine, sheetNo);
      }
    }
  }

  function write_machine(workbook, sheet, machine, sheetNo) {
    var limit = 4;
    var row = 5;
    machine.sets.forEach((set, index) => {
      if (checkSheet(sheetNo, limit, index)) {
        var x = index % 4;
        if (x === 0) {
          row = 5;
        } else {
          row = 14 * x + 5;
        }
        write_set(workbook, sheet, set, row);
      }
    });
  }

  function write_set(workbook, sheet, set, row) {
    if (set.before && fs.existsSync('.' + set.before)) {
      var before = workbook.addImage({
        filename: '.' + set.before,
        extension: 'jpg'
      });
      sheet.addImage(before, 'A' + row + ':D' + (row + 10));
    }
    if (set.after && fs.existsSync('.' + set.after)) {
      var after = workbook.addImage({
        filename: '.' + set.after,
        extension: 'jpg'
      });
      sheet.addImage(after, 'E' + row + ':H' + (row + 10));
    }
    sheet.getCell('B' + (row + 11)).value = set.comment;
  }
}


/* commons method  */
function getReportId(reportId) {
  return new Promise(function (resolve, reject) {
    Report.findById(reportId).exec(function (err, report) {
      if (err) {
        reject(err);
      }
      if (!report) {
        reject({
          message: 'このデータは無効または削除されています。'
        });
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
function converPdf(file) {
  return new Promise(function (resolve, reject) {
    var exec = require('child_process').exec;
    var command = 'soffice --headless --nologo --nofirststartwizard --convert-to pdf ' + file + ' --outdir ' + config.uploads.reports.pdf.dest;

    exec(command, function (err) {
      if (err) {
        reject(err);
      }
      resolve(true);
    });
  });
}
