(function () {
  'use strict';

  angular
    .module('units.admin.services')
    .factory('PartnerService', PartnerService)
    .factory('PartnerApi', PartnerApi);

  PartnerService.$inject = ['$resource'];

  function PartnerService($resource) {
    var Partner = $resource('/api/partners/:partnerId', { partnerId: '@_id' }, {
      update: { method: 'PUT' }
    });

    angular.extend(Partner.prototype, {
      createOrUpdate: function () {
        var partner = this;
        return createOrUpdate(partner);
      }
    });

    return Partner;

    function createOrUpdate(partner) {
      if (partner._id) {
        return partner.$update(onSuccess, onError);
      } else {
        return partner.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(partner) {}

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

  PartnerApi.$inject = ['$http'];
  function PartnerApi($http) {
    this.list = function (condition) {
<<<<<<< HEAD
      return $http.post('/api/partners/list', { condition: condition }, { ignoreLoadingBar: true });
    };
    this.export = function (condition) {
      return $http.post('/api/partners/export', { condition: condition }, { ignoreLoadingBar: true });
=======
      return $http.post('/api/partners/list', { condition: condition }, {});
    };
    this.export = function (condition) {
      return $http.post('/api/partners/export', { condition: condition }, {});
>>>>>>> ec5acda89d5313e5687648dcfb8f39e6a5993e75
    };
    return this;
  }

}());
