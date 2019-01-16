(function () {
  'use strict';

  angular
    .module('core')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['UsersService'];
  function HomeController(UsersService) {
    var vm = this;

    UsersService.report(function (data) {
      vm.total = data.total;
      vm.today = data.today;
    });
  }
}());
