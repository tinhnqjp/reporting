(function () {
  'use strict';

  angular
    .module('users.admin')
    .controller('OperatorController', OperatorController);

  OperatorController.$inject = ['$scope', '$state', 'userResolve'];

  function OperatorController($scope, $state, user) {
    var vm = this;
    vm.user = user;
    vm.update = update;

    function update(isValid) {
      $scope.handleShowConfirm({
        message: 'このアカウントを保存します。よろしいですか？'
      }, function () {
        if (!isValid) {
          vm.isSaveClick = true;
          $scope.$broadcast('show-errors-check-validity', 'vm.userForm');
          return false;
        }
        vm.user.roles = ['operator'];
        vm.user.createOrUpdate()
          .then(successCallback)
          .catch(errorCallback);

        function successCallback(res) {
          $state.go('admin.operators.list');
          $scope.handleShowToast('このアカウントの保存が完了しました。');
        }

        function errorCallback(res) {
          var message = (res) ? res.message || res.data.message : 'アカウントの保存が失敗しました。';
          $scope.handleShowToast(message, true);
        }
      });
    }
  }
}());
