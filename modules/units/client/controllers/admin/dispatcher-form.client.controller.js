(function () {
  'use strict';

  angular
    .module('units.admin')
    .controller('DispatcherFormController', DispatcherFormController);

  DispatcherFormController.$inject = ['$scope', '$state', 'dispatcherResolve'];

  function DispatcherFormController($scope, $state, dispatcher) {
    var vm = this;
    vm.dispatcher = dispatcher;
    vm.update = update;

    function update(isValid) {
      $scope.handleShowConfirm({
        message: 'この食べ物を保存します。よろしいですか？'
      }, function () {
        if (!isValid) {
          vm.isSaveClick = true;
          $scope.$broadcast('show-errors-check-validity', 'vm.dispatcherForm');
          return false;
        }
        vm.dispatcher.createOrUpdate()
          .then(successCallback)
          .catch(errorCallback);

        function successCallback(res) {
          $state.go('admin.dispatchers.list');
          $scope.handleShowToast('この食べ物の保存が完了しました。');
        }

        function errorCallback(res) {
          var message = (res) ? res.message || res.data.message : '食べ物の保存が失敗しました！';
          $scope.handleShowToast(message, true);
        }
      });
    }
  }
}());
