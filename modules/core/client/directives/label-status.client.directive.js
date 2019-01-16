(function () {
  'use strict';
  angular.module('core')
    .directive('labelStatus', labelStatus);
  labelStatus.$inject = [];

  function labelStatus() {
    var directive = {
      restrict: 'E',
      scope: {
        item: '=',
        list: '='
      },
      template: '<span class="label {{getClass()}}">{{getText()}}</span>',
      link: function (scope) {
        scope.getText = function () {
          if (scope.item && scope.item) {
            var item = _.find(scope.list, function (obj) {
              return obj.id === scope.item;
            });
            return item.name;
          }
        };
        scope.getClass = function () {
          if (scope.item && scope.item) {
            var item = _.find(scope.list, function (obj) {
              return obj.id === scope.item;
            });
            return item.class;
          }
        };
      }
    };

    return directive;
  }
}());
