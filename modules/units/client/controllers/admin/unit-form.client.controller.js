(function () {
  'use strict';

  angular
    .module('units.admin')
    .controller('UnitFormController', UnitFormController);

  UnitFormController.$inject = ['$scope', '$state', 'unitResolve'];

  function UnitFormController($scope, $state, unit) {
    var vm = this;
    vm.unit = unit;
    vm.update = update;

    function update(isValid) {
      if (!isValid) {
        vm.isSaveClick = true;
        $scope.$broadcast('show-errors-check-validity', 'vm.unitForm');
        return false;
      }
      $scope.handleShowConfirm({
        message: 'この部署を保存します。よろしいですか？'
      }, function () {

        vm.unit.createOrUpdate()
          .then(successCallback)
          .catch(errorCallback);

        function successCallback(res) {
          $state.go('admin.units.detail', { unitId: vm.unit._id });
          $scope.handleShowToast('この部署の保存が完了しました。');
        }

        function errorCallback(res) {
          var message = (res) ? res.message || res.data.message : '部署の保存が失敗しました。';
          $scope.handleShowToast(message, true);
        }
      });
    }
  }
}());
