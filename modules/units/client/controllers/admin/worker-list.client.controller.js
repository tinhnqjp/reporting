(function () {
  'use strict';

  angular
    .module('units.admin')
    .controller('WorkerListController', WorkerListController);

  WorkerListController.$inject = ['$scope', 'WorkerService', 'WorkerApi', 'PartnerService'];

  function WorkerListController($scope, WorkerService, WorkerApi, PartnerService) {
    var vm = this;
    vm.workerList = true;
    onCreate();

    function onCreate() {
      PartnerService.query(function (data) {
        vm.partners = data;
      });

      prepareCondition(false);
      handleSearch();
    }

    function prepareCondition(clear) {
      vm.condition = $scope.prepareCondition('worker', clear);
      vm.condition.roles = 'worker';
    }

    function handleSearch() {
      $scope.handleShowWaiting();
      WorkerApi.list(vm.condition)
        .success(function (res) {
          $scope.handleCloseWaiting();
          vm.docs = res.docs;
          vm.condition.count = res.docs ? res.docs.length : 0;
          vm.condition.page = res.page;
          vm.condition.total = res.totalDocs;
          $scope.conditionFactoryUpdate('worker', vm.condition);
        })
        .error(function (err) {
          $scope.handleCloseWaiting();
          var message = (err) ? err.message || err.data.message : '下請けの取得が失敗しました。';
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
        message: 'この下請けを削除します。よろしいですか？'
      }, function () {
        var worker = new WorkerService({ _id: _id });
        worker.$remove(function () {
          handleSearch();
          $scope.handleShowToast('下請けの削除が完了しました。');
        });
      });
    };
  }
}());
