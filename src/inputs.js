'use strict';

function input() {
  return {
    restrict: 'E',
    require: '?ngModel',
    link: function (scope, element, attrs, ctrl) {
      var model = scope.$eval(attrs.ngModel);

      function setValidity() {
        _.forOwn(model.$errors, function (v, k) {
          ctrl.$setValidity(k, v);
        });
      }

      function validate(val) {
        model.valid(val);
        setValidity();
        return val;
      }

      if (!_.isFunction(model) || !_.isFunction(model.valid)) {
        return;
      }

      ctrl.$parsers.unshift(validate);
      ctrl.$formatters.unshift(validate);
    }
  };
}

angular.module('angular-m.inputs', [])
  .directive('input', input)
  .directive('select', input);
