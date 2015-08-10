/*jshint globalstrict:true*/
/*global angular:false*/
'use strict';

var m_isFunction = angular.isFunction,
    m_isString = angular.isString,
    m_isNumber = angular.isNumber,
    m_isObject = angular.isObject,
    m_isArray = angular.isArray,
    m_isDate = angular.isDate,
    m_isUndefined = angular.isUndefined,
    m_isBoolean = function(val) { return (val === true || val === false) ? true: false; },
    m_isRegEx = function(val) { return Object.prototype.toString.call(val) === '[object RegExp]' ? true : false; },
    m_isNull = function(val) { return val === null; },
    m_forEach = angular.forEach,
    m_extend = angular.extend,
    m_copy = angular.copy;

function inherit(parent, extra) {
  return m_extend(new (m_extend(function() {}, { prototype: parent }))(), extra);
}

function merge(dst) {
  m_forEach(arguments, function(obj) {
    if (obj !== dst) {
      m_forEach(obj, function(value, key) {
        if (!dst.hasOwnProperty(key)) dst[key] = value;
      });
    }
  });
  return dst;
}

/**
 * IE8-safe wrapper for `Object.keys()`.
 *
 * @param {Object} object A JavaScript object.
 * @return {Array} Returns the keys of the object as an array.
 */
function objectKeys(object) {
  if (Object.keys) {
    return Object.keys(object);
  }
  var result = [];

  m_forEach(object, function(val, key) {
    result.push(key);
  });
  return result;
}

/**
 * IE8-safe wrapper for `Array.prototype.indexOf()`.
 *
 * @param {Array} array A JavaScript array.
 * @param {*} value A value to search the array for.
 * @return {Number} Returns the array index value of `value`, or `-1` if not present.
 */
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

// extracted from underscore.js
// Return a copy of the object only containing the whitelisted properties.
function pick(obj) {
  var c = {},
      keys = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arguments, 1));
  m_forEach(keys, function(key) {
    if (key in obj) c[key] = obj[key];
  });
  return c;
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
    result[i] = callback(val, i);
  });
  return result;
}

/**
 * @ngdoc overview
 * @name angular.m
 *
 * @description
 * # angular.m
 * 
 * *You'll need to include this module as a dependency within your angular app.*
 * 
 * <pre>
 * <!doctype html>
 * <html ng-app="myApp">
 * <head>
 *   <script src="js/angular.js"></script>
 *   <!-- Include the angular-m script -->
 *   <script src="js/angular-m.min.js"></script>
 *   <script>
 *     // ...and add 'angular-m' as a dependency
 *     var myApp = angular.module('myApp', ['angular-m']);
 *   </script>
 * </head>
 * <body>
 * </body>
 * </html>
 * </pre>
 */
angular.module('angular-m', []);
