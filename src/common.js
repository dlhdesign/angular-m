/*jshint globalstrict:true*/
/*global angular:false*/
'use strict';

var m_isFunction = angular.isFunction,
    m_isString = angular.isString,
    m_isNumber = angular.isNumber,
    m_isObject = angular.isObject,
    m_isArray = angular.isArray,
    m_isDate = function(val) { return angular.isDate(val) && !isNaN(val); },
    m_isUndefined = angular.isUndefined,
    m_isBoolean = function(val) { return (val === true || val === false) ? true: false; },
    m_isRegEx = function(val) { return Object.prototype.toString.call(val) === '[object RegExp]' ? true : false; },
    m_isNull = function(val) { return val === null; },
    m_forEach = angular.forEach,
    m_extend = angular.extend,
    m_copy = angular.copy,
    m_equals = angular.equals;

function inherit(parent, extra) {
  return m_extend(new (m_extend(function () {}, { prototype: parent }))(), extra);
}

function merge(dst) {
  m_forEach(arguments, function (obj) {
    if (obj !== dst) {
      m_forEach(obj, function (value, key) {
        dst[key] = value;
      });
    }
  });
  return dst;
}

function objectKeys(object) {
  var result = [];
  if (m_isObject(object) === false) {
    return result;
  }
  if (Object.keys) {
    return Object.keys(object);
  }
  m_forEach(object, function(val, key) {
    result.push(key);
  });
  return result;
}

function indexOf(array, value) {
  var len = array.length >>> 0,
      from = Number(arguments[2]) || 0;

  if (Array.prototype.indexOf) {
    return array.indexOf(value, Number(arguments[2]) || 0);
  }
  from = (from < 0) ? Math.ceil(from) : Math.floor(from);

  if (from < 0) {
    from += len;
  }

  for (; from < len; from++) {
    if (from in array && array[from] === value) return from;
  }
  return -1;
}

function pick(obj, fields, context) {
  var ret = {};

  if (m_isString(fields)) {
    fields = fields.split(',');
  }
  if (m_isFunction(fields) || (m_isArray(fields) && fields.length > 0)) {
    m_forEach(obj, function (value, key) {
      var include = false;
      if (m_isFunction(fields)) {
        include = fields.call(context || obj, key, value);
      } else if (fields.indexOf(key) > -1) {
        include = true;
      }
      if (include === true) {
        ret[key] = obj[key];
      } else if (include !== false) {
        ret[key] = include;
      }
    });
  }
  return ret;
}

function filter(collection, callback) {
  var array = m_isArray(collection),
      result = array ? [] : {};
  m_forEach(collection, function(val, i) {
    if (callback(val, i)) {
      result[array ? result.length : i] = val;
    }
  });
  return result;
}

function map(collection, callback) {
  var result = m_isArray(collection) ? [] : {};

  m_forEach(collection, function(val, i) {
    result[i] = callback.call(this, val, i);
  });
  return result;
}

/**
You'll need to include this module as a dependency within your angular app.*

<pre>
<!doctype html>
<html ng-app="myApp">
<head>
  <script src="js/angular.js"></script>
  <!-- Include the angular-m script -->
  <script src="js/angular-m.min.js"></script>
  <script>
    // ...and add 'angular-m' as a dependency
    var myApp = angular.module('myApp', ['angular-m']);
  </script>
</head>
<body>
</body>
</html>
</pre>
*/
angular.module('angular-m', []);
