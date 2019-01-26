(function () {
  'use strict';

  angular
    .module('units.admin')
    .controller('PartnerFormController', PartnerFormController);

  PartnerFormController.$inject = ['$scope', '$state', 'partnerResolve', 'ngDialog'];

  function PartnerFormController($scope, $state, partner, ngDialog) {
    var vm = this;
    vm.partner = partner;
    vm.update = update;
    vm.password = null;
    onCreate();

    function onCreate() {
      if (!vm.partner._id) {
        vm.password = $scope.generateRandomPassphrase();
      }

      if (vm.partner.account && vm.partner.account.expire) {
        vm.partner.account.expire = $scope.parseDate(vm.partner.account.expire);
      }
    }

    function update(isValid) {
      if (!isValid) {
        vm.isSaveClick = true;
        $scope.$broadcast('show-errors-check-validity', 'vm.partnerForm');
        return false;
      }
      $scope.handleShowConfirm({
        message: 'この協力会社を保存します。よろしいですか？'
      }, function () {
        if (vm.password) {
          vm.partner.account.password = vm.password;
          vm.partner.password = vm.password;
        }
        vm.partner.createOrUpdate()
          .then(successCallback)
          .catch(errorCallback);

        function successCallback(res) {
          $state.go('admin.partners.detail', { partnerId: vm.partner._id });
          $scope.handleShowToast('この協力会社の保存が完了しました。');
        }

        function errorCallback(res) {
          var message = (res) ? res.message || res.data.message : '協力会社の保存が失敗しました。';
          $scope.handleShowToast(message, true);
        }
      });
    }

    vm.randomPass = function () {
      vm.password = $scope.generateRandomPassphrase();
    };
  }
}());
