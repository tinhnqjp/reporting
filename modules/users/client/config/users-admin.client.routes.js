(function () {
  'use strict';

  // Setting up route
  angular
    .module('users.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.users', {
        abstract: true,
        url: '/users',
        template: '<ui-view/>'
      })
      .state('admin.users.list', {
        url: '',
        templateUrl: '/modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: 'アカウント一覧'
        }
      })
      .state('admin.users.create', {
        url: '/create',
        templateUrl: '/modules/users/client/views/admin/form-user.client.view.html',
        controller: 'UserController',
        controllerAs: 'vm',
        resolve: {
          userResolve: newUser
        },
        data: {
          pageTitle: 'アカウント登録'
        }
      })
      .state('admin.users.edit', {
        url: '/:userId/edit',
        templateUrl: '/modules/users/client/views/admin/form-user.client.view.html',
        controller: 'UserController',
        controllerAs: 'vm',
        resolve: {
          userResolve: getUser
        },
        data: {
          pageTitle: 'アカウント編集'
        }
      })
      .state('admin.users.import', {
        url: '/import',
        templateUrl: '/modules/users/client/views/admin/import-users.client.view.html',
        controller: 'UserImportController',
        controllerAs: 'vm',
        data: { pageTitle: 'CSVインポート' }
      })
      // operator
      .state('admin.operators', {
        abstract: true,
        url: '/operators',
        template: '<ui-view/>'
      })
      .state('admin.operators.list', {
        url: '',
        templateUrl: '/modules/users/client/views/admin/list-operators.client.view.html',
        controller: 'OperatorListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: 'オペレーター一覧'
        }
      })
      .state('admin.operators.create', {
        url: '/create',
        templateUrl: '/modules/users/client/views/admin/form-operator.client.view.html',
        controller: 'OperatorController',
        controllerAs: 'vm',
        resolve: {
          userResolve: newUser
        },
        data: {
          pageTitle: 'オペレーター登録'
        }
      })
      .state('admin.operators.edit', {
        url: '/:operatorId/edit',
        templateUrl: '/modules/users/client/views/admin/form-operator.client.view.html',
        controller: 'OperatorController',
        controllerAs: 'vm',
        resolve: {
          userResolve: getUser
        },
        data: {
          pageTitle: 'オペレーター編集'
        }
      });

    getUser.$inject = ['$stateParams', 'AdminService'];
    function getUser($stateParams, AdminService) {
      return AdminService.get({
        userId: $stateParams.userId
      }).$promise;
    }

    newUser.$inject = ['AdminService'];
    function newUser(AdminService) {
      return new AdminService();
    }

  }
}());
