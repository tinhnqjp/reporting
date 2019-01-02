(function () {
  'use strict';

  angular
    .module('units.admin.services')
    .factory('UnitsService', UnitsService)
    .factory('UnitsApi', UnitsApi);

  UnitsService.$inject = ['$resource'];

  function UnitsService($resource) {
    var Unit = $resource('/api/units/:unitId', { unitId: '@_id' }, {
      update: { method: 'PUT' }
    });

    angular.extend(Unit.prototype, {
      createOrUpdate: function () {
        var unit = this;
        return createOrUpdate(unit);
      }
    });

    return Unit;

    function createOrUpdate(unit) {
      if (unit._id) {
        return unit.$update(onSuccess, onError);
      } else {
        return unit.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(unit) {}

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

  UnitsApi.$inject = ['$http'];
  function UnitsApi($http) {
    this.list = function (condition) {
      return $http.post('/api/units/list', { condition: condition }, {});
    };
    this.export = function (condition) {
      return $http.post('/api/units/export', { condition: condition }, {});
    };
    this.units = function () {
      return $http.post('/api/mobile/units/list', {}, {});
    };
    return this;
  }

}());
