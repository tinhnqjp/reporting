(function () {
  'use strict';

  // Setting up route
  angular
    .module('units.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.dispatchers', {
        abstract: true,
        url: '/dispatchers',
        template: '<ui-view/>'
      })
      .state('admin.dispatchers.list', {
        url: '',
        templateUrl: '/modules/units/client/views/admin/dispatcher-list.client.view.html',
        controller: 'DispatcherListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '手配者一覧'
        }
      })
      .state('admin.dispatchers.create', {
        url: '/create',
        templateUrl: '/modules/units/client/views/admin/dispatcher-form.client.view.html',
        controller: 'DispatcherFormController',
        controllerAs: 'vm',
        resolve: {
          dispatcherResolve: newDispatcher
        },
        data: {
          pageTitle: '手配者登録'
        }
      })
      .state('admin.dispatchers.edit', {
        url: '/:dispatcherId/edit',
        templateUrl: '/modules/units/client/views/admin/dispatcher-form.client.view.html',
        controller: 'DispatcherFormController',
        controllerAs: 'vm',
        resolve: {
          dispatcherResolve: getDispatcher
        },
        data: {
          pageTitle: '手配者編集'
        }
      })
      .state('admin.dispatchers.detail', {
        url: '/:dispatcherId/detail',
        templateUrl: '/modules/units/client/views/admin/dispatcher-detail.client.view.html',
        controller: 'DispatcherDetailController',
        controllerAs: 'vm',
        resolve: {
          dispatcherResolve: getDispatcher
        },
        data: {
          pageTitle: '手配者編集'
        }
      });

    getDispatcher.$inject = ['$stateParams', 'DispatcherService'];
    function getDispatcher($stateParams, DispatcherService) {
      return DispatcherService.get({
        dispatcherId: $stateParams.dispatcherId
      }).$promise;
    }

    newDispatcher.$inject = ['DispatcherService'];
    function newDispatcher(DispatcherService) {

      return new DispatcherService();
    }
  }
}());
