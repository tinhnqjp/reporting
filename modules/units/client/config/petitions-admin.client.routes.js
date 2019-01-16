(function () {
  'use strict';

  // Setting up route
  angular
    .module('units.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.petitions', {
        abstract: true,
        url: '/petitions',
        template: '<ui-view/>'
      })
      .state('admin.petitions.list', {
        url: '',
        templateUrl: '/modules/units/client/views/admin/petition-list.client.view.html',
        controller: 'PetitionListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '下請け申請一覧'
        }
      });

    getPetition.$inject = ['$stateParams', 'PetitionService'];
    function getPetition($stateParams, PetitionService) {
      return PetitionService.get({
        petitionId: $stateParams.petitionId
      }).$promise;
    }

    newPetition.$inject = ['PetitionsService'];
    function newPetition(PetitionService) {
      return new PetitionService();
    }
  }
}());
