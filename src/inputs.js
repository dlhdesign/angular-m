'use strict';

function input() {
  return {
    restrict: 'E',
    require: '?ngModel',
    link: function (scope, element, attrs, ctrl) {
      var model = scope.$eval(attrs.ngModel);

      function setValidity() {
        m_forEach(model.$errors, function (v, k) {
          ctrl.$setValidity(k, !v);
        });
      }

      function validate(val) {
        model.valid(val);
        setValidity();
        return val;
      }

      if (!m_isFunction(model) || !m_isFunction(model.valid)) {
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
