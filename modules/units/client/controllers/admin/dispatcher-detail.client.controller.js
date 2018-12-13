(function () {
  'use strict';

  angular
    .module('units.admin')
    .controller('DispatcherDetailController', DispatcherDetailController);

  DispatcherDetailController.$inject = ['$scope', '$state', 'unitResolve'];

  function DispatcherDetailController($scope, $state, unit) {
    var vm = this;
    vm.unit = unit;

  }
}());
