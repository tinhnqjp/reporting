(function () {
  'use strict';

  angular
    .module('units.admin.services')
    .factory('DispatcherService', DispatcherService)
    .factory('DispatcherApi', DispatcherApi);

  DispatcherService.$inject = ['$resource'];

  function DispatcherService($resource) {
    var Dispatcher = $resource('/api/dispatchers/:dispatcherId', { dispatcherId: '@_id' }, {
      update: { method: 'PUT' }
    });

    angular.extend(Dispatcher.prototype, {
      createOrUpdate: function () {
        var dispatcher = this;
        return createOrUpdate(dispatcher);
      }
    });

    return Dispatcher;

    function createOrUpdate(dispatcher) {
      if (dispatcher._id) {
        return dispatcher.$update(onSuccess, onError);
      } else {
        return dispatcher.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(dispatcher) {}

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

  DispatcherApi.$inject = ['$http'];
  function DispatcherApi($http) {
    this.list = function (condition) {
      return $http.post('/api/dispatchers/list', { condition: condition }, { ignoreLoadingBar: true });
    };
    this.export = function (condition) {
      return $http.post('/api/dispatchers/export', { condition: condition }, { ignoreLoadingBar: true });
    };
    return this;
  }

}());
