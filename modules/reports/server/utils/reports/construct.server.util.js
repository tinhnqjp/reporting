'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  path = require('path'),
  fs = require('fs'),
  moment = require('moment-timezone'),
  sharp = require('sharp'),
  sizeOf = require('image-size'),
  _ = require('lodash'),
  master_data = require(path.resolve('./config/lib/master-data')),
  config = require(path.resolve('./config/config')),
  Excel = require('exceljs');
moment.locale('ja');
var CONFIG = master_data.config;
var OUT_FILE_PATH = config.uploads.reports.excel.export;
var FILE_EXT = '.xlsx';
var wsTemplate;
var urlOutput;
var report;
var Report = mongoose.model('Report');

exports.exportFile = function (report) {
  return new Promise((resolve, reject) => {
    exportConstruct(report)
      .then(function () {
        return resolve(urlOutput);
      })
      .catch(function (err) {
        return reject(err);
      });
  });
};

function exportConstruct(report) {
  return new Promise((resolve, reject) => {
    var TEMPLATE_PATH = config.uploads.reports.excel.construct;
    var urlOutput = '';
    var workbook = new Excel.Workbook();
    var summaries = [];
    var other_notes = [];

    workbook.xlsx.readFile(TEMPLATE_PATH)
      .then(function () {

        urlOutput = OUT_FILE_PATH + report._id + FILE_EXT;
        var wsExport = workbook.getWorksheet('報告書');
        wsExport.pageSetup.printArea = 'A1:AJ64';
        wsTemplate = _.cloneDeep(wsExport);

        // export
        write_basic(workbook, wsExport, report);
        write_works(wsExport, report, 1);
        write_drawing(workbook, wsExport, report, 1);
        write_construct_internals(wsExport, report, 1);
        write_construct_externals(wsExport, report, 1);

        if (report.construct.other_note) {
          other_notes = report.construct.other_note.split(/\r?\n/);
          write_other_note(wsExport, other_notes, 1);
        }
        if (report.construct.summary) {
          summaries = report.construct.summary.split(/\r?\n/);
          write_summary(wsExport, summaries, 1);
        }
        // sheet.getCell('B12').value = report.construct.summary;
        // sheet.getCell('B48').value = report.construct.other_note;

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
          write_construct_internals(copySheet, report, index);
          write_construct_externals(copySheet, report, index);
          if (other_notes) {
            write_other_note(copySheet, other_notes, index);
          }
          if (summaries) {
            write_other_note(copySheet, summaries, index);
          }
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
    var workers = report.workers;
    var internals = report.construct.internals;
    var externals = report.construct.externals;
    var max = 1;
    if (drawings && drawings.length > 1) {
      max = drawings.length;
    }
    if (workers && workers.length > 8) {
      var workersPage = Math.ceil(workers.length / 8);
      if (workersPage > max) {
        max = workersPage;
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
    sheet.getCell('C3').value = report.number;
    sheet.getCell('D4').value = report.supplier;
    sheet.getCell('D6').value = report.address1;
    sheet.getCell('D7').value = report.address2;

    var startStr = moment(report.start).format('YYYY/MM/DD/ddd/HH/mm');
    var starts = startStr.split('/');
    sheet.getCell('R4').value = starts[0];
    sheet.getCell('U4').value = starts[1];
    sheet.getCell('X4').value = starts[2];
    sheet.getCell('AB4').value = starts[3];
    sheet.getCell('AE4').value = starts[4];
    sheet.getCell('AG4').value = starts[5];

    var endStr = moment(report.end).format('YYYY/MM/DD/ddd/HH/mm');
    var ends = endStr.split('/');
    sheet.getCell('R5').value = ends[0];
    sheet.getCell('U5').value = ends[1];
    sheet.getCell('X5').value = ends[2];
    sheet.getCell('AB5').value = ends[3];
    sheet.getCell('AE5').value = ends[4];
    sheet.getCell('AG5').value = ends[5];

    sheet.getCell('R6').value = report.manager;
    sheet.getCell('R9').value = report.saler;
    sheet.getCell('D8').value = report.work_kind;
    var work_result = '';
    if (report.work_result === true) {
      work_result = '完了';
    }
    if (report.work_result === false) {
      work_result = '継続';
    }
    sheet.getCell('D9').value = work_result;

    if (report.location) {
      sheet.getCell('C58').value = report.location.replace('　', '\r\n');
    }

    if (report.signature && fs.existsSync('.' + report.signature)) {
      var signature = addImage(workbook, report.signature);
      sheet.addImage(signature, getDimension('.' + report.signature, 24, 34, 56, 62, 39, 29));
    }
  }
  function write_works(sheet, report, sheetNo) {
    var limit = 8;
    var arrWorker = ['R7', 'V7', 'Z7', 'AD7', 'AD7', 'R8', 'V8', 'Z8', 'AD8', 'AD8'];
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
    if (report.drawings && report.drawings[sheetNo - 1]) {
      var draw = report.drawings[sheetNo - 1];
      if (draw && fs.existsSync('.' + draw)) {
        var image = addImage(workbook, draw);
        sheet.addImage(image, getDimension('.' + draw, 19, 33, 42, 54, 39, 29));
      }
    }
  }
  function write_construct_externals(sheet, report, sheetNo) {
    var row = 21;
    var limit = 5;
    report.construct.externals.forEach((exter, index) => {
      if (row <= 25 && checkSheet(sheetNo, limit, index)) {
        sheet.getCell('B' + row).value = 'No.' + exter.number;
        sheet.getCell('D' + row).value = exter.lineage_name;
        sheet.getCell('H' + row).value = exter.old_maker;
        sheet.getCell('L' + row).value = exter.old_model;
        sheet.getCell('Q' + row).value = exter.old_serial;

        sheet.getCell('V' + row).value = exter.new_maker;
        sheet.getCell('Z' + row).value = exter.new_model;
        sheet.getCell('AE' + row).value = exter.new_serial;
        row++;
      }
    });

    row = 35;
    report.construct.externals.forEach((exter, index) => {
      if (row <= 39 && checkSheet(sheetNo, limit, index)) {
        sheet.getCell('B' + row).value = exter.target;
        sheet.getCell('C' + row).value = 'No.' + exter.number;
        sheet.getCell('E' + row).value = exter.old_spec;
        sheet.getCell('H' + row).value = exter.new_spec;
        sheet.getCell('K' + row).value = exter.recovery_refrigerant_kind;
        sheet.getCell('M' + row).value = fixDecimal(exter.recovery_amount, 2);

        sheet.getCell('Q' + row).value = exter.specified_refrigerant_kind;
        sheet.getCell('T' + row).value = fixDecimal(exter.specified_amount, 2);
        sheet.getCell('X' + row).value = fixDecimal(exter.filling_amount, 2);
        sheet.getCell('AC' + row).value = exter.remarks;

        row++;
      }
    });
  }
  function write_construct_internals(sheet, report, sheetNo) {
    var limit = 5;
    var row = 27;
    report.construct.internals.forEach((inter, index) => {
      if (row <= 31 && checkSheet(sheetNo, limit, index)) {
        sheet.getCell('B' + row).value = 'No.' + inter.number;
        sheet.getCell('D' + row).value = inter.lineage_name;
        sheet.getCell('H' + row).value = inter.old_maker;
        sheet.getCell('L' + row).value = inter.old_model;
        sheet.getCell('Q' + row).value = inter.old_serial;

        sheet.getCell('V' + row).value = inter.new_maker;
        sheet.getCell('Z' + row).value = inter.new_model;
        sheet.getCell('AE' + row).value = inter.new_serial;

        row++;
      }
    });

    row = 42;
    report.construct.internals.forEach((inter, index) => {
      if (row <= 46 && checkSheet(sheetNo, limit, index)) {
        sheet.getCell('C' + row).value = 'No.' + inter.number;
        sheet.getCell('E' + row).value = four_taps(inter.pressure_test);
        sheet.getCell('G' + row).value = four_taps(inter.Water_flow);
        sheet.getCell('I' + row).value = four_taps(inter.test);

        sheet.getCell('K' + row).value = fixDecimal(inter.suction_temperature);
        sheet.getCell('O' + row).value = fixDecimal(inter.blowing_temperature);
        row++;
      }
    });
  }
  function write_summary(sheet, summary, sheetNo) {
    var limit = 5;
    var row = 12;
    summary.forEach((content, index) => {
      if (row <= 16 && checkSheet(sheetNo, limit, index)) {
        sheet.getCell('B' + row).value = content;
        row++;
      }
    });
  }
  function write_other_note(sheet, other_note, sheetNo) {
    var limit = 5;
    var row = 48;
    other_note.forEach((content, index) => {
      if (row <= 52 && checkSheet(sheetNo, limit, index)) {
        sheet.getCell('B' + row).value = content;
        row++;
      }
    });
  }
}

function four_taps(value) {
  var result = _.find(CONFIG.four_taps, { id: value });
  if (result) {
    return result.value;
  }
  return '';
}

function addImage(workbook, filename) {
  return workbook.addImage({
    filename: '.' + filename,
    extension: path.extname(filename).substr(1)
  });
}

function getDimension(filename, colS, colE, rowS, rowE, widthCol, heightRow) {
  rowS = rowS - 1;
  rowE = rowE - 1;
  var dimensions = sizeOf(filename);
  var width = dimensions.width;
  var height = dimensions.height;
  var maxWidth = (colE - colS) * widthCol;
  var maxHeight = (rowE - rowS) * heightRow;
  var imageObj = { width: maxWidth, height: maxHeight };
  var isBaseMaxWidth = false;

  if (width > height) {
    imageObj.width = maxWidth;
    imageObj.height = maxWidth * height / width;
    isBaseMaxWidth = true;
    if (imageObj.height > maxHeight) {
      imageObj.width = maxHeight * width / height;
      imageObj.height = maxHeight;
      isBaseMaxWidth = false;
    }
  } else {
    imageObj.width = maxHeight * width / height;
    imageObj.height = maxHeight;
    isBaseMaxWidth = false;
    if (imageObj.width > maxWidth) {
      imageObj.width = maxWidth;
      imageObj.height = maxWidth * height / width;
      isBaseMaxWidth = true;
    }
  }

  var totalCol = imageObj.width / widthCol;
  var totalRow = imageObj.height / heightRow;
  var cotdu = 0;
  if (!isBaseMaxWidth) {
    var du = (maxWidth - imageObj.width);
    cotdu = Math.floor(du / widthCol / 2);
  }

  rowE = rowS + totalRow;
  colS = colS + cotdu;
  colE = colS + totalCol;
  return {
    tl: { col: colS, row: rowS },
    br: { col: colE, row: rowE }
  };
}


function fixDecimal(value, maxDecimal) {
  if (!maxDecimal) {
    maxDecimal = 1;
  }
  if (!value) {
    value = '0';
  }
  return parseFloat(value).toFixed(maxDecimal);
}
