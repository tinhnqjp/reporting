'use strict';

angular.module('core').controller('AppController', AppController);

AppController.$inject = ['$scope', '$state', '$stateParams', 'Authentication', 'ngDialog', 'Notification', 'ConditionFactory'];

function AppController($scope, $state, $stateParams, Authentication, ngDialog, Notification, ConditionFactory) {
  $scope.Authentication = Authentication;
  $scope.NO_IMAGE_PATH = '/modules/core/client/img/no-image.jpg';
  $scope.NO_VIDEO_PATH = '/modules/core/client/img/video-default.png';
  $scope.formatDate = 'yyyy/MM/dd';
  $scope.itemsPerPage = 20;
  $scope.regexKana = /^[\u3040-\u309f]*$/;
  $scope.regexPass = /^[A-Za-z0-9]*$/;

  /** roles */
  $scope.roles = [
    { id: 'admin', name: 'システム管理', class: 'label-danger' },
    { id: 'operator', name: 'オペレーター', class: 'label-warning' },
    { id: 'bsoperator', name: '営業者', class: 'label-info' },
    { id: 'dispatcher', name: '手配者', class: 'label-success' },
    { id: 'employee', name: '一般社員', class: 'label-primary' }
    // { id: 'partner', name: '協力業者' },
    // { id: 'user', name: '下請け' }
  ];

  // 状態 1: 提出 - 2: 確認済 - 3: 承認済 - 4: 確定済
  /** report status */
  $scope.reportStatus = [
    { id: 1, name: '状態', class: 'label-danger' },
    { id: 2, name: '確認済', class: 'label-warning' },
    { id: 3, name: '承認済', class: 'label-info' },
    { id: 4, name: '確定済', class: 'label-success' }
  ];
  // 1: 洗浄 - 2: 修理 - 3: 設置 - 4: 写真 - 5: フリ
  $scope.reportKind = [
    { id: 1, name: '洗浄', class: 'label-danger' },
    { id: 2, name: '修理', class: 'label-warning' },
    { id: 3, name: '設置', class: 'label-info' },
    { id: 4, name: '写真', class: 'label-success' },
    { id: 5, name: 'フリ', class: 'label-primary' }
  ];

  $scope.handleBackScreen = function (state) {
    $state.go($state.previous.state.name || state, ($state.previous.state.name) ? $state.previous.params : {});
  };

  // // Hiển thị thông báo bình thường
  $scope.handleShowToast = function (msg, error) {
    if (error)
      return Notification.error({ message: msg + '', title: '<i class="glyphicon glyphicon-remove"></i> エラー: ' });
    return Notification.success({ message: msg, title: '<i class="glyphicon glyphicon-ok"></i> 完了' });
  };

  // Hiển thị confirm xác nhận
  $scope.handleShowConfirm = function (content, resolve, reject) {
    $scope.dialog = content;
    ngDialog.openConfirm({
      templateUrl: 'confirmTemplate.html',
      scope: $scope,
      showClose: false
    }).then(function (res) {
      delete $scope.dialog;
      if (resolve) {
        resolve(res);
      }
    }, function (res) {
      delete $scope.dialog;
      if (reject) {
        reject(res);
      }
    });
  };

  $scope.handleShowDownload = function (content, resolve, reject) {
    $scope.dialog = content;
    ngDialog.openConfirm({
      templateUrl: 'downloadTemplate.html',
      scope: $scope,
      showClose: false
    }).then(function (res) {
      delete $scope.dialog;
      if (resolve) {
        resolve(res);
      }
    }, function (res) {
      delete $scope.dialog;
      if (reject) {
        reject(res);
      }
    });
  };

  $scope.handleTextInput = function (content, resolve, reject) {
    $scope.dialog = content;
    ngDialog.openConfirm({
      templateUrl: 'textInputTemplate.html',
      scope: $scope,
      showClose: false
    }).then(function (res) {
      delete $scope.dialog;
      if (resolve) {
        resolve(res);
      }
    }, function (res) {
      delete $scope.dialog;
      if (reject) {
        reject(res);
      }
    });
  };

  $scope.handleShowWaiting = function () {
    $scope.dialog = {};
    $scope.dialog = ngDialog.open({
      templateUrl: 'waitingDialog.html',
      scope: $scope,
      closeByDocument: false,
      showClose: false
    });
  };

  $scope.handleCloseWaiting = function () {
    if ($scope.dialog) $scope.dialog.close();
  };

  $scope.generateRandomPassphrase = function () {
    var password = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 8; i++) {
      password += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return password;
  };

  // page
  $scope.getPageTitle = function () {
    return $state.current.data.pageTitle;
  };

  $scope.parseDate = function (date) {
    try {
      date = new Date(date);
    } catch (err) {
      // console.log(err);
    }
    return date;
  };

  $scope.noIndex = function (currentPage, itemsPerPage, index) {
    return ((currentPage - 1) * itemsPerPage) + index + 1;
  };

  $scope.getImageDefault = function (image) {
    if (!image) {
      return $scope.NO_IMAGE_PATH;
    } else {
      return image;
    }
  };

  $scope.prepareCondition = function (module, clear, condition) {
    if (!clear && ConditionFactory.get(module)) {
      condition = ConditionFactory.get(module);
    } else {
      if (!condition) {
        condition = {};
      }
      if (!condition.limit) {
        condition.limit = $scope.itemsPerPage;
      }
      if (!condition.sort_column) {
        condition.sort_column = 'created';
      }
      if (!condition.sort_direction) {
        condition.sort_direction = '-';
      }
      if (!condition.page) {
        condition.page = 1;
      }
      ConditionFactory.set(module, condition);
    }

    return condition;
  };

  $scope.handleSortChanged = function (condition, sort_column) {
    if (condition.sort_column === sort_column) {
      if (condition.sort_direction === '-') {
        condition.sort_direction = '+';
      } else {
        condition.sort_direction = '-';
      }
    } else {
      condition.sort_column = sort_column;
      condition.sort_direction = '-';
    }
    condition.page = 1;

    return condition;
  };

  $scope.conditionFactoryUpdate = function (module, condition) {
    ConditionFactory.update(module, condition);
  };

  $scope.tableIndex = function (condition, index) {
    return ((condition.page - 1) * condition.limit) + index + 1;
  };

  $scope.tableReport = function (condition) {
    var total = condition.total ? condition.total : 0;
    var page = condition.page ? condition.page : 0;
    var count = condition.count ? condition.count : 0;
    var out = '全 ' + total + ' 件';
    if (total > 0) {
      var min = ((page - 1) * condition.limit) + 1;
      var max = min + count - 1;
      out += '中 ' + min + ' 件目 〜 ' + max + ' 件目を表示';
    }

    return out;
  };

  $scope.picker = {
    created_min: { open: false },
    created_max: { open: false },
    start: { open: false },
    end: { open: false },
    work_start: { open: false },
    work_end: { open: false }
  };
  $scope.openCalendar = function (e, picker) {
    $scope.picker[picker].open = true;
  };


}
