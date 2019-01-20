(function () {
  'use strict';

  angular
    .module('users')
    .controller('AuthenticationController', AuthenticationController);

  AuthenticationController.$inject = ['$scope', 'UsersService', '$location', 'Authentication', 'Notification'];

  function AuthenticationController($scope, UsersService, $location, Authentication, Notification) {
    var vm = this;
    if (Authentication.user) {
      $scope.handleBackScreen('home');
    }

    vm.signin = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');
        return false;
      }

      UsersService.userSignin(vm.credentials)
        .then(function (res) {
          Authentication.user = res;
          $scope.handleBackScreen('home');
        })
        .catch(function (err) {
          Notification.error({ message: err.data.message, title: '<i class="glyphicon glyphicon-remove"></i> 失敗!', delay: 6000 });
        });
    };
  }
}());
