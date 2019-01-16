(function () {
  'use strict';
  angular.module('core').filter('dateTimeFormat', function () {
    return function (input) {
      if (input) {
        var date = moment(input);
        return date.format('ll') + ' ' + date.format('LTS');
      } else {
        return '';
      }
    };
  });
}());
