(function () {
  'use strict';

  angular.module('core')
    .directive('formTitle', formTitle);
  formTitle.$inject = ['$state'];

  function formTitle($state) {
    var directive = {
      restrict: 'E',
      template: '<h4>{{pageTitle}}</h4>',
      link: link
    };

    return directive;

    function link(scope, element) {
      scope.pageTitle = $state.current.data.pageTitle;
    }
  }
}());
