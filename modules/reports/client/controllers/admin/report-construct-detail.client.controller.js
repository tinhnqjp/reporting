(function () {
  'use strict';

  angular
    .module('reports.admin')
    .controller('ReportConstructDetailController', ReportConstructDetailController);

  ReportConstructDetailController.$inject = ['$scope', '$state', 'reportResolve', 'ReportsApi', 'Authentication'];

  function ReportConstructDetailController($scope, $state, report, ReportsApi, Authentication) {
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
            $scope.four_taps = vm.configs.four_taps;
          }
        })
        .error(function (err) {
          var message = (err) ? err.message || err.data.message : '報告書の取得が失敗しました。';
          $scope.handleShowToast(message, true);
        });

      vm.report.signature = $scope.getImageDefault(vm.report.signature);
    }

    vm.excel = function () {
      ReportsApi.export(vm.report._id)
        .success(function (res) {
          $scope.handleShowToast('報告書のエクスポートが完了しました。');
        })
        .error(function (err) {
          var message = (err) ? err.message || err.data.message : '報告書のエクスポートが失敗しました。';
          $scope.handleShowToast(message, true);
        });
    };
  }
}());
