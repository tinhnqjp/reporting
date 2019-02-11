(function () {
  'use strict';

  angular
    .module('units.admin')
    .controller('WorkerDetailController', WorkerDetailController);

  WorkerDetailController.$inject = ['$scope', '$state', 'workerResolve', '$stateParams'];

  function WorkerDetailController($scope, $state, worker, $stateParams) {
    var vm = this;
    vm.worker = worker;
    vm.isPetition = false;
    if ($stateParams && $stateParams.isPetition) {
      vm.isPetition = true;
    }
  }
}());
