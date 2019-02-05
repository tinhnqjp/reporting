(function () {
  'use strict';

  angular
    .module('users.admin')
    .controller('AccountController', AccountController);

  AccountController.$inject = ['$scope', '$state', 'userResolve', 'UnitsService'];

  function AccountController($scope, $state, user, UnitsService) {
    var vm = this;
    vm.user = user;
    vm.update = update;
    onCreate();

    function onCreate() {
      if (vm.user._id && vm.user.roles) {
        vm.role = vm.user.roles[0];
      } else {
        vm.user.roles = [];
        vm.role = 'employee';
      }

      UnitsService.query(function (data) {
        vm.units = data;
        if (vm.user.unit) {
          vm.user.unit = _.find(vm.units, { '_id': vm.user.unit._id });
        }
      });

    }

    function update(isValid) {
      if (!isValid) {
        vm.isSaveClick = true;
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');
        return false;
      }
      $scope.handleShowConfirm({
        message: 'このアカウントを保存します。よろしいですか？'
      }, function () {

        vm.user.roles[0] = vm.role;
        vm.user.createOrUpdate()
          .then(successCallback)
          .catch(errorCallback);

        function successCallback(res) {
          $state.go('admin.users.detail', { userId: vm.user._id });
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
