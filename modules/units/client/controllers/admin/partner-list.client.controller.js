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
          vm.condition.total = res.total;
          $scope.conditionFactoryUpdate('partner', vm.condition);
        })
        .error(function (err) {
          $scope.handleCloseWaiting();
          var message = (err) ? err.message || err.data.message : '協力者の取得が失敗しました！';
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

    vm.handleExportExcel = function () {
      $scope.handleShowConfirm({
        message: '現在のデータ（' + vm.total + '件）をエクスポートしてます。よろしいでしょうか？'
      }, function () {
        $scope.handleShowWaiting();
        PartnerApi.export(vm.condition)
          .success(function (res) {
            $scope.handleCloseWaiting();
            var protocol = $location.protocol();
            var host = $location.host();
            var port = $location.port();
            var url = protocol + '://' + host + ((port !== '') ? (':' + port) : '') + '/' + res.url;
            $window.open(url, '_blank');
          })
          .error(function (err) {
            $scope.handleCloseWaiting();
            var message = (err) ? err.message || err.data.message : '現在のデータのエクスポートが失敗しました！';
            $scope.handleShowToast(message, true);
          });
      });
    };

    vm.remove = function (_id) {
      $scope.handleShowConfirm({
        message: 'この協力者を削除します。よろしいですか？'
      }, function () {
        var unit = new PartnerService({ _id: _id });
        unit.$remove(function () {
          handleSearch();
          $scope.handleShowToast('協力者の削除が完了しました。');
        });
      });
    };
  }
}());
