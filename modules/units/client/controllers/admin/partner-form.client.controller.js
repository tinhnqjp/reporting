(function () {
  'use strict';

  angular
    .module('units.admin')
    .controller('PartnerFormController', PartnerFormController);

  PartnerFormController.$inject = ['$scope', '$state', 'partnerResolve'];

  function PartnerFormController($scope, $state, partner) {
    var vm = this;
    vm.partner = partner;
    vm.update = update;

    function update(isValid) {
      $scope.handleShowConfirm({
        message: 'この協力者を保存します。よろしいですか？'
      }, function () {
        if (!isValid) {
          vm.isSaveClick = true;
          $scope.$broadcast('show-errors-check-validity', 'vm.partnerForm');
          return false;
        }
        vm.partner.createOrUpdate()
          .then(successCallback)
          .catch(errorCallback);

        function successCallback(res) {
          $state.go('admin.partners.detail', { partnerId: vm.partner._id });
          $scope.handleShowToast('この協力者の保存が完了しました。');
        }

        function errorCallback(res) {
          var message = (res) ? res.message || res.data.message : '協力者の保存が失敗しました！';
          $scope.handleShowToast(message, true);
        }
      });
    }
  }
}());
