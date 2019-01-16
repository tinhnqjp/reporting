(function () {
  'use strict';

  angular
    .module('units.admin')
    .controller('PartnerListController', PartnerListController);

  PartnerListController.$inject = ['$scope', 'PartnerService', 'PartnerApi', '$window', '$location'];

  function PartnerListController($scope, PartnerService, PartnerApi, $window, $location) {
    var vm = this;
    onCreate();

    function onCreate() {
      prepareCondition(false);
      handleSearch();
    }

    function prepareCondition(clear) {
      vm.condition = $scope.prepareCondition('partner', clear);
      vm.condition.roles = 'partner';
    }

    function handleSearch() {
      $scope.handleShowWaiting();
      PartnerApi.list(vm.condition)
        .success(function (res) {
          $scope.handleCloseWaiting();
          vm.docs = res.docs;
          vm.condition.count = res.docs.length;
          vm.condition.page = res.page;
          vm.condition.total = res.totalDocs;
          $scope.conditionFactoryUpdate('partner', vm.condition);
        })
        .error(function (err) {
          $scope.handleCloseWaiting();
          var message = (err) ? err.message || err.data.message : '協力会社の取得が失敗しました。';
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
        message: 'この協力会社を削除します。よろしいですか？'
      }, function () {
        var unit = new PartnerService({ _id: _id });
        unit.$remove(function () {
          handleSearch();
          $scope.handleShowToast('協力会社の削除が完了しました。');
        });
      });
    };

  }
}());
