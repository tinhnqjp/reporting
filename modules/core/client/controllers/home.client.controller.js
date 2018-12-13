(function () {
  'use strict';

  angular
    .module('core')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['UsersService'];
  function HomeController(UsersService) {
    var vm = this;

    UsersService.report(function (data) {
      vm.total_admin = _.find(data.user, {
        _id: 'admin'
      }).count || 0;
      vm.total_user = _.find(data.user, {
        _id: 'user'
      }).count - 1 || 0;

      vm.apiCnt = data.apiCnt || 0;
    });
  }
}());
