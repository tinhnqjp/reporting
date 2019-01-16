(function () {
  'use strict';

  // Setting up route
  angular
    .module('units.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.workers', {
        abstract: true,
        url: '/workers',
        template: '<ui-view/>'
      })
      .state('admin.workers.list', {
        url: '',
        templateUrl: '/modules/units/client/views/admin/worker-list.client.view.html',
        controller: 'WorkerListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '下請け一覧'
        }
      })
      .state('admin.workers.create', {
        url: '/create',
        templateUrl: '/modules/units/client/views/admin/worker-form.client.view.html',
        controller: 'WorkerFormController',
        controllerAs: 'vm',
        resolve: {
          workerResolve: newWorker,
          petitionResolve: newPetition
        },
        data: {
          pageTitle: '下請け登録'
        }
      })
      .state('admin.workers.edit', {
        url: '/:workerId/edit',
        templateUrl: '/modules/units/client/views/admin/worker-form.client.view.html',
        controller: 'WorkerFormController',
        controllerAs: 'vm',
        resolve: {
          workerResolve: getWorker,
          petitionResolve: newPetition
        },
        data: {
          pageTitle: '下請け編集'
        }
      })
      .state('admin.workers.detail', {
        url: '/:workerId/detail',
        templateUrl: '/modules/units/client/views/admin/worker-detail.client.view.html',
        controller: 'WorkerDetailController',
        controllerAs: 'vm',
        resolve: {
          workerResolve: getWorker
        },
        data: {
          pageTitle: '下請け詳細'
        }
      })
      .state('admin.workers.petition_create', {
        url: '/petition/:petitionId/create',
        templateUrl: '/modules/units/client/views/admin/worker-form.client.view.html',
        controller: 'WorkerFormController',
        controllerAs: 'vm',
        resolve: {
          workerResolve: newWorker,
          petitionResolve: getPetition
        },
        data: {
          pageTitle: '登録申請'
        }
      });

    getWorker.$inject = ['$stateParams', 'WorkerService'];
    function getWorker($stateParams, WorkerService) {
      return WorkerService.get({
        workerId: $stateParams.workerId
      }).$promise;
    }

    newWorker.$inject = ['WorkerService'];
    function newWorker(WorkerService) {

      return new WorkerService();
    }

    getPetition.$inject = ['$stateParams', 'PetitionService'];
    function getPetition($stateParams, PetitionService) {
      return PetitionService.get({
        petitionId: $stateParams.petitionId
      }).$promise;
    }

    newPetition.$inject = ['PetitionService'];
    function newPetition(PetitionService) {

      return new PetitionService();
    }
  }
}());
