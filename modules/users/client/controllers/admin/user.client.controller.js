(function () {
  'use strict';

  angular
    .module('users.admin')
    .controller('UserController', UserController);

  UserController.$inject = ['$scope', '$state', 'userResolve'];

  function UserController($scope, $state, user) {
    var vm = this;
    vm.user = user;
    vm.update = update;
    vm.isContextUserSelf = isContextUserSelf;
    function update(isValid) {
      $scope.handleShowConfirm({
        message: 'このアカウントを保存します。よろしいですか？'
      }, function () {
        if (!isValid) {
          vm.isSaveClick = true;
          $scope.$broadcast('show-errors-check-validity', 'vm.userForm');
          return false;
        }
        vm.user.roles = 'admin';
        vm.user.createOrUpdate()
          .then(successCallback)
          .catch(errorCallback);

        function successCallback(res) {
          $state.go('admin.users.list');
          $scope.handleShowToast('このアカウントの保存が完了しました。');
        }

        function errorCallback(res) {
          var message = (res) ? res.message || res.data.message : 'アカウントの保存が失敗しました。';
          $scope.handleShowToast(message, true);
        }
      });
    }

    function isContextUserSelf() {
      return vm.user.username === vm.authentication.user.username;
    }
  }
}());
