(function () {
  'use strict';

  angular
    .module('units.admin.services')
    .factory('WorkerService', WorkerService)
    .factory('WorkerApi', WorkerApi);

  WorkerService.$inject = ['$resource'];

  function WorkerService($resource) {
    var Worker = $resource('/api/workers/:workerId', { workerId: '@_id' }, {
      update: { method: 'PUT' }
    });

    angular.extend(Worker.prototype, {
      createOrUpdate: function () {
        var worker = this;
        return createOrUpdate(worker);
      }
    });

    return Worker;

    function createOrUpdate(worker) {
      if (worker._id) {
        return worker.$update(onSuccess, onError);
      } else {
        return worker.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(worker) {}

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

  WorkerApi.$inject = ['$http'];
  function WorkerApi($http) {
    this.list = function (condition) {
      return $http.post('/api/workers/list', { condition: condition }, {});
    };
    this.export = function (condition) {
      return $http.post('/api/workers/export', { condition: condition }, {});
    };
    return this;
  }

}());
