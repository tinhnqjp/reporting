(function () {
  'use strict';

  angular
    .module('units.admin')
    .controller('UnitDetailController', UnitDetailController);

  UnitDetailController.$inject = ['$scope', '$state', 'unitResolve'];

  function UnitDetailController($scope, $state, unit) {
    var vm = this;
    vm.unit = unit;

  }
}());
