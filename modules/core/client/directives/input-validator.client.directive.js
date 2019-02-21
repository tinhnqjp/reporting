(function () {
  'use strict';

  angular
    .module('core')
    .directive('inputValidator', inputValidator)
    .directive('inputFloat', inputFloat);
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
            pattern = /^([0-9+-]{0,20}$)/;
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

  inputFloat.$inject = ['$window'];
  function inputFloat($window) {
    var directive = {
      require: 'ngModel',
      scope: {
        maxInteger: '=',
        maxDecimal: '=',
        hasNegative: '='
      },
      link: link
    };
    return directive;

    function link(scope, element, attrs, ngModel) {
      var flg = false;
      element.bind('keydown keypress', function (e) {
        if ((event.ctrlKey || event.metaKey) && event.keyCode === 86) {
          e.preventDefault();
        }

        if (event.which === 8) {
          flg = true;
        } else {
          flg = false;
        }
      });
      element.bind('input', function (e) {
        var value = this.value.replace(/[^0-9-.]/g, '');
        if (value.charAt(0) === '.') {
          value = value.slice(1);
        }

        var position = value.indexOf('.') + 1;
        if (position >= 0) {
          value = value.substr(0, position) + value.slice(position).replace('.', '');
        }

        var maxInteger = 0;
        if (value.length > 0) {
          if (!scope.hasNegative) {
            value = value.replace('-', '');
          } else if (value.length > 1 && value.charAt(value.length - 1) === '-') {
            value = value.substring(0, value.length - 1);
          }

          if (value.indexOf('-') > -1) {
            maxInteger = scope.maxInteger + 1;
          } else {
            maxInteger = scope.maxInteger;
          }
          if (!flg && value.length === maxInteger && value.indexOf('.') === -1) {
            value = value + '.';
          }
          if (value.length > 0 && value.indexOf('.') > -1) {
            var split = value.split('.');
            if (split[1] && split[1].length > scope.maxDecimal) {
              value = split[0] + '.' + split[1].substring(0, scope.maxDecimal);
            }
          }
        }

        if (this.value !== value) {
          ngModel.$setViewValue(value);
          ngModel.$render();
          scope.$apply();
          e.preventDefault();
        }
      });
      element.bind('blur', function (e) {
        var value = this.value;
        var validator = $window.validator;
        var isFloat = validator.isFloat(value);
        if (value.length > 0 && isFloat) {
          value = parseFloat(value).toFixed(scope.maxDecimal);
        } else {
          value = '';
        }
        ngModel.$setViewValue(value);
        ngModel.$render();
        scope.$apply();
        e.preventDefault();
      });
    }
  }
}());
