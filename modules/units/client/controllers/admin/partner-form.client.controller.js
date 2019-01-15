(function () {
  'use strict';

  angular
    .module('units.admin')
    .controller('PartnerFormController', PartnerFormController);

<<<<<<< HEAD
  PartnerFormController.$inject = ['$scope', '$state', 'partnerResolve', 'DispatcherApi', 'ngDialog'];

  function PartnerFormController($scope, $state, partner, DispatcherApi, ngDialog) {
    var vm = this;
    vm.partner = partner;
    vm.update = update;
    $scope.dispatchers = [];
=======
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

      if (vm.partner.account.expire) {
        vm.partner.account.expire = $scope.parseDate(vm.partner.account.expire);
      }
    }
>>>>>>> ec5acda89d5313e5687648dcfb8f39e6a5993e75

    function update(isValid) {
      if (!isValid) {
        vm.isSaveClick = true;
        $scope.$broadcast('show-errors-check-validity', 'vm.partnerForm');
        return false;
      }
      $scope.handleShowConfirm({
<<<<<<< HEAD
        message: 'この協力者を保存します。よろしいですか？'
      }, function () {
        vm.partner.dispatcher = $scope.dispatchers;
=======
        message: 'この協力会社を保存します。よろしいですか？'
      }, function () {
        if (vm.password) {
          vm.partner.account.password = vm.password;
        }
>>>>>>> ec5acda89d5313e5687648dcfb8f39e6a5993e75
        vm.partner.createOrUpdate()
          .then(successCallback)
          .catch(errorCallback);

        function successCallback(res) {
          $state.go('admin.partners.detail', { partnerId: vm.partner._id });
<<<<<<< HEAD
          $scope.handleShowToast('この協力者の保存が完了しました。');
        }

        function errorCallback(res) {
          var message = (res) ? res.message || res.data.message : '協力者の保存が失敗しました！';
=======
          $scope.handleShowToast('この協力会社の保存が完了しました。');
        }

        function errorCallback(res) {
          var message = (res) ? res.message || res.data.message : '協力会社の保存が失敗しました。';
>>>>>>> ec5acda89d5313e5687648dcfb8f39e6a5993e75
          $scope.handleShowToast(message, true);
        }
      });
    }

<<<<<<< HEAD
    $scope.addDispatcher = function (dispatcher) {
      $scope.dispatchers.push(dispatcher);
    };
    vm.removeDispatcher = function (dispatcher) {
      var index = $scope.dispatchers.indexOf(dispatcher);
      if (index > -1) {
        $scope.dispatchers.splice(dispatcher, 1);
      }
    };

    vm.modalDispatcher = function () {
      $scope.isModalDispatcher = true;
      ngDialog.openConfirm({
        templateUrl: '/modules/units/client/views/admin/dispatcher-list.client.view.html',
        controller: 'DispatcherListController',
        controllerAs: 'vm',
        scope: $scope,
        showClose: true,
        width: 1000
      }).then(function (res) {
        console.log('​vm.modalDispatcher -> res11', res);
        $scope.isModalDispatcher = false;
      }, function (res) {
        console.log('​vm.modalDispatcher -> res', res);
        $scope.isModalDispatcher = false;
      });
=======
    vm.randomPass = function () {
      vm.password = $scope.generateRandomPassphrase();
>>>>>>> ec5acda89d5313e5687648dcfb8f39e6a5993e75
    };
  }
}());
