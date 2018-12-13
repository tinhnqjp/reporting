'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  fs = require('fs'),
  dateFormat = require('dateformat'),
  moment = require('moment');

exports.setValue = function (worksheet, row, col, value, horizontal = 'left') {
  // define
  var borderTable = {
    top: { style: 'thin', color: { argb: '000000' } },
    bottom: { style: 'thin', color: { argb: '000000' } },
    right: { style: 'thin', color: { argb: '000000' } },
    left: { style: 'thin', color: { argb: '000000' } }
  };
  var fontBody = { name: 'メイリオ', size: 11, bold: false };
  var normalStyle = { vertical: 'middle', horizontal: horizontal, wrapText: true };
  // setting
  var rowObj = worksheet.getRow(row);
  rowObj.getCell(col).style = {};
  rowObj.getCell(col).border = borderTable;
  rowObj.getCell(col).font = fontBody;
  rowObj.getCell(col).alignment = normalStyle;
  rowObj.getCell(col).value = value;

  rowObj.commit();
};

/**
 * delete Old File
 */
exports.deleteOldFile = function (existingFileUrl) {
  return new Promise(function (resolve, reject) {
    if (existingFileUrl) {
      fs.unlink(path.resolve(existingFileUrl), function (unlinkError) {
        if (unlinkError) {
          // If file didn't exist, no need to reject promise
          if (unlinkError.code === 'ENOENT') {
            console.log('Removing image failed because file did not exist.');
            return resolve();
          }
          resolve();
        } else {
          resolve();
        }
      });
    } else {
      resolve();
    }

  });
};

/** export Excel */
exports.excelExport = function (dataExcel, path, name) {
  return new Promise(function (resolve, reject) {
    // init
    const FILE_EXCEL = '.xlsx';
    var strtime = dateFormat(new Date(), 'yyyymmddhhMMss');
    var excelFileName = path + name + '_' + strtime + FILE_EXCEL;

    // excel.writeToStream(fs.createWriteStream(excelFileName), dataExcel, { headers: true })
    //   .on('error', function (error) {
    //     reject(error);
    //   })
    //   .on('finish', function () {
    //     resolve({ excelFileName: excelFileName });
    //   });
  });
};

exports.formatDate = function (datetime, type) {
  if (!datetime) {
    return '';
  }

  moment.locale('ja');
  if (type === 1) {
    // yyyy年mm月dd日 hh:MM
    return moment(datetime).format('LLL');
  } else {
    // yyyy年mm月dd日 hh:MM:ss
    var date = moment(datetime);
    return date.format('ll') + ' ' + date.format('LTS');
  }
};
