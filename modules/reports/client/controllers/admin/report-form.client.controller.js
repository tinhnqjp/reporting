(function () {
  'use strict';

  angular
    .module('reports.admin')
    .controller('ReportFormController', ReportFormController);

  ReportFormController.$inject = ['$scope', '$state', 'reportResolve'];

  function ReportFormController($scope, $state, report) {
    var vm = this;
    vm.report = report;
    vm.update = update;

    function update(isValid) {
      $scope.handleShowConfirm({
        message: 'この報告書を保存します。よろしいですか？'
      }, function () {
        if (!isValid) {
          vm.isSaveClick = true;
          $scope.$broadcast('show-errors-check-validity', 'vm.reportForm');
          return false;
        }
        vm.report.createOrUpdate()
          .then(successCallback)
          .catch(errorCallback);

        function successCallback(res) {
          $state.go('admin.reports.list');
          $scope.handleShowToast('この報告書の保存が完了しました。');
        }

        function errorCallback(res) {
          var message = (res) ? res.message || res.data.message : '報告書の保存が失敗しました。';
          $scope.handleShowToast(message, true);
        }
      });
    }
  }
}());
