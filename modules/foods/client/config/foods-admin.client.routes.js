(function () {
  'use strict';

  // Setting up route
  angular
    .module('foods.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.foods', {
        abstract: true,
        url: '/foods',
        template: '<ui-view/>'
      })
      .state('admin.foods.list', {
        url: '',
        templateUrl: '/modules/foods/client/views/admin/list-foods.client.view.html',
        controller: 'FoodListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '食べ物一覧'
        }
      })
      .state('admin.foods.create', {
        url: '/create',
        templateUrl: '/modules/foods/client/views/admin/form-food.client.view.html',
        controller: 'FoodController',
        controllerAs: 'vm',
        resolve: {
          foodResolve: newFood
        },
        data: {
          pageTitle: '食べ物登録'
        }
      })
      .state('admin.foods.edit', {
        url: '/:foodId/edit',
        templateUrl: '/modules/foods/client/views/admin/form-food.client.view.html',
        controller: 'FoodController',
        controllerAs: 'vm',
        resolve: {
          foodResolve: getFood
        },
        data: {
          pageTitle: '食べ物編集'
        }
      })
      .state('admin.foods.import', {
        url: '/import',
        templateUrl: '/modules/foods/client/views/admin/import-foods.client.view.html',
        controller: 'FoodImportController',
        controllerAs: 'vm',
        data: { pageTitle: 'CSVインポート' }
      });

    getFood.$inject = ['$stateParams', 'FoodsService'];
    function getFood($stateParams, FoodsService) {
      return FoodsService.get({
        foodId: $stateParams.foodId
      }).$promise;
    }

    newFood.$inject = ['FoodsService'];
    function newFood(FoodsService) {
      return new FoodsService();
    }
  }
}());
