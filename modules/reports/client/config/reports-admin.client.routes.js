(function () {
  'use strict';

  // Setting up route
  angular
    .module('reports.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.reports', {
        abstract: true,
        url: '/reports',
        template: '<ui-view/>'
      })
      .state('admin.reports.list', {
        url: '',
        templateUrl: '/modules/reports/client/views/admin/report-list.client.view.html',
        controller: 'ReportListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '報告書一覧'
        }
      })
      .state('admin.reports.clean_edit', {
        url: '/:reportId/cleanEdit',
        templateUrl: '/modules/reports/client/views/admin/report-clean-form.client.view.html',
        controller: 'ReportCleanFormController',
        controllerAs: 'vm',
        resolve: {
          reportResolve: getReport
        },
        data: {
          pageTitle: '報告書編集'
        }
      })
      .state('admin.reports.clean_detail', {
        url: '/:reportId/cleanDetail',
        templateUrl: '/modules/reports/client/views/admin/report-clean-detail.client.view.html',
        controller: 'ReportCleanDetailController',
        controllerAs: 'vm',
        resolve: {
          reportResolve: getReport
        },
        data: {
          pageTitle: '報告書詳細'
        }
      })
      .state('admin.reports.picture_edit', {
        url: '/:reportId/pictureEdit',
        templateUrl: '/modules/reports/client/views/admin/report-picture-form.client.view.html',
        controller: 'ReportPictureFormController',
        controllerAs: 'vm',
        resolve: {
          reportResolve: getReport
        },
        data: {
          pageTitle: '報告書編集'
        }
      })
      .state('admin.reports.picture_detail', {
        url: '/:reportId/pictureDetail',
        templateUrl: '/modules/reports/client/views/admin/report-picture-detail.client.view.html',
        controller: 'ReportPictureDetailController',
        controllerAs: 'vm',
        resolve: {
          reportResolve: getReport
        },
        data: {
          pageTitle: '報告書詳細'
        }
      });

    getReport.$inject = ['$stateParams', 'ReportsService'];
    function getReport($stateParams, ReportsService) {
      return ReportsService.get({
        reportId: $stateParams.reportId
      }).$promise;
    }

    newReport.$inject = ['ReportsService'];
    function newReport(ReportsService) {
      return new ReportsService();
    }
  }
}());
