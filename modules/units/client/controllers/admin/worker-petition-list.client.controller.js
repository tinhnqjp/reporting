(function () {
  'use strict';

  angular
    .module('units.admin')
    .controller('WorkerPetitionListController', WorkerPetitionListController);

  WorkerPetitionListController.$inject = ['$scope', 'PetitionService', 'PetitionApi', 'WorkerApi', 'actionResolve'];

  function WorkerPetitionListController($scope, PetitionService, PetitionApi, WorkerApi, action) {
    var vm = this;
    vm.action = action;
    onCreate();

    function onCreate() {
      prepareCondition(false);
      handleSearch();
    }

    function prepareCondition(clear) {
      vm.condition = $scope.prepareCondition('petition', clear);
      vm.condition.action = vm.action;
    }

    function handleSearch() {
      $scope.handleShowWaiting();
      PetitionApi.list(vm.condition)
        .success(function (res) {
          $scope.handleCloseWaiting();
          vm.docs = res.docs;
          vm.condition.count = res.docs ? res.docs.length : 0;
          vm.condition.page = res.page;
          vm.condition.total = res.totalDocs;
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
    vm.handleConditionChanged = function (changed, key, old) {
      if (!changed && (key === 'created_max')) {
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
        message: 'この申請を削除します。よろしいですか？'
      }, function () {
        var petion = new PetitionService({ _id: _id });
        petion.$remove(function () {
          handleSearch();
          $scope.handleShowToast('申請の削除が完了しました。');
        });
      });
    };

    vm.petitionDelete = function (workerId, petitionId) {
      $scope.handleShowConfirm({
        message: 'この下請けを削除します。よろしいですか？'
      }, function () {
        WorkerApi.deletePetition(workerId, petitionId)
          .success(function (res) {
            handleSearch();
            $scope.handleShowToast('申請の削除が完了しました。');
          })
          .error(function (err) {
            var message = (err) ? err.message || err.data.message : '申請の取得が失敗しました。';
            $scope.handleShowToast(message, true);
          });
      });
    };
  }
}());
