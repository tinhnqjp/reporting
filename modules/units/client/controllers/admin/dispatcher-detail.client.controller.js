(function () {
  'use strict';

  angular
    .module('units.admin')
    .controller('DispatcherDetailController', DispatcherDetailController);

  DispatcherDetailController.$inject = ['$scope', '$state', 'dispatcherResolve'];

  function DispatcherDetailController($scope, $state, dispatcher) {
    var vm = this;
    vm.dispatcher = dispatcher;

  }
}());
