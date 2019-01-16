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
          if (res.config) {
            vm.configs = res.config;
          }
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

    vm.uploadStatus = function (update, text) {
      $scope.handleShowConfirm({
        message: 'この報告書を' + text + 'します。よろしいですか？'
      }, function () {
        vm.report.status = update;
        ReportsApi.updateStatus(vm.report._id, update)
          .success(function (res) {
            $scope.handleShowToast('報告書の' + text + 'が完了しました。');
          })
          .error(function (err) {
            var message = (err) ? err.message || err.data.message : '報告書の' + text + 'が失敗しました。';
            $scope.handleShowToast(message, true);
          });
      });
    };

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

    vm.export = function () {
      $scope.handleShowConfirm({
        message: 'PDFをダウンロードします。よろしいですか？'
      }, function () {
        $scope.handleShowDownload({
          href: vm.report.pdf,
          text: 'PDF'
        });
      });
    };
  }
}());
