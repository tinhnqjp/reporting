(function () {
  'use strict';

  angular
    .module('units.admin')
    .controller('WorkerPetitionListController', WorkerPetitionListController);

  WorkerPetitionListController.$inject = ['$scope', 'PetitionService', 'PetitionApi', '$window', '$location'];

  function WorkerPetitionListController($scope, PetitionService, PetitionApi, $window, $location) {
    var vm = this;
    onCreate();

    function onCreate() {
      prepareCondition(false);
      handleSearch();
    }

    function prepareCondition(clear) {
      vm.condition = $scope.prepareCondition('petition', clear);
    }

    function handleSearch() {
      $scope.handleShowWaiting();
      PetitionApi.list(vm.condition)
        .success(function (res) {
          $scope.handleCloseWaiting();
          vm.docs = res.docs;
          vm.condition.count = res.docs ? res.docs.length : 0;
          vm.condition.page = res.page;
          vm.condition.total = res.totalPages;
          $scope.conditionFactoryUpdate('petition', vm.condition);
        })
        .error(function (err) {
          $scope.handleCloseWaiting();
          var message = (err) ? err.message || err.data.message : '申請の取得が失敗しました。';
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
        message: 'この申請を削除します。よろしいですか？'
      }, function () {
        var petion = new PetitionService({ _id: _id });
        petion.$remove(function () {
          handleSearch();
          $scope.handleShowToast('申請の削除が完了しました。');
        });
      });
    };
  }
}());
