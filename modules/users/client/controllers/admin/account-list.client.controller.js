(function () {
  'use strict';

  angular
    .module('users.admin')
    .controller('AccountListController', AccountListController);

  AccountListController.$inject = ['$scope', 'AdminService', 'UsersApi', '$window', '$location', '$http'];

  function AccountListController($scope, AdminService, UsersApi, $window, $location, $http) {
    var vm = this;
    onCreate();

    function onCreate() {
      prepareCondition(false);
      handleSearch();
    }

    function prepareCondition(clear) {
      vm.condition = $scope.prepareCondition('admin', clear);
      vm.condition.roles = _.map($scope.roles, 'id');
    }

    function handleSearch() {
      $scope.handleShowWaiting();
      UsersApi.list(vm.condition)
        .success(function (res) {
          $scope.handleCloseWaiting();
          vm.docs = res.docs;
          vm.condition.count = res.docs.length;
          vm.condition.page = res.page;
          vm.condition.total = res.totalPages;
          $scope.conditionFactoryUpdate('admin', vm.condition);
        })
        .error(function (err) {
          $scope.handleCloseWaiting();
          var message = (err) ? err.message || err.data.message : 'アカウントの取得が失敗しました。';
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
        UsersApi.export(vm.condition)
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
            var message = (err) ? err.message || err.data.message : '現在のデータのエクスポートが失敗しました。';
            $scope.handleShowToast(message, true);
          });
      });
    };

    vm.remove = function (_id) {
      $scope.handleShowConfirm({
        message: 'このアカウントを削除します。よろしいですか？'
      }, function () {
        var user = new AdminService({ _id: _id });
        user.$remove(function () {
          handleSearch();
          $scope.handleShowToast('アカウントの削除が完了しました。');
        });
      });
    };

    vm.test = function () {
      $http.post('/api/users/testTransaction', null, {});
    };
  }
}());
