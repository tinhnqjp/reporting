(function () {
  'use strict';

  angular
    .module('reports.admin')
    .controller('ReportListController', ReportListController);

  ReportListController.$inject = ['$scope', 'ReportsService', 'ReportsApi', 'UnitsApi', '$state'];

  function ReportListController($scope, ReportsService, ReportsApi, UnitsApi, $state) {
    var vm = this;
    vm.showUnit = true;
    onCreate();

    function onCreate() {
      if ($scope.Authentication.user.roles[0] === 'employee') {
        vm.showUnit = false;
      }
      UnitsApi.units()
        .success(function (res) {
          vm.units = res;
          vm.units.unshift({
            _id: 'null',
            name: '未入力'
          });
        })
        .error(function (err) {
          var message = (err) ? err.message || err.data.message : '報告書の取得が失敗しました。';
          $scope.handleShowToast(message, true);
        });

      ReportsApi.config()
        .success(function (res) {
          if (res.config) {
            vm.configs = res.config;
          }
        })
        .error(function (err) {
          var message = (err) ? err.message || err.data.message : '報告書の取得が失敗しました。';
          $scope.handleShowToast(message, true);
        });
      prepareCondition(false);
      handleSearch();
    }

    function prepareCondition(clear) {
      vm.condition = $scope.prepareCondition('reports', clear);
    }

    function handleSearch() {
      $scope.handleShowWaiting();
      ReportsApi.list(vm.condition)
        .success(function (res) {
          $scope.handleCloseWaiting();
          vm.docs = res.docs;
          vm.condition.count = res.docs.length;
          vm.condition.page = res.page;
          vm.condition.total = res.totalDocs;
          $scope.conditionFactoryUpdate('reports', vm.condition);
        })
        .error(function (err) {
          $scope.handleCloseWaiting();
          var message = (err) ? err.message || err.data.message : '報告書の取得が失敗しました。';
          $scope.handleShowToast(message, true);
        });
    }

    /** start handle search, sort & paging */
    vm.handleConditionChange = function () {
      vm.isChanged = true;
    };
    vm.handleConditionChanged = function (changed, key, old) {
      if (!changed && (key === 'start_max' || key === 'end_max' || key === 'created_max')) {
        if (old) {
          var valNew = moment(vm.condition[key]);
          var valOld = moment(old);
          if (valNew.format('YYYYMMDD') !== valOld.format('YYYYMMDD')) {
            vm.condition[key] = valNew.hour(23).minute(59).second(59).toDate();
          }
        } else {
          console.log('default');
          vm.condition[key] = moment(vm.condition[key]).hour(23).minute(59).second(59).toDate();
        }
      }

      if (changed || vm.isChanged) {
        vm.isChanged = false;
        vm.condition.page = 1;
        handleSearch();
      }
    };
    vm.handlePageChanged = function () {
      handleSearch();
    };
    vm.handleClearCondition = function () {
      prepareCondition(true);
      handleSearch();
    };
    vm.handleSortChanged = function (sort_column) {
      vm.condition = $scope.handleSortChanged(vm.condition, sort_column);
      handleSearch();
    };
    /** end handle search, sort & paging */

    vm.remove = function (_id) {
      $scope.handleShowConfirm({
        message: 'この報告書を削除します。よろしいですか？'
      }, function () {
        var report = new ReportsService({ _id: _id });
        report.$remove(function () {
          handleSearch();
          $scope.handleShowToast('報告書の削除が完了しました。');
        });
      });
    };

    vm.goReportEdit = function (kind, id) {
      switch (kind) {
        case 1:
          $state.go('admin.reports.clean_edit', { reportId: id });
          break;
        case 2:
          $state.go('admin.reports.repair_edit', { reportId: id });
          break;
        case 4:
          $state.go('admin.reports.picture_edit', { reportId: id });
          break;
      }
    };

    vm.goReportDetail = function (kind, id) {
      switch (kind) {
        case 1:
          $state.go('admin.reports.clean_detail', { reportId: id });
          break;
        case 2:
          $state.go('admin.reports.repair_detail', { reportId: id });
          break;
        case 4:
          $state.go('admin.reports.picture_detail', { reportId: id });
          break;
      }
    };
  }
}());
