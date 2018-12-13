(function () {
  'use strict';

  // Setting up route
  angular
    .module('units.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.units', {
        abstract: true,
        url: '/units',
        template: '<ui-view/>'
      })
      .state('admin.units.list', {
        url: '',
        templateUrl: '/modules/units/client/views/admin/unit-list.client.view.html',
        controller: 'UnitListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '食べ物一覧'
        }
      })
      .state('admin.units.create', {
        url: '/create',
        templateUrl: '/modules/units/client/views/admin/unit-form.client.view.html',
        controller: 'UnitFormController',
        controllerAs: 'vm',
        resolve: {
          unitResolve: newUnit
        },
        data: {
          pageTitle: '食べ物登録'
        }
      })
      .state('admin.units.edit', {
        url: '/:unitId/edit',
        templateUrl: '/modules/units/client/views/admin/unit-form.client.view.html',
        controller: 'UnitFormController',
        controllerAs: 'vm',
        resolve: {
          unitResolve: getUnit
        },
        data: {
          pageTitle: '食べ物編集'
        }
      })
      .state('admin.units.detail', {
        url: '/:unitId/detail',
        templateUrl: '/modules/units/client/views/admin/unit-detail.client.view.html',
        controller: 'UnitDetailController',
        controllerAs: 'vm',
        resolve: {
          unitResolve: getUnit
        },
        data: {
          pageTitle: '食べ物編集'
        }
      });

    getUnit.$inject = ['$stateParams', 'UnitsService'];
    function getUnit($stateParams, UnitsService) {
      return UnitsService.get({
        unitId: $stateParams.unitId
      }).$promise;
    }

    newUnit.$inject = ['UnitsService'];
    function newUnit(UnitsService) {
      return new UnitsService();
    }
  }
}());
