(function () {
  'use strict';

  angular
    .module('core')
    .controller('HeaderController', HeaderController);

  HeaderController.$inject = ['$scope', '$state', 'menuService', '$location'];

  function HeaderController($scope, $state, menuService, $location) {
    var vm = this;
    vm.isCollapsed = false;
    vm.menu = menuService.getMenu('topbar');
    vm.menu.items = _.sortBy(vm.menu.items, function (o) { return o.position; });
    $scope.$on('$stateChangeSuccess', stateChangeSuccess);
    $scope.$state = $state;

    function stateChangeSuccess() {
      vm.isCollapsed = false;
    }

    $scope.logout = function () {
      $scope.handleShowConfirm({
        message: 'このログインIDをログアウトします。よろしいですか？'
      }, function () {
        window.location = '/api/auth/signout';
      });
    };
  }
}());
