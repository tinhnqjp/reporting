(function () {
  'use strict';

  angular
    .module('foods.admin.services')
    .factory('FoodsService', FoodsService)
    .factory('FoodsApi', FoodsApi);

  FoodsService.$inject = ['$resource'];

  function FoodsService($resource) {
    var Food = $resource('/api/foods/:foodId', { foodId: '@_id' }, {
      update: { method: 'PUT' }
    });

    angular.extend(Food.prototype, {
      createOrUpdate: function () {
        var food = this;
        return createOrUpdate(food);
      }
    });

    return Food;

    function createOrUpdate(food) {
      if (food._id) {
        return food.$update(onSuccess, onError);
      } else {
        return food.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(food) {}

      // Handle error response
      function onError(errorResponse) {
        var error = errorResponse.data;
        handleError(error);
      }
    }
    function handleError(error) {
      return false;
    }
  }

  FoodsApi.$inject = ['$http'];
  function FoodsApi($http) {
    this.list = function (condition) {
      return $http.post('/api/foods/list', { condition: condition }, {});
    };
    this.export = function (condition) {
      return $http.post('/api/foods/export', { condition: condition }, {});
    };
    return this;
  }

}());
