(function () {
  'use strict';

  angular
    .module('reports.admin')
    .controller('ReportDetailController', ReportDetailController);

  ReportDetailController.$inject = ['$scope', '$state', 'reportResolve'];

  function ReportDetailController($scope, $state, report) {
    var vm = this;
    vm.report = report;

  }
}());
