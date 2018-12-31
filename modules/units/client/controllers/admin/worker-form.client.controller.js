(function () {
  'use strict';

  angular
    .module('units.admin')
    .controller('WorkerFormController', WorkerFormController);

  WorkerFormController.$inject = ['$scope', '$state', 'workerResolve', 'PartnerService', 'petitionResolve'];

  function WorkerFormController($scope, $state, worker, PartnerService, petition) {
    var vm = this;
    vm.worker = worker;
    vm.petition = petition;
    vm.update = update;
    vm.password = null;
    onCreate();
    function onCreate() {
      PartnerService.query(function (data) {
        vm.partners = data;

        if (vm.worker.partner) {
          vm.worker.partner = _.find(vm.partners, { '_id': vm.worker.partner._id });
        }
      });
      if (!vm.worker._id) {
        vm.password = $scope.generateRandomPassphrase();
      }
      if (vm.petition._id) {
        vm.worker.name = vm.petition.name;
        vm.worker.phone = vm.petition.phone;
        vm.worker.manager = vm.petition.manager;
        vm.worker.partner = vm.petition.partner;
        vm.worker.petition = vm.petition._id;
      }
    }

    function update(isValid) {
      if (!isValid) {
        vm.isSaveClick = true;
        $scope.$broadcast('show-errors-check-validity', 'vm.workerForm');
        return false;
      }
      $scope.handleShowConfirm({
        message: 'この下請けを保存します。よろしいですか？'
      }, function () {
        if (vm.password) {
          vm.worker.account.password = vm.password;
        }
        vm.worker.createOrUpdate()
          .then(successCallback)
          .catch(errorCallback);

        function successCallback(res) {
          $state.go('admin.workers.detail', { workerId: vm.worker._id });
          $scope.handleShowToast('この下請けの保存が完了しました。');
        }

        function errorCallback(res) {
          var message = (res) ? res.message || res.data.message : '下請けの保存が失敗しました。';
          $scope.handleShowToast(message, true);
        }
      });
    }

    vm.randomPass = function () {
      vm.password = $scope.generateRandomPassphrase();
    };
  }

}());
