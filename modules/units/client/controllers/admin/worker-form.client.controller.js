(function () {
  'use strict';

  angular
    .module('units.admin')
    .controller('WorkerFormController', WorkerFormController);

  WorkerFormController.$inject = ['$scope', '$state', 'workerResolve', 'PartnerService'];

  function WorkerFormController($scope, $state, worker, PartnerService) {
    var vm = this;
    vm.worker = worker;
    vm.update = update;

    onCreate();
    function onCreate() {
      PartnerService.query(function (data) {
        vm.partners = data;
        if (vm.worker.partner) {
          vm.worker.partner = _.find(vm.partners, { '_id': vm.worker.partner });
        }
      });
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
        vm.worker.createOrUpdate()
          .then(successCallback)
          .catch(errorCallback);

        function successCallback(res) {
          $state.go('admin.workers.detail', { workerId: vm.worker._id });
          $scope.handleShowToast('この下請けの保存が完了しました。');
        }

        function errorCallback(res) {
          var message = (res) ? res.message || res.data.message : '下請けの保存が失敗しました！';
          $scope.handleShowToast(message, true);
        }
      });
    }
  }

}());
