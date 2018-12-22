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
        templateUrl: '/modules/users/client/views/admin/account-list.client.view.html',
        controller: 'UserListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: 'アカウント一覧'
        }
      })
      .state('admin.users.create', {
        url: '/create',
        templateUrl: '/modules/users/client/views/admin/account-form.client.view.html',
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
        templateUrl: '/modules/users/client/views/admin/account-form.client.view.html',
        controller: 'UserController',
        controllerAs: 'vm',
        resolve: {
          userResolve: getUser
        },
        data: {
          pageTitle: 'アカウント編集'
        }
      })
      .state('admin.users.detail', {
        url: '/:userId/detail',
        templateUrl: '/modules/users/client/views/admin/account-detail.client.view.html',
        controller: 'UserDetailController',
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
        templateUrl: '/modules/users/client/views/admin/account-import.client.view.html',
        controller: 'UserImportController',
        controllerAs: 'vm',
        data: { pageTitle: 'CSVインポート' }
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
