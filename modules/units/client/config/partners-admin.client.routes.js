(function () {
  'use strict';

  // Setting up route
  angular
    .module('units.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.partners', {
        abstract: true,
        url: '/partners',
        template: '<ui-view/>'
      })
      .state('admin.partners.list', {
        url: '',
        templateUrl: '/modules/units/client/views/admin/partner-list.client.view.html',
        controller: 'PartnerListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
<<<<<<< HEAD
          pageTitle: '協力者一覧'
=======
          pageTitle: '協力会社一覧'
>>>>>>> ec5acda89d5313e5687648dcfb8f39e6a5993e75
        }
      })
      .state('admin.partners.create', {
        url: '/create',
        templateUrl: '/modules/units/client/views/admin/partner-form.client.view.html',
        controller: 'PartnerFormController',
        controllerAs: 'vm',
        resolve: {
          partnerResolve: newPartner
        },
        data: {
<<<<<<< HEAD
          pageTitle: '協力者登録'
=======
          pageTitle: '協力会社登録'
>>>>>>> ec5acda89d5313e5687648dcfb8f39e6a5993e75
        }
      })
      .state('admin.partners.edit', {
        url: '/:partnerId/edit',
        templateUrl: '/modules/units/client/views/admin/partner-form.client.view.html',
        controller: 'PartnerFormController',
        controllerAs: 'vm',
        resolve: {
          partnerResolve: getPartner
        },
        data: {
<<<<<<< HEAD
          pageTitle: '協力者編集'
=======
          pageTitle: '協力会社編集'
>>>>>>> ec5acda89d5313e5687648dcfb8f39e6a5993e75
        }
      })
      .state('admin.partners.detail', {
        url: '/:partnerId/detail',
        templateUrl: '/modules/units/client/views/admin/partner-detail.client.view.html',
        controller: 'PartnerDetailController',
        controllerAs: 'vm',
        resolve: {
          partnerResolve: getPartner
        },
        data: {
<<<<<<< HEAD
          pageTitle: '協力者編集'
=======
          pageTitle: '協力会社詳細'
>>>>>>> ec5acda89d5313e5687648dcfb8f39e6a5993e75
        }
      });

    getPartner.$inject = ['$stateParams', 'PartnerService'];
    function getPartner($stateParams, PartnerService) {
      return PartnerService.get({
        partnerId: $stateParams.partnerId
      }).$promise;
    }

    newPartner.$inject = ['PartnerService'];
    function newPartner(PartnerService) {

      return new PartnerService();
    }
  }
}());
