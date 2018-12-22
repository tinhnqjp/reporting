(function () {
  'use strict';

  angular
    .module('units.admin')
    .controller('WorkerDetailController', WorkerDetailController);

  WorkerDetailController.$inject = ['$scope', '$state', 'workerResolve'];

  function WorkerDetailController($scope, $state, worker) {
    var vm = this;
    vm.worker = worker;
  }
}());
