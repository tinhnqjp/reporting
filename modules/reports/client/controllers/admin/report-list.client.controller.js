(function () {
  'use strict';

  angular
    .module('reports.admin')
    .controller('ReportListController', ReportListController);

  ReportListController.$inject = ['$scope', 'ReportsService', 'ReportsApi', 'UnitsApi', '$location'];

  function ReportListController($scope, ReportsService, ReportsApi, UnitsApi, $location) {
    var vm = this;
    onCreate();

    function onCreate() {
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
    vm.handleConditionChanged = function (changed) {
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
  }
}());
