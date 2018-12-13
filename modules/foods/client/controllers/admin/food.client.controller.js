(function () {
  'use strict';

  angular
    .module('foods.admin')
    .controller('FoodController', FoodController);

  FoodController.$inject = ['$scope', '$state', 'foodResolve'];

  function FoodController($scope, $state, food) {
    var vm = this;
    vm.food = food;
    vm.update = update;

    function update(isValid) {
      $scope.handleShowConfirm({
        message: 'この食べ物を保存します。よろしいですか？'
      }, function () {
        if (!isValid) {
          vm.isSaveClick = true;
          $scope.$broadcast('show-errors-check-validity', 'vm.foodForm');
          return false;
        }
        vm.food.createOrUpdate()
          .then(successCallback)
          .catch(errorCallback);

        function successCallback(res) {
          $state.go('admin.foods.list');
          $scope.handleShowToast('この食べ物の保存が完了しました。');
        }

        function errorCallback(res) {
          var message = (res) ? res.message || res.data.message : '食べ物の保存が失敗しました。';
          $scope.handleShowToast(message, true);
        }
      });
    }
  }
}());
