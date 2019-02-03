(function () {
  'use strict';

  angular
    .module('core')
    .directive('inputValidator', inputValidator);
  inputValidator.$inject = ['$window'];

  function inputValidator($window) {
    var directive = {
      require: 'ngModel',
      scope: {
        valMin: '=',
        valMax: '='
      },
      link: link
    };
    return directive;

    function link(scope, element, attrs, ngModel) {
      var validator = $window.validator;
      var type = attrs.inputValidator;
      // var validation = validator.split(',');
      var pattern;
      const URL = 'url';
      const EMAIL = 'email';
      const ALPHA = 'alpha';
      const ALPHA_NUMBER = 'alphanumeric';
      const INT = 'int';
      const FULL_DATETIME = 'fulldatetime';
      const DATE = 'date';
      const TIME = 'time';
      const KANA = 'kana';
      const ZIP = 'zip';
      const TEL = 'tel';
      const FLOAT = 'float';
      const FLOAT_DECIMAL = 'float_decimal';
      const MADE_DATE = 'made_date';

      element.bind('blur', function (e) {
        var option = {};
        var min = scope.valMin;
        var max = scope.valMax;
        var value = ngModel.$viewValue + '';
        if (!ngModel || !value) return;

        switch (type) {
          case URL:
            ngModel.$setValidity(URL, validator.isURL(value));
            break;
          case EMAIL:
            ngModel.$setValidity(EMAIL, validator.isEmail(value));
            break;
          case ALPHA:
            ngModel.$setValidity(ALPHA, validator.isAlpha(value));
            break;
          case ALPHA_NUMBER:
            ngModel.$setValidity(ALPHA_NUMBER, validator.isAlphanumeric(value));
            break;
          case INT:
            if (min)
              option.min = parseInt(min, 10);
            if (max)
              option.max = parseInt(max, 10);

            ngModel.$setValidity(INT, validator.isInt(value, option));
            break;
          case FULL_DATETIME:
            pattern = /20\d{2}\/(0[1-9]|1[0-2])\/(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]/;
            ngModel.$setValidity(FULL_DATETIME, validator.matches(value, pattern));

            break;
          case DATE:
            pattern = /20\d{2}\/(0[1-9]|1[0-2])\/(0[1-9]|[1-2][0-9]|3[0-1])/;
            ngModel.$setValidity(DATE, validator.matches(value, pattern));
            break;
          case TIME:
            pattern = /(2[0-3]|[01][0-9]):[0-5][0-9]/;
            ngModel.$setValidity(TIME, validator.matches(value, pattern));
            break;
          case KANA:
            pattern = /^[\u3040-\u309f|ー]*$/;
            ngModel.$setValidity(KANA, validator.matches(value, pattern));
            break;
          case ZIP:
            pattern = /^\d{3}-\d{4}$|^\d{3}-\d{2}$|^\d{3}$/;
            ngModel.$setValidity(ZIP, validator.matches(value, pattern));
            break;
          case TEL:
            pattern = /^([0-9]{9,13}$)/;
            ngModel.$setValidity(TEL, validator.matches(value, pattern));
            break;
          case FLOAT:
            pattern = /^[\d.]+$/;
            ngModel.$setValidity(FLOAT, validator.matches(value, pattern));
            break;
          case FLOAT_DECIMAL:
            pattern = /^\d{0,3}(\.\d{1,2})?$/;
            ngModel.$setValidity(FLOAT_DECIMAL, validator.matches(value, pattern));
            break;
          case MADE_DATE:
            pattern = /20\d{2}\/(0[1-9]|1[0-2]|-)/;
            ngModel.$setValidity(MADE_DATE, validator.matches(value, pattern));
            break;
          default:
            break;
        }
      });
    }
  }
}());
