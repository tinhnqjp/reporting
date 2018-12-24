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
      .state('admin.reports.create', {
        url: '/create',
        templateUrl: '/modules/reports/client/views/admin/report-form.client.view.html',
        controller: 'ReportFormController',
        controllerAs: 'vm',
        resolve: {
          reportResolve: newReport
        },
        data: {
          pageTitle: '報告書登録'
        }
      })
      .state('admin.reports.edit', {
        url: '/:reportId/edit',
        templateUrl: '/modules/reports/client/views/admin/report-form.client.view.html',
        controller: 'ReportFormController',
        controllerAs: 'vm',
        resolve: {
          reportResolve: getReport
        },
        data: {
          pageTitle: '報告書編集'
        }
      })
      .state('admin.reports.detail', {
        url: '/:reportId/detail',
        templateUrl: '/modules/reports/client/views/admin/report-detail.client.view.html',
        controller: 'ReportDetailController',
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
