(function () {
  'use strict';

  // Setting up route
  angular
    .module('users.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    // Users state routing
    $stateProvider
      .state('settings', {
        url: '/password',
        templateUrl: '/modules/users/client/views/users/change-password.client.view.html',
        controller: 'ChangePasswordController',
        controllerAs: 'vm',
        data: { pageTitle: 'パスワード変更', roles: ['admin'] }
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        template: '<ui-view/>',
        controllerAs: 'vm'
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: '/modules/users/client/views/users/signin.client.view.html',
        controller: 'AuthenticationController',
        controllerAs: 'vm'
      });
  }
}());
