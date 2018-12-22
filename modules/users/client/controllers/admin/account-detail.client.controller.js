(function () {
  'use strict';

  angular
    .module('users.admin')
    .controller('UserController', UserController);

  UserController.$inject = ['$scope', '$state', 'userResolve'];

  function UserController($scope, $state, user) {
    var vm = this;
    vm.user = user;
  }
}());
