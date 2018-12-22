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
    var out = '全 ' + condition.total + ' 件';
    var min = ((condition.page - 1) * condition.limit) + 1;
    var max = min + condition.count - 1;
    out += '中 ' + min + ' 件目 〜 ' + max + ' 件目を表示';

    return out;
  };

  $scope.picker = {
    created_min: { open: false },
    created_max: { open: false }
  };
  $scope.openCalendar = function (e, picker) {
    $scope.picker[picker].open = true;
  };


}
