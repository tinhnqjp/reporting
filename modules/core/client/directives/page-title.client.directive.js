(function () {
  'use strict';

  angular.module('core')
    .directive('pageTitle', pageTitle);

  pageTitle.$inject = ['$rootScope', '$interpolate', '$state', '$window'];

  function pageTitle($rootScope, $interpolate, $state, $window) {
    var directive = {
      restrict: 'A',
      link: link
    };

    return directive;

    function link(scope, element) {
      $rootScope.$on('$stateChangeSuccess', listener);

      function listener(event, toState) {
        var applicationCoreTitle = 'DEMO',
          separator = ' - ',
          stateTitle = applicationCoreTitle + separator;

        // toState.name.split('.').forEach(function (value, index) {
        //   stateTitle = stateTitle + value.charAt(0).toUpperCase() + value.slice(1) + separator;
        // });
        // if (toState.data && toState.data.pageTitle) {
        //   stateTitle = $interpolate(stateTitle + toState.data.pageTitle + separator)(($state.$current.locals.globals));
        // }
        stateTitle = stateTitle.slice(0, 0 - separator.length);
        element.text(stateTitle);

        $window.scrollTo(0, 0);
      }
    }
  }
}());
