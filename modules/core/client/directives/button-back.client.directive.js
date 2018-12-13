(function () {
  'use strict';
  angular.module('core')
    .directive('buttonBack', buttonBack);
  buttonBack.$inject = ['$state'];

  function buttonBack($state) {
    var directive = {
      restrict: 'E',
      scope: {
        back: '@',
        params: '='
      },
      templateUrl: '/modules/core/client/views/template/button-back.client.view.html',
      link: function (scope) {
        scope.handleBackScreen = function () {
          if ($state.previous.state.name) {
            $state.go($state.previous.state.name, ($state.previous.state.name) ? $state.previous.params : {});
          } else if (scope.back) {
            $state.go(scope.back, scope.params);
          }
        };
      }
    };

    return directive;
  }
}());
