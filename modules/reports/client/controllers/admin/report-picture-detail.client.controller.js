(function () {
  'use strict';

  angular
    .module('reports.admin')
    .controller('ReportPictureDetailController', ReportPictureDetailController);

  ReportPictureDetailController.$inject = ['$scope', '$state', 'reportResolve', 'ReportsApi', 'ngDialog', 'Authentication'];

  function ReportPictureDetailController($scope, $state, report, ReportsApi, ngDialog, Authentication) {
    var vm = this;
    vm.report = report;
    vm.configs = {};
    vm.units = [];
    onCreate();

    function onCreate() {
      vm.imageUrl = $scope.getImageDefault('');
      if (Authentication.user.roles[0]) {
        vm.user_role = Authentication.user.roles[0];
      }
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
      vm.report.picture.store_image = $scope.getImageDefault(vm.report.picture.store_image);
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

    vm.modalMachine = function (machine) {
      var defaultImg = $scope.getImageDefault('');
      if (!machine) {
        $scope.machine = { number: '', note: '', sets: [{ comment: '', before: defaultImg, after: defaultImg }] };
      } else {
        $scope.machine = machine;
      }

      ngDialog.openConfirm({
        templateUrl: '/modules/reports/client/views/admin/modal-machine-detail.client.view.html',
        scope: $scope,
        showClose: false,
        width: 1000,
        controller: ['$scope', function ($scope) {

        }]
      })
        .then(function (res) {
          delete $scope.machine;
        }, function (res) {
          delete $scope.machine;
        });
    };
  }
}());
