(function () {
  'use strict';

  angular
    .module('users.admin')
    .controller('AccountDetailController', AccountDetailController);

  AccountDetailController.$inject = ['$scope', '$state', 'userResolve'];

  function AccountDetailController($scope, $state, user) {
    var vm = this;
    vm.user = user;
  }
}());
