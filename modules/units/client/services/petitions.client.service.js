(function () {
  'use strict';

  angular
    .module('units.admin.services')
    .factory('PetitionService', PetitionService)
    .factory('PetitionApi', PetitionApi);

  PetitionService.$inject = ['$resource'];

  function PetitionService($resource) {
    var Petition = $resource('/api/petitions/:petitionId', { petitionId: '@_id' }, {
      update: { method: 'PUT' }
    });

    return Petition;
  }

  PetitionApi.$inject = ['$http'];
  function PetitionApi($http) {
    this.list = function (condition) {
      return $http.post('/api/petitions/list', { condition: condition }, {});
    };
    return this;
  }

}());
