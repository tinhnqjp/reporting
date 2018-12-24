(function () {
  'use strict';

  angular
    .module('reports.admin')
    .controller('ReportListController', ReportListController);

  ReportListController.$inject = ['$scope', 'ReportsService', 'ReportsApi', '$window', '$location'];

  function ReportListController($scope, ReportsService, ReportsApi, $window, $location) {
    var vm = this;
    onCreate();

    function onCreate() {
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
          vm.condition.total = res.total;
          $scope.conditionFactoryUpdate('reports', vm.condition);
        })
        .error(function (err) {
          $scope.handleCloseWaiting();
          var message = (err) ? err.message || err.data.message : '部署の取得が失敗しました。';
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
        message: 'この部署を削除します。よろしいですか？'
      }, function () {
        var report = new ReportsService({ _id: _id });
        report.$remove(function () {
          handleSearch();
          $scope.handleShowToast('部署の削除が完了しました。');
        });
      });
    };
  }
}());
