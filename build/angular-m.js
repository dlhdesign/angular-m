/**
 * Angular-based model library for use in MVC framework design
 * @version v0.0.2-dev-2015-08-03
 * @link https://github.com/dlhdesign/angular-m
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

/* commonjs package manager support (eg componentjs) */
if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports){
  module.exports = 'angular-m';
}

(function (window, angular, undefined) {
/*jshint globalstrict:true*/
/*global angular:false*/
'use strict';

var isDefined = angular.isDefined,
    isFunction = angular.isFunction,
    isString = angular.isString,
    isNumber = angular.isNumber,
    isObject = angular.isObject,
    isArray = angular.isArray,
    isDate = angular.isDate,
    isUndefined = angular.isUndefined,
    isBoolean = function(val) { return (val === true || val === false) ? true: false; },
    isRegEx = function(val) { return Object.prototype.toString.call(val) === '[object RegExp]' ? true : false; },
    isNull = function(val) { return val === null; },
    forEach = angular.forEach,
    extend = angular.extend,
    copy = angular.copy;

function inherit(parent, extra) {
  return extend(new (extend(function() {}, { prototype: parent }))(), extra);
}

function merge(dst) {
  forEach(arguments, function(obj) {
    if (obj !== dst) {
      forEach(obj, function(value, key) {
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

  forEach(object, function(val, key) {
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
  if (Array.prototype.indexOf) {
    return array.indexOf(value, Number(arguments[2]) || 0);
  }
  var len = array.length >>> 0, from = Number(arguments[2]) || 0;
  from = (from < 0) ? Math.ceil(from) : Math.floor(from);

  if (from < 0) from += len;

  for (; from < len; from++) {
    if (from in array && array[from] === value) return from;
  }
  return -1;
}

// extracted from underscore.js
// Return a copy of the object only containing the whitelisted properties.
function pick(obj) {
  var copy = {};
  var keys = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arguments, 1));
  forEach(keys, function(key) {
    if (key in obj) copy[key] = obj[key];
  });
  return copy;
}

function filter(collection, callback) {
  var array = isArray(collection);
  var result = array ? [] : {};
  forEach(collection, function(val, i) {
    if (callback(val, i)) {
      result[array ? result.length : i] = val;
    }
  });
  return result;
}

function map(collection, callback) {
  var result = isArray(collection) ? [] : {};

  forEach(collection, function(val, i) {
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

$HTTPService.$inject = ['$rootScope', '$http'];
function $HTTPService($rootScope, $http) {

  var METHODS = {
    read: 'GET',
    update: 'PUT',
    create: 'POST',
    delete: 'DELETE'
  };

  function callHTTP(config, success, fail) {
    config = config || {};
    config.method = config.method || METHODS.read;
    return $http(config)
      .success(function (data) {
        if (isFunction(success)) {
          success(data);
        }
      })
      .error(function (data) {
        if (isFunction(fail)) {
          fail(data);
        }
      });
  }

  function callRead(config, success, fail) {
    config = config || {};
    config.method = METHODS.read;
    return callHTTP(config, success, fail);
  }

  function callUpdate(config, success, fail) {
    config = config || {};
    config.method = METHODS.update;
    return callHTTP(config, success, fail);
  }

  function callCreate(config, success, fail) {
    config = config || {};
    config.method = METHODS.create;
    return callHTTP(config, success, fail);
  }

  function callDelete(config, success, fail) {
    config = config || {};
    config.method = METHODS.delete;
    return callHTTP(config, success, fail);
  }

  return {
    METHODS: METHODS,
    
    call: callHTTP,

    read: callRead,
    update: callUpdate,
    create: callCreate,
    delete: callDelete,
    
    readList: callRead,
    updateList: callUpdate,
    createList: callCreate,
    deleteList: callDelete
  };
}
angular.module( 'angular-m' ).service( 'm-http', $HTTPService );
$RegExConstant.$inject = [];
function $RegExConstant() {
  return {
    email:      /^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
    latLong:    /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/,
    zip:        /^\d{5}(?:[-\s]\d{4})?$/,
    timeZone:   /^GMT\s[+-]\d{2}:\d{2}$/,
    timeStr:    /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    number:     /^[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?$/,
    object:     /^{.*}$/,
    array:      /^\[.*]$/,
    boolean:    /^true|false$/
  };
}

angular.module( 'angular-m' ).constant( 'REGEX', $RegExConstant );
$BaseFactory.$inject = [];
function $BaseFactory() {
  /*jshint strict:false */
  var initializing = false,
      // Need to check which version of function.toString we have
      superPattern = /xyz/.test(function () { /*jshint unused:false */ var xyz; }) ? /\b_super\b/ : /.*/;

  function executeQueue() {
    /*jshint -W040 */
    var self = this,
        queue, cb;
    if (self.isFinal()) {
      queue = copy(self.__cbQueue);
      self.__cbQueue = [];
      /*jshint -W084 */
      while(cb = queue.shift()) {
        if ((cb.type < 3 && self.__resolved === true) ||
            (cb.type > 1 && self.__rejected === true)) {
          cb.cb.call(self);
        }
      }
    }
  }

  /**
  Event that triggers when the source model is cloned
  @event Base#cloned
  @prop {Base} clone - The new instance that was created as a result of the clone
  */
  /**
  Event that triggers when the model is resolved (generally when data is loaded succesfully)
  @event Base#resolved
  */
  /**
  Event that triggers when the model is rejected (generally when a data load fails)
  @event Base#rejected
  */
  /**
  Event that triggers when the model is finalized (resolved or rejected)
  @event Base#finalized
  */
  /**
  Event that triggers when the model is unfinalized (reset back to being neither resolved nor rejected)
  @event Base#unfinalized
  */

	/**
  Base model that all other models will inherit from. Provides Promises/A functionality as well as publish/subscribe functionality.
  @constructs Base
  @prop {Array}   __arguments   - The initial arguments passed into the constructor
  @prop {Array}   __cbQueue     - Array of callbacks awaiting finalization
  @prop {Object}  __listeners   - Object storing event listeners
  @prop {Boolean} $valid=true   - Whether the instance is currently in a valid state or not
  @prop {Object}  $errors       - Contains details about any error states on the instance
  @prop {Boolean} __resolved=undefined    - Whether the instance has been resolved (success) or not
  @prop {Boolean} __rejected=undefined    - Whether the instance has been rejected (fail) or not
  */
  function Base() {}

  Base.prototype = {
    $type: 'Base',
    /**
    Initialization method. Called automatically when a new instance is instantiated.
    @param           [data]            - Initial data to populate the instance with
    @param {Boolean} [forClone=false]  - Whether this instance is being created as a clone or not
    @return {Base} `this`
    */
    init: function ( data, forClone) {
      /*jshint unused:false */
      var self = this;
      self.__arguments = copy(arguments);
      self.__cbQueue = [];
      self.__listeners = {};
      self.$errors = {};
      self.$valid = true;
      return self;
    },
    /**
    Method to clone the instance.
    @return {Base} `new this.constructor(null, true)`
    @fires Base#cloned
    */
    clone: function () {
      var self = this,
          ret = new self.constructor(null, true);
      ret.__arguments = copy(self.__arguments);
      ret.__resolved = self.__resolved;
      ret.__rejected = self.__rejected;
      self.trigger('cloned', ret);
      return ret;
    },
    /**
    Indicates whether the instance has been finalized (resolved or rejected)
    @return {Boolean}
    */
    isFinal: function () {
      var self = this;
      return !!(self.__resolved || self.__rejected);
    },
    /**
    Marks the instance as "resolved" (successfully complete).
    @fires Base#resolved
    @fires Base#finalized
    @return {Base} `this`
    */
    resolve: function () {
      var self = this;
      if (!self.isFinal()) {
        self.__resolved = true;
        executeQueue.call(self);
        self.trigger('resolved');
        self.trigger('finalized');
      }
      return self;
    },
    /**
    Marks the instance as "rejected" (unsuccessfully complete).
    @fires Base#rejected
    @fires Base#finalized
    @return {Base} `this`
    */
    reject: function () {
      var self = this;
      if (!self.isFinal()) {
        self.__rejected = true;
        executeQueue.call(self);
        self.trigger('rejected');
        self.trigger('finalized');
      }
      return self;
    },
    /**
    Removes the resolved/rejected state on the instance.
    @fires Base#unfinalized
    @return {Base} `this`
    */
    unfinalize: function () {
      var self = this;
      delete self.__resolved;
      delete self.__rejected;
      self.trigger('unfinalized');
      return self;
    },
    /**
    Attaches success/fail callbacks to the instance, which will trigger upon the next resolve/reject call respectively or, if the instance is already final, immediately.
    @param {Base~successCallback} [success]
    @param {Base~failCallback}    [fail]
    @return {Base} `this`
    */
    /**
    Success callback will be triggered when/if the instance is resolved.
    @callback Base~successCallback
    */
    /**
    Fail callback will be triggered when/if the instance is rejected.
    @callback Base~failCallback
    */
    then: function(success, fail) {
      var self = this;
      if (isFunction(success)) {
        self.__cbQueue.push({
          type: 1,
          cb: success
        });
      }
      if (isFunction(fail)) {
        self.__cbQueue.push({
          type: 3,
          cb: fail
        });
      }
      if (self.isFinal()) {
        executeQueue.call(self);
      }
      return self;
    },
    /**
    Attaches a callback to the instance which will trigger upon the next finalization or, if the instance is already final, immediately.
    @param {Base~alwaysCallback} [always]
    @return {Base} `this`
    */
    /**
    Always callback will be triggered when/if the instance is finalized (either resolved OR rejected).
    @callback Base~alwaysCallback
    */
    always: function (always) {
      var self = this;
      if (isFunction(always)) {
        self.__cbQueue.push({
          type: 2,
          cb: always
        });
      }
      if (self.isFinal()) {
        executeQueue.call(self);
      }
      return self;
    },
    /**
    Attaches success callback to the instance.
    @param {Base~successCallback} [success]
    @return {Base} `this`
    */
    success: function (cb) {
      return this.then(cb);
    },
    /**
    Attaches fail callback to the instance.
    @param {Base~failCallback} [fail]
    @return {Base} `this`
    */
    fail: function (cb) {
      return this.then(null, cb);
    },
    /**
    Attaches a listener to an event type.
    @param {String} type - The type of event to listen for
    @param {Function} cb - The function to trigger every time the event type occurs
    @return {Base} `this`
    */
    bind: function (type, cb) {
      var self = this;
      if (isString(type) && isFunction(cb)) {
        self.__listeners[type] = self.__listeners[type] || [];
        self.__listeners[type].push(cb);
      }
      return self;
    },
    /**
    Detaches either all listeners or just a single listener from an event type.
    @param {String} type - The type of event to unbind
    @param {Function} [listener] - The specific listener to unbind from the event type. If not provided, all listeners bound to the event type will be removed
    @return {Base} `this`
    */
    unbind: function (type, listener) {
      var self = this,
          idx;
      if (isString(type) && isArray(self.__listeners[type]) && self.__listeners[type].length > 0) {
        if (isFunction(listener)) {
          self.__listeners[type] = filter(self.__listeners[type], function (cb) {
            return cb !== listener;
          });
        } else {
          delete self.__listeners[type];
        }
      }
      return self;
    },
    /**
    Attaches a one-time listener to an event type. After triggering once, the listener will automtically be unbound.
    @param {String} type - The type of event to listen for
    @param {Function} cb - The function to trigger the next time the event type occurs
    @return {Base} `this`
    */
    one: function (type, cb) {
      var self = this,
          wrap;
      if (isString(type) && isFunction(cb)) {
        wrap = function () {
          cb.call(this, arguments);
          self.unbind(type, wrap);
        };
        self.bind(type, wrap);
      }
      return self;
    },
    /**
    Triggers an event of the given type, passing any listeners the data provided.
    @param {String} type    - The type of event to trigger
    @param          [data]  - Object to pass into any listeners
    @return {Boolean} Returns `true` if all listeners return true, else `false`
    */
    trigger: function (type, data) {
      var self = this,
          ret = true;
      if (isString(type) && isArray(self.__listeners[type]) && self.__listeners[type].length > 0) {
        forEach(self.__listeners[type], function (cb) {
          ret = cb.call(self, data, type) && ret;
        });
      }
      return ret;
    }
  };

  /**
  Allows for model extension
  @param {Object} properties - Properties to extend the new model with. Methods may call `this._super.apply(this, arguments)` to call parent model methods that are overwritten.
  @extends Base
  @return {Function} New constructor
  */
  Base.extend = function extend(properties) {
    /*jshint strict:false */
    /*jshint loopfunc:true */
    /*jshint noarg:false */
    var _super = this.prototype,
        proto, key;

    initializing = true;
    proto = new this();
    initializing = false;
    
    for ( key in properties ) {
      if ( properties.hasOwnProperty( key ) ) {
        if ( isFunction( properties[ key ] ) && isFunction( _super[ key ] ) && superPattern.test( properties[ key ] ) ) {
          proto[ key ] = (function( key, fn ) {
            return function() {
              var tmp = this._super,
                  ret;

              this._super = _super[ key ];
              ret = fn.apply( this, arguments );
              if ( isFunction( tmp ) ) {
                this._super = tmp;
              } else {
                delete this._super;
              }
              return ret;
            };
          })( key, properties[ key ] );
        } else {
          proto[ key ] = properties[ key ];
        }
      }
    }
    if (!properties.type) {
      properties.type = 'Object';
    }
    function Class() {
      if ( !initializing && isFunction( this.init ) ) {
        return this.init.apply(this, arguments);
      }
    }
    Class.prototype = proto;
    if ( Object.defineProperty ) {
      Object.defineProperty( Class.prototype, 'constructor', { 
        enumerable: false, 
        value: Class
      });
    } else {
      Class.prototype.constructor = Class;
    }
    Class.extend = extend;
    return Class;
  };
 
  /**
   * Return the constructor function
   */
  return Base;
}
angular.module( 'angular-m' ).factory( 'Base', $BaseFactory );
$SingletonFactory.$inject = ['Base', 'REGEX'];
function $SingletonFactory(Base, REGEX) {
  /**
  Base model that represents a single object.
  @class Singleton
  @extends Base
  @prop {object}  __data        - Current data for the instance
  @prop {object}  __setData     - Pending data for the instance
  @prop {object}  __merged      - Cache of __data + __setData
  @prop {array}   __fieldConfig - Cache of field configurations
  @prop {boolean} $dirty=false  - If instance has been modified since initilization or the last save, equals `true`; else `false`
  @prop {boolean} $busy         - If instance is currently in the middle of an API call, equals `true`; else `false`
  @prop {boolean} $loaded       - If instance has been loaded or instantiated with data, equals `true`; else `false`
  @prop {string}  $type         - The type of model the instance is
  */
  var Singleton = function () {};

  /**
  Singleton field cofiguration definition.
  @typedef {FieldConfig}
  @type {object}
  */

  /**
   * Helper functions
   */
  function cap(str) {
    return str.charAt(0).toLowerCase() + str.slice(1).replace(/_([a-z])/g, function( _, l ){ return l.toUpperCase(); });
  }
  function setError(self, field, key, value) {
    self.$errors[ field ] = self.$errors[ field ] || {};
    self.$errors[ field ][ key ] = value;
    self[ field ].$errors[ key ] = value;
  }
  function validate(val, fieldConfig) {
    /*jshint validthis:true */
    /*jshint laxbreak:true */
    var ret = true,
        matches, limit;

    // required
    if ( fieldConfig.required === true ) {
      if ( val === undefined || val === null || val.length === 0 ) {
        setError( this, fieldConfig.methodName, 'required', false );
        ret = false;
      } else {
        setError( this, fieldConfig.methodName, 'required', true );
      }
    }

    if ( val !== undefined && val !== null ) {
    // START DEFINED-ONLY CHECKS

      // type
      if ( indexOf(['st','nu','ob','ar','bo','dt'], fieldConfig.type ) > -1 ) {
        setError( this, fieldConfig.methodName, 'type', true );
        if ( ( fieldConfig.type === 'st' && !isString(val) )
          || ( fieldConfig.type === 'nu' && !(isNumber(val) || REGEX.number.test(val) ) )
          || ( fieldConfig.type === 'ob' && !(isObject(val) || REGEX.object.test(val) ) )
          || ( fieldConfig.type === 'ar' && !(isArray(val) || REGEX.array.test(val) ) )
          || ( fieldConfig.type === 'bo' && !(isBoolean(val) || REGEX.boolean.test(val) ) )
          || ( fieldConfig.type === 'dt' && !isDate(new Date(val)) )
        ) {
          setError( this, fieldConfig.methodName, 'type', true );
          ret = false;
        }
      }

      // min/max
      if ( isNumber(fieldConfig.min) || ( fieldConfig.type === 'dt' && isDate(fieldConfig.min) ) ) {
        if ( ( fieldConfig.type === 'st' || fieldConfig.type === 'ar' ) && val.length >= fieldConfig.min ) {
          setError( this, fieldConfig.methodName, 'min', true );
        } else if ( ( !fieldConfig.type || fieldConfig.type === 'nu' ) && parseFloat( val ) >= fieldConfig.min ) {
          setError( this, fieldConfig.methodName, 'min', true );
        } else if ( fieldConfig.type === 'dt' && new Date( val ) >= new Date(fieldConfig.min) ) {
          setError( this, fieldConfig.methodName, 'min', true );
        } else {
          setError( this, fieldConfig.methodName, 'min', false );
          ret = false;
        }
      }
      if ( isNumber(fieldConfig.max) || ( fieldConfig.type === 'dt' && isDate(fieldConfig.max) ) ) {
        if ( ( fieldConfig.type === 'st' || fieldConfig.type === 'ar' ) && val.length <= fieldConfig.max ) {
          setError( this, fieldConfig.methodName, 'max', true );
        } else if ( ( !fieldConfig.type || fieldConfig.type === 'nu' ) && parseFloat( val ) <= fieldConfig.max ) {
          setError( this, fieldConfig.methodName, 'max', true );
        } else if ( fieldConfig.type === 'dt' && new Date( val ) <= new Date(fieldConfig.max) ) {
          setError( this, fieldConfig.methodName, 'max', true );
        } else {
          setError( this, fieldConfig.methodName, 'max', false );
          ret = false;
        }
      }

    // END DEFINED-ONLY CHECKS
    }

    // matches
    if ( isRegExp(fieldConfig.matches) ) {
      matches = fieldConfig.matches.test(val) || ( isUndefined(val) || isNull(val) || val.length === 0 );
      setError( this, fieldConfig.methodName, 'matches', matches );
      ret = matches && ret;
    }

    // limit
    if ( isArray(fieldConfig.limit) ) {
      if ( isUndefined(val) || isNull(val) || val.length === 0 ) {
        setError( this, fieldConfig.methodName, 'limit', false );
      }
      limit = fieldConfig.limit.indexOf( val ) > -1;
      setError( this, fieldConfig.methodName, 'limit', limit );
      ret = limit && ret;
    } else if ( isObject(fieldConfig.limit) ) {
      if ( isUndefined(val) || isNull(val) || val.length === 0 ) {
        setError( this, fieldConfig.methodName, 'limit', false );
      }
      limit = fieldConfig.limit.hasOwnProperty( val );
      setError( this, fieldConfig.methodName, 'limit', limit );
      ret = limit && ret;
    } else if ( isString(fieldConfig.limit) ) {
      if ( isUndefined(val) || isNull(val) || val.length === 0 ) {
        setError( this, fieldConfig.methodName, 'limit', false );
      }
      limit = fieldConfig.limit === val;
      setError( this, fieldConfig.methodName, 'limit', limit );
      ret = limit && ret;
    }

    return ret;
  }

  Singleton = Base.extend(
    /** @lends Singleton.prototype */
    {
      $type: 'Singleton',
      /**
      Instantiates the Singleton by setting up all the field getter/setters.
      @override
      */
      init: function (data, forClone) {
        /*jshint unused:false */
        var self = this._super.apply(this, arguments);
        self.__merged = self.__data = data || {};
        self.__setData = {};
        self.$loaded = data ? true : false;
        self.$dirty = false;
        self.__fieldConfig = false;

        return self.each(function (fieldConfig) {
          if ( fieldConfig.getter !== undefined && !isFunction(fieldConfig.getter) ) {
            throw new Error('Singleton Init Error: "getter" must be undefined/null or a function');
          }
          if ( fieldConfig.setter !== undefined && !isFunction(fieldConfig.setter) ) {
            throw new Error('Singleton Init Error: "setter" must be undefined/null or a function');
          }
          function getter() {
            var ret,
                field = fieldConfig.key;
            //console.log('getter: ' + (fieldConfig.key ? fieldConfig.key : key) + ' = ' + self.get()[ fieldConfig.key ? fieldConfig.key : key ] );
            if ( fieldConfig.__getterCacheSet === true ) {
              return fieldConfig.__getterCache;
            }
            if ( fieldConfig.getter ) {
              ret = fieldConfig.getter.call(self, fieldConfig);
            } else {
              field = field.split( '.' );
              ret = self.get()[ field.shift() ];
              while ( field.length > 0 ) {
                if ( isObject( ret ) === false ) {
                  return null;
                }
                ret = ret[ field.shift() ];
              }
              if ( ( ret === null || ret === undefined ) && fieldConfig.default !== undefined ) {
                ret = fieldConfig.default;
              }
              if ( isFunction(fieldConfig.mutateGet) === true ) {
                ret = fieldConfig.mutateGet.call(self, ret, fieldConfig);
              }
            }
            fieldConfig.__getterCacheSet = true;
            fieldConfig.__getterCache = ret;
            return ret;
          }
          function setter(val) {
            var field = fieldConfig.key,
                f, target;
            //console.log('setter: ' + (fieldConfig.key ? fieldConfig.key : key) + ' = ' + val );
            if ( fieldConfig.readonly === true ) {
              throw new Error(fieldConfig.methodName + ' is read-only.' );
            }
            self.__merged = false;
            self.$dirty = true;
            self.$loaded = true;
            fieldConfig.__getterCacheSet = false;
            delete fieldConfig.__getterCache;
            if ( fieldConfig.setter ) {
              fieldConfig.setter.call(self, val, fieldConfig);
              return self;
            }
            field = field.split( '.' );
            target = self.__setData;
            while ( field.length > 1 ) {
              f = field.shift();
              target = target[ f ] = isObject( target[ f ] ) === true ? target[ f ] : {};
            }
            if ( isFunction(fieldConfig.mutateSet) === true ) {
              val = fieldConfig.mutateSet.call(self, val, fieldConfig);
            }
            target[field] = val;
            return self;
          }
          /**
          @typedef SingletonField
          @type {function}
          @arg [val] - If provided, will be used as the field's new value. If not provided, method acts as a getter
          @prop {object} $errors - Contains details about any error states on the field
          @prop {object} $config - Contains the configuration for this field
          @prop {SingletonFieldValidator} valid - Validates the field's value against the field definition
          @returns {Singleton} `this` 
          */
          /**
          @typedef SingletonFieldValidator
          @type {function}
          @returns {boolean} `true` if the value is currently valid; else `false`
          */
          self[ fieldConfig.methodName ] = function(val) {
            if ( arguments.length ) {
              return setter.call(self[ fieldConfig.methodName ], val);
            }
            return getter.call(self[ fieldConfig.methodName ]);
          };
          self[ fieldConfig.methodName ].$errors = {};
          self[ fieldConfig.methodName ].$config = fieldConfig;
          self[ fieldConfig.methodName ].valid = function( val ) {
            var ret = true;
            if ( arguments.length === 0 ) {
              val = self[ fieldConfig.methodName ]();
            }
            if ( isFunction( fieldConfig.validator ) ) {
              ret = fieldConfig.validator.call(self, val, fieldConfig);
              setError( self, fieldConfig.methodName, 'validator', ret );
            }
            ret = validate.call(self, val, fieldConfig) && ret;
            self.$valid = ret;
            return ret;
          };
        }); 
      },
      /**
      Method to retrieve all the current and pending data (__data extended by __setData) for the instance.
      @returns {object}
      */
      get: function () {
        var self = this;
        // Use a static variable as a cache
        if (self.__merged !== false) {
          return self.__merged;
        }
        self.__merged = merge({}, self.__data, self.__setData);
        return self.__merged;
      },
      /**
      Method to set the pending data (__setData) for the instance. Also sets `this.$loaded = true`.
      @arg {object} val - The pending data to set on the instance
      @returns {Singleton} `this`
      */
      set: function (val) {
        var self = this;
        self.__merged = false;
        self.$dirty = true;
        self.__setData = copy(val);
        self.$loaded = self.$loaded || objectKeys(val).length > 0;
        self.clearCache();
        return self;
      },
      /**
      Clears any instance and field cache that is currently present.
      @returns {Singleton} `this`
      */
      clearCache: function() {
        var self = this;
        if (self.__merged !== false) {
          self.__merged = false;
          self.each(function (fieldConfig) {
            fieldConfig.__getterCacheSet = false;
            delete fieldConfig.__getterCache;
          });
        }
        return self;
      },
      /**
      Triggers `cb` for each field on the model.
      @arg {Singleton~eachCB} cb - Method to call for each field
      @returns {Singleton} `this`
      */
      /**
      Callback for Singleton.each.
      @callback Singleton~eachCB
      @param {FieldConfig} fieldConfig
      @this Singleton
      */
      each: function (cb) {
        var self = this;
        if ( isObject(self.fields) && self.__fieldConfig === false ) {
          self.__fieldConfig = [];
          forEach(self.fields,function (field, key) {
            var fieldConfig = isFunction(field) ? field.apply(self, arguments) : isObject(field) ? copy(field) : {};
            fieldConfig.key = fieldConfig.key || key;
            fieldConfig.methodName = fieldConfig.methodName || cap(key);
            self.__fieldConfig.push(fieldConfig);
          });
        }
        if ( isArray(self.__fieldConfig) === true && self.__fieldConfig.length > 0 ) {
          forEach(self.__fieldConfig, function (fieldConfig) {
            cb.call(self, fieldConfig);
          });
        }
        return self;
      },
      /**
      Validates each field.
      @returns {Singleton} `this`
      */
      validate: function() {
        var self = this;
        self.each(function (fieldConfig) {
          self[ fieldConfig.methodName ].valid();
        });
        return self;
      },
      /**
      Clears any pending data that may exist.
      @returns {Singleton} `this`
      */
      cancel: function() {
        var self = this;
        if (self.$dirty) {
          self.$dirty = false;
          self.clearCache();
          self.__setData = {};
        }
        return self;
      },
      /**
      Merges the current and pending data (or sets the current data and removes the pending data).
      @arg {object} [data] - If provided, is used as the finalized data. If not, `this.get()` is used
      @returns {Singleton} `this`
      */
      finalize: function(data) {
        var self = this;
        if ( data || self.$dirty ) {
          self.$dirty = false;
          self.__data = data || self.get();
          self.__setData = {};
          self.trigger('finalize', data);
        }
        return self;
      },
      /**
      Clones __setData and other properties.
      @overrides
      */
      clone: function() {
        var self = this,
            ret = self._super.apply(self, arguments);
        ret.__data = copy(self.__data);
        ret.set(self.__setData);
        ret.$loaded = self.$loaded;
        ret.$parent = self.$parent;
        return ret;
      },
      /**
      Sets `this.$loaded = true`, deletes `this.$busy`, and clears any instance cache that may exist.
      @overrides
      */
      resolve: function() {
        var self = this;
        self.$loaded = true;
        delete self.$busy;
        self.clearCache();
        return self._super.apply(self, arguments);
      },
      /**
      Sets `this.$loaded = true`, deletes `this.$busy`, and clears any instance cache that may exist.
      @overrides
      */
      reject: function() {
        var self = this;
        self.$loaded = true;
        delete self.$busy;
        self.clearCache();
        return self._super.apply(self, arguments);
      },
      
      /**
      Re-runs the last `read` call or, if never called, calls `read`.
      @returns {Singleton} `this`
      */
      refresh: function () {
        var self = this;
        if (self.__lastReadData) {
          return self.read(self.__lastReadData);
        }
        return self.read();
      },

      /**
      Success callback passed into a service.
      @arg data - The data resulting from a sucessful service call
      @callback Singleton~successCallback
      */
      /**
      Fail callback passed into a service.
      @arg data - The data resulting from an erroring service call
      @callback Singleton~failCallback
      */
      /**
      Service to read (GET) the data for this instance. Services should return `false` if they are currently invalid.
      @arg data - Data to be used during the read
      @arg {Singleton~successCallback} Success callback for the service
      @arg {Singleton~failCallback} Failure callback for the service
      @abstract
      @returns {boolean}
      */
      readService: false,
      /**
      Uses the readService (if defined) to attempt to retrieve the data for the instance. Will finalize the instance.
      @arg [data] - Data to be provided to the readService
      @returns {Singleton} `this`
      */
      read: function (data) {
        var self = this,
            ret;
        if (isFunction(self.readService)) {
          self.$busy = true;
          self.unfinalize();
          self.__lastReadData = data || {};
          ret = self.readService(
            data,
            function (data) {
              self.__data = data;
              self.resolve();
            },
            function (data) {
              self.$errors.read = data;
              self.reject();
            }
          );
          if (ret === false) {
            self.reject();
          }
        } else {
          self.reject();
        }
        return self;
      },
      /**
      Service to update (PUT) the data for this instance. Services should return `false` if they are currently invalid.
      @arg data - Data to be used during the update
      @arg {Singleton~successCallback} Success callback for the service
      @arg {Singleton~failCallback} Failure callback for the service
      @abstract
      @returns {boolean}
      */
      updateService: false,
      /**
      Uses the updateService (if defined) to attempt to update the data for the instance. Will finalize the instance upon success.
      @arg [data=this.__setData] - Data to be provided to the updateService
      @returns {Singleton} `this`
      */
      update: function (data) {
        var self = this,
            ret;
        if (isFunction(self.updateService)) {
          self.$busy = true;
          self.unfinalize();
          if (arguments.length === 0) {
            if (self.$dirty === true) {
              data = self.__setData;
            } else {
              return self.resolve();
            }
          }
          ret = self.updateService(
            data,
            function (data) {
              self.finalize(data);
              self.resolve();
            },
            function (data) {
              self.$errors.update = data;
              self.reject();
            }
          );
          if (ret === false) {
            self.reject();
          }
        } else {
          self.reject();
        }
        return self;
      },
      /**
      Service to upload data for this instance. Services should return `false` if they are currently invalid.
      @arg data - Data to be used during the upload
      @arg {Singleton~successCallback} Success callback for the service
      @arg {Singleton~failCallback} Failure callback for the service
      @abstract
      @returns {boolean}
      */
      uploadService: false,
      /**
      Uses the uploadService (if defined) to attempt to upload data for the instance. Will finalize the instance.
      @arg [data] - Data to be provided to the uploadService
      @returns {Singleton} `this`
      */
      upload: function (data) {
        var self = this,
            ret;
        if (isFunction(self.uploadService)) {
          self.$busy = true;
          self.unfinalize();
          ret = self.uploadService(
            data,
            function (data) {
              self.finalize(data);
              self.resolve();
            },
            function (data) {
              self.$errors.upload = data;
              self.reject();
            }
          );
          if (ret === false) {
            self.reject();
          }
        } else {
          self.reject();
        }
        return self;
      },
      /**
      Service to create (POST) data for this instance. Services should return `false` if they are currently invalid.
      @arg data - Data to be used during the creation
      @arg {Singleton~successCallback} Success callback for the service
      @arg {Singleton~failCallback} Failure callback for the service
      @abstract
      @returns {boolean}
      */
      createService: false,
      /**
      Uses the createService (if defined) to attempt to create data for the instance. Will finalize the instance.
      @arg [data=this.get()] - Data to be provided to the createService
      @returns {Singleton} `this`
      */
      create: function (data) {
        var self = this,
            ret;
        if (isFunction(self.createService)) {
          self.$busy = true;
          self.unfinalize();
          if (arguments.length === 0) {
            if (self.$dirty === true) {
              data = self.get();
            } else {
              return self.resolve();
            }
          }
          ret = self.createService(
            data,
            function (data) {
              self.finalize(data);
              self.resolve();
            },
            function (data) {
              self.$errors.create = data;
              self.reject();
            }
          );
          if (ret === false) {
            self.reject();
          }
        } else {
          self.reject();
        }
        return self;
      },
      /**
      Service to remove (DELETE) this instance. Services should return `false` if they are currently invalid.
      @arg data - Data to be used during the deletion
      @arg {Singleton~successCallback} Success callback for the service
      @arg {Singleton~failCallback} Failure callback for the service
      @abstract
      @returns {boolean}
      */
      deleteService: false,
      /**
      Uses the deleteService (if defined) to attempt to create data for the instance. Will finalize the instance.
      @arg [data] - Data to be provided to the deleteService
      @returns {Singleton} `this`
      */
      delete: function (data) {
        var self = this,
            ret;
        if (isFunction(self.deleteService)) {
          self.$busy = true;
          self.unfinalize();
          ret = self.deleteService(
            data,
            function (data) {
              self.finalize(data || {});
              self.resolve();
            },
            function (data) {
              self.$errors.delete = data;
              self.reject();
            }
          );
          if (ret === false) {
            self.reject();
          }
        } else {
          self.reject();
        }
        return self;
      }
    }
  );
  /**
   * Return the constructor function
   */
  return Singleton;
}
angular.module( 'angular-m' ).factory( 'Singleton', $SingletonFactory );
$CollectionFactory.$inject = ['Base', 'Singleton'];
function $CollectionFactory(Base, Singleton) {
  /**
  Base model that represents multiple objects.
  @class Collection
  @extends Base
  @prop {array}   __data         - Current raw data for the instance
  @prop {array}   __addData      - Pending data to add to the instance
  @prop {array}   __modeled      - Cache of __data that has been converted to be the child model
  @prop {array}   __origData     - Pre-filter/sort data (used to return to unsorted/filtered state)
  @prop {number}  length         - Number of known items in the instance
  @prop {boolean} $busy          - If instance is currently in the middle of an API call, equals `true`; else `false`
  @prop {boolean} $loaded        - If instance has been loaded or instantiated with data, equals `true`; else `false`
  @prop {array}   $selected      - Array of selected items
  @prop {number}  $selectedCount - Count of items that are currently selected
  @prop {boolean} $allSelected   - If all known items in the instance are selected, equals `true`; else `false`
  @prop {boolean} $noneSelected  - If none of the items in the instance are selected, equals `true`; else `false`
  @prop {string}  $type          - The type of model the instance is
  */
  var Collection = function() {};

  var reSortExpression = /^\s+([+-]?)(.*)\s+$/;

  function evalSelected() {
    /*jshint validthis:true */
    var self = this;
    self.$allSelected = false;
    self.$noneSelected = true;
    if (self.$selectedCount === self.length && self.length > 0) {
      self.$allSelected = true;
    }
    if (self.$selectedCount > 0) {
      self.$noneSelected = false;
    }
  }

  function getValue(field, obj) {
    var val,
        f;
    if (isString(field) && field.length > 0) {
      field = field.split('.');
      while (field.length > 0) {
        f = field.shift();
        if (isFunction(obj[f]) === false) {
          val = obj[f]();
        } else if (isObject(val) === false) {
          return undefined;
        } else {
          val = obj[f];
        }
      }
      return val;
    }
    return undefined;
  }

  /**
  @typedef ChildModel
  @type {Singleton}
  @prop {Collection} $parent - Link to the parent instance of the child (eg; the Collection instance)
  */
  /**
  Marks the child model as selected
  @name ChildModel.select
  @type function
  @arg {boolean} value - The value to set the selection to
  @arg {boolean} [forBulk] - Passing `true` will prevent re-evaluation of the selected state of the Collection instance (used for bulk selections)
  @returns {ChildModel} `this`
  */

  /**
   * Define constructor
   */
  Collection = Base.extend(
    /** @lends Collection.prototype */
    {
      $type: 'Collection',
      /**
      The model to use when retrieving child objects.
      @type {Singleton}
      */
      childModel: Singleton,
      /**
      Instantiates the Collection.
      @override
      */
      init: function (data, forClone) {
        /*jshint unused:false */
        var self = this._super.apply(this, arguments);

        self.__data = data || [];
        self.__addData = [];
        self.length = self.__data.length;
        self.$loaded = self.length > 0;
        self.__origData = null;
        self.$selected = [];
        self.$selectedCount = 0;
        self.$allSelected = false;
        self.$noneSelected = true;
      },
      /**
      Triggers `cb` for each current child in the instance.
      @arg {Collection~eachCB} cb - Method to call for each child
      @arg data - Additional data to provide to the callback
      @returns {Collection} `this`
      */
      /**
      Callback for Collection.each.
      @callback Collection~eachCB
      @param {number} index - Index position of the child in the current data for the instance.
      @param data - Additional daa provided to the `each` method
      @this ChildModel
      */
      each: function (cb, data) {
        var self = this;
        if (isFunction(cb) === true) {
          forEach(self.get(), cb);
        }
        return self;
      },
      /**
      Method to retrieve all the current data for the instance.
      @returns {ChildModel[]}
      */
      get: function () {
        var self = this;
        if ( self.__modeled ) {
          return self.__modeled;
        }
        self.__modeled = new Array(self.length);
        forEach(self.__data, function (obj, i) {
          var ret = new self.childModel(obj);
          ret.$parent = self;
          ret.select = function (value, forBulk) {
            this.$selected = value;
            self.$selected[i] = value;
            /*jshint -W030 */
            value ? self.$selectedCount++ : self.$selectedCount--;
            if (forBulk !== true) {
              evalSelected.call(self);
            }
            return this;
          };
          self.__modeled[i] = ret;
        });
        return self.__modeled;
      },
      /**
      Method to set the data for the instance. Also sets `this.$loaded = true`. Will re-apply any sorting/filtering after setting the data.
      @arg {array} val - The data to set on the instance
      @returns {Collection} `this`
      */
      set: function (val) {
        var self = this.end(true);
        self.__data = val;
        self.length = self.__data.length;
        self.$loaded = self.$loaded || self.length > 0;
        self.__modeled = null;
        if (self.__filter) {
          self.filter(self.__filter);
        }
        if (self.__sort) {
          self.sort(self.__sort);
        }
        return self;
      },
      /**
      Creates one or more linked ChildModels, but does not add them into the current data.
      @arg {undefined|null|ChildModel|object|Collection|array} val - The pending data to set on the instance
      @returns {ChildModel|Collection|array} `val`
      */
      add: function (obj) {
        var self = this,
            ret = [];
        if (isUndefined(obj) || obj === null) {
          ret.push({});
        } else if (obj instanceof self.childModel) {
          ret.push(obj);
        } else if (obj instanceof Singleton) {
          ret.push(obj.get());
        } else if (obj instanceof Collection) {
          ret = ret.concat(obj.get());
        } else if (isArray(obj) === true) {
          forEach(obj, function (i, val) {
            ret.push(val);
          });
        } else if (isObject(obj) === true) {
          ret.push(obj);
        } else {
          throw new Error('Invalid object added to Collection: ' + obj);
        }
        forEach(ret, function (obj, i) {
          if ((obj instanceof self.childModel) === false) {
            if (obj instanceof Singleton) {
              obj = obj.get();
            }
            obj = new self.childModel(obj);
            obj.$parent = self;
            obj.select = function (value, forBulk) {
              this.$selected = value;
              self.$selected[i] = value;
              /*jshint -W030 */
              value ? self.$selectedCount++ : self.$selectedCount--;
              if (forBulk !== true) {
                evalSelected.call(self);
              }
            };
            ret[i] = obj;
          }
        });
        self.__addData = ret;
        if (obj instanceof Collection || isArray(obj) === true) {
          return ret;
        } else {
          return ret[0];
        }
      },
      filter: function (_filter) {
        var self = this,
            newData = [];
        if (self.__data.length > 0) {
          if (isFunction(_filter) === true) {
            self.__filter = _filter;
            self.select(false);
            self.__origData = self.__origData || copy(self.__data);
            self.__data = filter(self.get(), _filter);
            self.length = self.__data.length;
            self.__modeled = null;
          } else if (isObject(_filter) === true) {
            if (keys(_filter).length > 0) {
              self.__filter = filter;
              self.select(false);
              self.__origData = self.__origData || copy(self.__data);
              filter(self.get(), function (val) {
                var ret = true;
                pick(filter, function (v, k) {
                  var value;
                  if (isFunction(val[k]) === true) {
                    value = val[k]();
                  } else {
                    value = val[k];
                  }
                  ret = ret && _.isEqual(value, v);
                  if (ret === false) {
                    return ret;
                  }
                });
                if (ret === true) {
                  newData.push(val.get());
                }
              });
              self.__data = newData;
              self.length = self.__data.length;
              self.__modeled = null;
              evalSelected.call(self);
            }
          } else {
            throw new Error('Invalid filter value provided: ' + filter);
          }
        }
        return self;
      },
      sort: function (sort, preserveCase) {
        var self = this,
            len, sf;

        function compare(f, descending) {
          var field  = f;
          if (isFunction(f) === false) {
            f = function (a, b) {
              a = getValue(field, a);
              b = getValue(field, b);
              if (isObject(a)) {
                a = JSON.stringify(a);
              }
              if (isObject(b)) {
                b = JSON.stringify(b);
              }
              if (preserveCase !== true) {
                a = ('' + a).toLowerCase();
                b = ('' + b).toLowerCase();
              }
              if (descending) {
                return a > b ? -1 : a < b ? 1 : 0;
              }
              return a > b ? 1 : a < b ? -1 : 0;
            };
          }
          return f;
        }
        function baseF(f, descending) {
          f = compare(f, descending);
          f.next = function (y, d) {
            var x = this;
            y = compare(y, d);
            return baseF(function (a, b) {
              return x(a, b) || y(a, b);
            });
          };
          return f;
        }

        if (self.length > 0) {
          if (isString(sort) === true) {
            sort = sort.split();
          }
          if (isFunction(sort) === true) {
            self.__sort = sort;
            self.__origData = self.__origData || copy(self.__data);
            self.__modeled = self.get().sort(sort);
          } else if (isArray(sort) === true && sort.length > 0) {
            self.__origData = self.__origData || copy(self.__data);
            len = sort.reverse().length;
            while (len--) {
              sort[len] = sort[len].exec(reSortExpression);
              if (sort[len].length !== 3) {
                throw new Error('Invalid sort value provided: ' + sort[len]);
              }
              if (sf) {
                sf.next(sort[len][2], (sort[len][1] === '-' ? true : false));
              } else {
                sf = baseF(sort[len][2], (sort[len][1] === '-' ? true : false));
              }
            }
            self.__modeled = self.get().sort(sf);
          } else {
            throw new Error('Invalid sort value provided: ' + sort);
          }
          self.__data = new Array(self.length);
          self.each(function (item, idx) {
            self.__data[idx] = item.get();
          });
        }
        return self;
      },
      end: function (keepHistory) {
        var self = this;
        if (self.__origData !== null) {
          self.select(false);
          self.__data = copy(self.__origData);
          self.__addData = [];
          self.__modeled = null;
          self.length = self.__data.length;
          self.__origData = null;
          if (keepHistory !== true) {
            delete self.__sort;
            delete self.__filter;
          }
        }
        return self;
      },
      unique: function (field) {
        var self = this,
            uniques = {},
            ret = [];
        if (isString(field) && field.length > 0) {
          self.each(function (i, obj) {
            var val = getValue(field, obj);
            if (isArray(val) === true) {
              forEach(val, function(v) {
                if (isObject(v) === true) {
                  v = JSON.stringify(v);
                }
                if (uniques[v.toString()] === undefined) {
                  uniques[v.toString()] = true;
                  ret.push(v);
                }
              });
            } else  {
              if (isObject(val) === true) {
                val = JSON.stringify(val);
              }
              if (uniques[val.toString()] === undefined) {
                uniques[val.toString()] = true;
                ret.push(val);
              }
            }
          });
        }
        return ret;
      },
      select: function (index, value) {
        var self = this;
        if (index === true) {
          self.$selected = new Array(self.length);
          self.$selectedCount = 0;
          self.each(function () {
            this.select(true, true);
          });
        } else if (index === false) {
          self.each(function () {
            this.select(false, true);
          });
          self.$selected = [];
          self.$selectedCount = 0;
        } else if (isNumber(index) === true) {
          self.get()[index].select(value);
        }
        evalSelected.call(self);
        return self;
      },
      clone: function () {
        var self = this,
            ret = self._super.apply(self, arguments);
        ret.__data = copy(self.__data);
        ret.__addData = copy(self.__addData);
        ret.__origData = copy(self.__origData);
        ret.length = self.length;
        ret.$loaded = ret.$loaded;
        ret.$selected = self.$selected;
        ret.$selectedCount = self.$selectedCount;
        ret.$allSelected = self.$allSelected;
        ret.$noneSelected = self.$noneSelected;
        return ret;
      },
      resolve: function() {
        var self = this;
        self.$loaded = true;
        delete self.$busy;
        return self._super.apply(self, arguments);
      },
      reject: function() {
        var self = this;
        self.$loaded = true;
        delete self.$busy;
        return self._super.apply(self, arguments);
      },    
      
      /**
      Re-runs the last `read` call or, if never called, calls `read`.
      @returns {Collection} `this`
      */
      refresh: function () {
        var self = this;
        if (self.__lastReadData) {
          return self.read(self.__lastReadData);
        }
        return self.read();
      },

      readService: false,
      read: function (data) {
        var self = this,
            ret;
        if (isFunction(self.readService)) {
          self.$busy = true;
          self.unfinalize();
          self.__lastReadData = data || {};
          ret = self.readService(
            data,
            function (data) {
              self.set(data);
              self.resolve();
            },
            function (data) {
              self.$errors.read = data;
              self.reject();
            }
          );
          if (ret === false) {
            self.reject();
          }
        }
        return self;
      },
      /**
      Service to update (PUT) the data for this instance. Services should return `false` if they are currently invalid.
      @arg data - Data to be used during the update
      @arg {Collection~successCallback} Success callback for the service
      @arg {Collection~failCallback} Failure callback for the service
      @abstract
      @returns {boolean}
      */
      updateService: false,
      /**
      Uses the updateService (if defined) to attempt to update the current data for the instance. Will finalize the instance upon success.
      @arg [data] - Data to be provided to the updateService
      @returns {Collection} `this`
      */
      update: function (data) {
        var self = this,
            ret;
        if (isFunction(self.updateService)) {
          self.$busy = true;
          self.unfinalize();
          if (arguments.length === 0) {
            return self.resolve();
          }
          ret = self.updateService(
            data,
            function (data) {
              self.finalize(data);
              self.resolve();
            },
            function (data) {
              self.$errors.update = data;
              self.reject();
            }
          );
          if (ret === false) {
            self.reject();
          }
        } else {
          self.reject();
        }
        return self;
      },
    }
  );
 
  /**
   * Return the constructor function
   */
  return Collection;
}
angular.module( 'angular-m' ).factory( 'Collection', $CollectionFactory );})(window, window.angular);