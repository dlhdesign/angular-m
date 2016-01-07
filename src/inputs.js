'use strict';

function input() {
  return {
    restrict: 'E',
    require: '?ngModel',
    link: function (scope, element, attrs, ctrl) {
      var model = scope.$eval(attrs.ngModel);

      function setValidity() {
        m_forEach(model.$errors, function (v, k) {
          // Invert the current error state (error === true means valid === false)
          ctrl.$setValidity(k, !v);
        });
      }

      function validate(val) {
        model.valid(val);
        return val;
      }

      if (!m_isFunction(model) || !m_isObject(model.$config) || !m_isObject(model.$parent)) {
        return;
      }

      // Use model event binding for validity setting so that we can trigger a change on "equals" checks, etc.
      model.$parent.bind('validated.' + model.$config.methodName, setValidity);

      // Use parser/formatter to check validity on change of value
      ctrl.$parsers.push(validate);
      ctrl.$formatters.push(validate);
    }
  };
}

angular.module('angular-m.inputs', [])
  .directive('input', input)
  .directive('select', input)
  .directive('textarea', input);
