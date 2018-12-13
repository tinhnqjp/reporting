(function () {
  'use strict';

  // Users service used for communicating with the users REST endpoint
  angular
    .module('users.services')
    .factory('UsersService', UsersService)
    .factory('UsersApi', UsersApi);

  UsersService.$inject = ['$resource'];

  function UsersService($resource) {
    var Users = $resource('/api/users', {}, {
      updatePassword: { method: 'POST', url: '/api/users/password' },
      signin: { method: 'POST', url: '/api/auth/signin' },
      report: { method: 'GET', url: '/api/users/report' }
    });

    angular.extend(Users, {
      changePassword: function (passwordDetails) {
        return this.updatePassword(passwordDetails).$promise;
      },
      userSignin: function (credentials) {
        return this.signin(credentials).$promise;
      }
    });

    return Users;
  }

  // TODO this should be Users service
  angular
    .module('users.admin.services')
    .factory('AdminService', AdminService);

  AdminService.$inject = ['$resource'];

  function AdminService($resource) {
    var User = $resource('/api/users/:userId', { userId: '@_id' }, {
      update: { method: 'PUT' }
    });

    angular.extend(User.prototype, {
      createOrUpdate: function () {
        var user = this;
        return createOrUpdate(user);
      }
    });

    return User;

    function createOrUpdate(user) {
      if (user._id) {
        return user.$update(onSuccess, onError);
      } else {
        return user.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(user) {
        // Any required internal processing from inside the service, goes here.
      }

      // Handle error response
      function onError(errorResponse) {
        var error = errorResponse.data;
        // Handle error internally
        handleError(error);
      }
    }
    function handleError(error) {
      return false;
    }
  }
  UsersApi.$inject = ['$http'];
  function UsersApi($http) {
    this.list = function (condition) {
      return $http.post('/api/users/list', { condition: condition }, { ignoreLoadingBar: true });
    };
    this.export = function (condition) {
      return $http.post('/api/users/export', { condition: condition }, { ignoreLoadingBar: true });
    };
    return this;
  }

}());
