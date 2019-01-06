(function () {
  'use strict';

  angular
    .module('reports.admin')
    .controller('ReportDetailController', ReportDetailController);

  ReportDetailController.$inject = ['$scope', '$state', 'reportResolve', 'ReportsApi'];

  function ReportDetailController($scope, $state, report, ReportsApi) {
    var vm = this;
    vm.report = report;
    vm.configs = {};
    vm.units = [];
    onCreate();

    function onCreate() {
      ReportsApi.config()
        .success(function (res) {
          vm.configs = res;
          $scope.four_taps = vm.configs.four_taps;
          $scope.pic_taps = vm.configs.pic_taps;
          $scope.three_taps = vm.configs.three_taps;
          $scope.two_taps = vm.configs.two_taps;
          $scope.type_taps = vm.configs.type_taps;
        })
        .error(function (err) {
          var message = (err) ? err.message || err.data.message : '報告書の取得が失敗しました。';
          $scope.handleShowToast(message, true);
        });

      vm.report.signature = $scope.getImageDefault(vm.report.signature);
    }
  }
}());
