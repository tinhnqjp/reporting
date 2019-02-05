(function () {
  'use strict';

  angular
    .module('units.admin')
    .controller('PartnerDetailController', PartnerDetailController);

  PartnerDetailController.$inject = ['$scope', '$state', 'partnerResolve', 'WorkerService', 'WorkerApi'];

  function PartnerDetailController($scope, $state, partner, WorkerService, WorkerApi) {
    var vm = this;
    vm.partner = partner;

    onCreate();

    function onCreate() {
      prepareCondition(false);
      handleSearch();
    }

    function prepareCondition(clear) {
      vm.condition = {
        limit: $scope.itemsPerPage,
        sort_column: 'created',
        sort_direction: '-',
        page: 1
      };

      vm.condition.roles = 'worker';
      vm.condition.partner = vm.partner._id;
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
    vm.handleConditionChanged = function (changed, key, old) {
      if (!changed && (key === 'created_max' || key === 'last_login_max')) {
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
