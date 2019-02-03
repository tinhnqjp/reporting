(function () {
  'use strict';

  angular
    .module('reports.admin')
    .controller('ReportRepairDetailController', ReportRepairDetailController);

  ReportRepairDetailController.$inject = ['$scope', '$state', 'reportResolve', 'ReportsApi', 'Authentication'];

  function ReportRepairDetailController($scope, $state, report, ReportsApi, Authentication) {
    var vm = this;
    vm.report = report;
    vm.configs = {};
    vm.units = [];
    onCreate();

    function onCreate() {
      if (Authentication.user.roles[0]) {
        vm.user_role = Authentication.user.roles[0];
      }
      ReportsApi.config()
        .success(function (res) {
          if (res.config) {
            vm.configs = res.config;
          }
        })
        .error(function (err) {
          var message = (err) ? err.message || err.data.message : '報告書の取得が失敗しました。';
          $scope.handleShowToast(message, true);
        });

      vm.report.signature = $scope.getImageDefault(vm.report.signature);
    }
  }
}());
