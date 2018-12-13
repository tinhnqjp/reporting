(function () {
  'use strict';

  angular
    .module('users')
    .controller('ChangePasswordController', ChangePasswordController);

  ChangePasswordController.$inject = ['$scope', 'UsersService', 'PasswordValidator', 'Notification'];

  function ChangePasswordController($scope, UsersService, PasswordValidator, Notification) {
    var vm = this;

    vm.handleChangePassword = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.passwordForm');
        return false;
      }

      UsersService.changePassword(vm.passwordDetails)
        .then(function (response) {
          $scope.handleShowToast('パスワードを変更しました。');
          vm.passwordDetails = null;
        })
        .catch(function (response) {
          $scope.handleShowToast(response.data.message, true);
        });
    };
  }
}());
