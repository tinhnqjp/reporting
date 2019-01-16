(function () {
  'use strict';

  angular
    .module('reports.admin.services')
    .factory('ReportsService', ReportsService)
    .factory('ReportsApi', ReportsApi);

  ReportsService.$inject = ['$resource'];

  function ReportsService($resource) {
    var Report = $resource('/api/reports/:reportId', { reportId: '@_id' }, {
      update: { method: 'PUT' }
    });

    angular.extend(Report.prototype, {
      createOrUpdate: function () {
        var report = this;
        return createOrUpdate(report);
      }
    });

    return Report;

    function createOrUpdate(report) {
      if (report._id) {
        return report.$update(onSuccess, onError);
      } else {
        return report.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(report) {}

      // Handle error response
      function onError(errorResponse) {
        var error = errorResponse.data;
        handleError(error);
      }
    }
    function handleError(error) {
      return false;
    }
  }

  ReportsApi.$inject = ['$http'];
  function ReportsApi($http) {
    this.list = function (condition) {
      return $http.post('/api/reports/list', { condition: condition }, {});
    };
    this.export = function (reportId) {
      return $http.post('/api/reports/export', { reportId: reportId }, {});
    };
    this.config = function () {
      return $http.post('/api/mobile/auth/config', {}, {});
    };
    this.updateStatus = function (reportId, status) {
      return $http.post('/api/reports/status', { reportId: reportId, status: status }, {});
    };
    return this;
  }

}());
