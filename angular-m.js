/**
 * Angular-based model library for use in MVC framework design
 * @version v1.0.1
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

function HTTPService($rootScope, $http, $q) {

  var METHODS = {
    read: 'GET',
    update: 'PUT',
    change: 'PATCH',
    create: 'POST',
    delete: 'DELETE'
  };

  var offlineError = {online: false};

  function callHTTP(config, success, fail) {
    var deferred = $q.defer(),
        isOnline = m_isBoolean(navigator.onLine) ? navigator.onLine : true;

    config = config || {};
    config.method = config.method || METHODS.read;

    if (isOnline === false) {
      fail(offlineError);
      deferred.reject(offlineError);
    } else {
      $http(config)
        .success(function (data) {
          if (m_isFunction(success)) {
            success(data);
          }
          deferred.resolve(data);
        })
        .error(function (data) {
          if (m_isFunction(fail)) {
            fail(data);
          }
          deferred.reject(data);
        });
    }
    return deferred;
  }

  function callRead(config, success, fail) {
    config = config || {};
    config.method = METHODS.read;
    return this.call(config, success, fail);
  }

  function callUpdate(config, success, fail) {
    config = config || {};
    config.method = METHODS.update;
    return this.call(config, success, fail);
  }

  function callChange(config, success, fail) {
    config = config || {};
    config.method = METHODS.change;
    return this.call(config, success, fail);
  }

  function callCreate(config, success, fail) {
    config = config || {};
    config.method = METHODS.create;
    return this.call(config, success, fail);
  }

  function callDelete(config, success, fail) {
    config = config || {};
    config.method = METHODS.delete;
    return this.call(config, success, fail);
  }

  return {
    METHODS: METHODS,
    
    call: callHTTP,

    read: callRead,
    update: callUpdate,
    change: callChange,
    create: callCreate,
    delete: callDelete,
    
    readList: callRead,
    updateList: callUpdate,
    changeList: callChange,
    createList: callCreate,
    deleteList: callDelete
  };
}

angular.module( 'angular-m.http', [] )
  .service( '$mhttp', [ '$rootScope', '$http', '$q', HTTPService ] );

var RegExConstant = {
  email:      /^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])+$/i,
  latLong:    /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/,
  zip:        /^\d{5}(?:[-\s]\d{4})?$/,
  timeZone:   /^GMT\s[+-]\d{2}:\d{2}$/,
  timeStr:    /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
};

angular.module( 'angular-m' )
  .constant( 'REGEX', RegExConstant );

function BaseFactory() {
  /*jshint strict:false */
  var initializing = false,
      // Need to check which version of function.toString we have
      superPattern = /xy/.test(function () {return 'xy';}) ? /\b_super\b/ : /.*/;

  function executeQueue(idx, data) {
    var self = this,
        i = 0;
    for(; i < self.$$cbQueue.length; i++) {
      if (self.$$cbQueue[i].idx <= idx) {
        if (
          (self.$$cbQueue[i].type < 3 && self.$$finals[idx] && self.$$finals[idx].resolved === true) || // Success (type=1) & Always (type=2)
          (self.$$cbQueue[i].type > 1 && self.$$cbQueue[i].type < 4 && self.$$finals[idx] && self.$$finals[idx].rejected === true) || // Fail (type=3) & Always (type=2)
          (self.$$cbQueue[i].type === 4 && (!self.$$finals[idx] || (!self.$$finals[idx].resolved && !self.$$finals[idx].rejected))) // Progress (type=4)
        ) {
          self.$$cbQueue[i].cb.call(self, data);
        }
        // If this thread is resolved or rejected, then remove the cb from the queue to keep executions faster
        if (self.$$finals[idx].resolved || self.$$finals[idx].rejected) {
          self.$$cbQueue.splice(i, 1);
          i--;
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
  Event that triggers when the model is notified (progress is recorded)
  @event Base#notified
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
  @prop {Object}  $errors       - Contains details about any error states on the instance
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
      self.$$arguments = m_copy(arguments);
      self.$$cbQueue = [];
      self.$$cbQueueIdx = 1;
      self.$$finals = [];
      self.$$listeners = {};
      self.$errors = {};
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
      ret.$$arguments = m_copy(self.$$arguments);
      self.trigger('cloned', ret);
      return ret;
    },
    /**
    Indicates whether the instance has been finalized (resolved or rejected)
    @arg {number} [idx=this.$$cbQueueIdx] Thread index to check
    @return {Boolean}
    */
    isFinal: function (idx) {
      var self = this;
      idx = idx || self.$$cbQueueIdx;
      if (self.$$finals[idx]) {
        return !!(self.$$finals[idx].resolved || self.$$finals[idx].rejected);
      }
      return false;
    },
    /**
    Marks the promie thread as "resolved" (successfully complete).
    @arg [idx=this.$$cbQueueIdx] - Promise thread to resolve
    @arg [data] - Data related to the resolution
    @fires Base#resolved
    @fires Base#finalized
    @return {Base} `this`
    */
    resolve: function (idx, data) {
      var self = this;
      idx = idx || self.$$cbQueueIdx;
      if (!self.isFinal(idx)) {
        self.$$finals[idx] = {
          resolved: true,
          data: data
        };
        executeQueue.call(self, idx, data);
        self.trigger('resolved', data);
      }
      return self;
    },
    /**
    Marks the promise thread as "rejected" (unsuccessfully complete).
    @arg [idx=this.$$cbQueueIdx] - Promise thread to reject
    @arg [data] - Data related to the rejection
    @fires Base#rejected
    @fires Base#finalized
    @returns {Base} `this`
    */
    reject: function (idx, data) {
      var self = this;
      idx = idx || self.$$cbQueueIdx;
      if (!self.isFinal(idx)) {
        self.$$finals[idx] = {
          rejected: true,
          data: data
        };
        executeQueue.call(self, idx, data);
        self.trigger('rejected', data);
      }
      return self;
    },
    /**
    Triggers a progress step for the provided promise thread.
    @arg [idx=this.$$cbQueueIdx] - Promise thread to notify of progress
    @arg [data] - Data related to the progress step
    @fires Base#notified
    @returns {Base} `this`
    */
    notify: function (idx, data) {
      var self = this;
      idx = idx || self.$$cbQueueIdx;
      if (!self.isFinal(idx)) {
        executeQueue.call(self, idx, data);
        self.trigger('notified', data);
      }
      return self;
    },
    /**
    "Resets" the Promise state on the instance by incrementing the current promise thread index.
    @fires Base#unfinalized
    @returns {number} `idx` New promise thread index
    */
    unfinalize: function () {
      this.trigger('unfinalized');
      return ++this.$$cbQueueIdx;
    },
    /**
    Attaches success/fail/progress callbacks to the current promise thread, which will trigger upon the next resolve/reject call respectively or, if the current promise thread is already final, immediately.
    @arg {Base~successCallback}   [success]
    @arg {Base~failCallback}      [fail]
    @arg {Base~progressCallback}  [progress]
    @returns {Base} `this`
    */
    /**
    Success callback will be triggered when/if the current promise thread is resolved.
    @callback Base~successCallback
    */
    /**
    Fail callback will be triggered when/if the current promise thread is rejected.
    @callback Base~failCallback
    */
    /**
    Progress callback will be triggered as the current promise thread passes through various states of progress.
    @callback Base~progressCallback
    */
    then: function(success, fail, progress) {
      var self = this;
      if (m_isFunction(success)) {
        self.$$cbQueue.push({
          type: 1,
          cb: success,
          idx: self.$$cbQueueIdx
        });
      }
      if (m_isFunction(fail)) {
        self.$$cbQueue.push({
          type: 3,
          cb: fail,
          idx: self.$$cbQueueIdx
        });
      }
      if (m_isFunction(progress)) {
        self.$$cbQueue.push({
          type: 4,
          cb: progress,
          idx: self.$$cbQueueIdx
        });
      }
      if (self.$$finals[self.$$cbQueueIdx]) {
        executeQueue.call(self, self.$$cbQueueIdx, self.$$finals[self.$$cbQueueIdx].data);
      }
      return self;
    },
    /**
    Attaches a callback to the current promise thread which will trigger upon the next finalization or, if the current promise thread is already final, immediately.
    @arg {Base~alwaysCallback} [always]
    @returns {Base} `this`
    */
    /**
    Always callback will be triggered when/if the current promise thread is finalized (either resolved OR rejected).
    @callback Base~alwaysCallback
    */
    always: function (always) {
      var self = this;
      if (m_isFunction(always)) {
        self.$$cbQueue.push({
          type: 2,
          cb: always,
          idx: self.$$cbQueueIdx
        });
      }
      if (self.$$finals[self.$$cbQueueIdx]) {
        executeQueue.call(self, self.$$cbQueueIdx, self.$$finals[self.$$cbQueueIdx].data);
      }
      return self;
    },
    /**
    Attaches success callback to the current promise thread.
    @param {Base~successCallback} [success]
    @return {Base} `this`
    */
    success: function (cb) {
      return this.then(cb);
    },
    /**
    Attaches fail callback to the current promise thread.
    @param {Base~failCallback} [fail]
    @return {Base} `this`
    */
    fail: function (cb) {
      return this.then(null, cb);
    },
    /**
    Attaches a progress callback to the current promise thread.
    @param {Base~progressCallback} [progress]
    @return {Base} `this`
    */
    progress: function (cb) {
      return this.then(null, null, cb);
    },
    /**
    Attaches a listener to an event type.
    @param {String} type - The type of event to listen for
    @param {Function} cb - The function to trigger every time the event type occurs
    @return {Base} `this`
    */
    bind: function (type, cb) {
      var self = this;
      if (m_isString(type) && m_isFunction(cb)) {
        self.$$listeners[type] = self.$$listeners[type] || [];
        self.$$listeners[type].push(cb);
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
      if (m_isString(type) && m_isArray(self.$$listeners[type]) && self.$$listeners[type].length > 0) {
        if (m_isFunction(listener)) {
          self.$$listeners[type] = filter(self.$$listeners[type], function (cb) {
            return cb !== listener;
          });
        } else {
          delete self.$$listeners[type];
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
      if (m_isString(type) && m_isFunction(cb)) {
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
      if (m_isString(type) && m_isArray(self.$$listeners[type]) && self.$$listeners[type].length > 0) {
        m_forEach(self.$$listeners[type], function (cb) {
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
    var _super = this.prototype,
        proto, key;

    function construct(constructor, args) {
      function Class() {
        return constructor.apply(this, args);
      }
      Class.prototype = constructor.prototype;
      return new Class();
    }

    function createFnProp (key, fn, super2) {
      return function() {
        var tmp = this._super,
            ret;

        this._super = super2[ key ];
        ret = fn.apply(this, arguments);
        if (m_isFunction(tmp)) {
          this._super = tmp;
        } else {
          delete this._super;
        }
        return ret;
      };
    }
    
    function Class() {
      if (this.constructor !== Class) {
        return construct(Class, arguments);
      }
      if (!initializing && m_isFunction(this.init)) {
        return this.init.apply(this, arguments);
      }
    }

    initializing = true;
    proto = new this();
    initializing = false;
    if (!properties.$type) {
      properties.$type = 'Class';
    }

    if (m_isFunction(proto.$preExtend)) {
      properties = proto.$preExtend(properties);
    }
    for (key in properties) {
      if (properties.hasOwnProperty(key)) {
        if (m_isFunction(properties[ key ]) && m_isFunction(_super[ key ]) && superPattern.test(properties[ key ])) {
          proto[ key ] = createFnProp(key, properties[ key ], _super);
        } else {
          proto[ key ] = properties[ key ];
        }
      }
    }
    Class.prototype = proto;
    if (Object.defineProperty) {
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

angular.module( 'angular-m' )
  .factory( 'Base', BaseFactory );

function SingletonFactory(Base, REGEX) {
  /**
  Base model that represents a single object.
  @class Singleton
  @extends Base
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
    return str.charAt(0).toLowerCase() + str.slice(1).replace(/_([a-z])/g, function ( v, l ) {
      return l.toUpperCase();
    });
  }
  function label(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_([a-z])/g, function (v, l) {
      return ' ' + l.toUpperCase();
    });
  }
  function setError(field, key, value) {
    /*jshint validthis:true */
    var self = this;
    self.$errors[field] = self.$errors[field] || {};
    self.$errors[field][key] = value;
    self[field].$errors[key] = value;
  }
  function validate(val, fieldConfig) {
    /*jshint validthis:true */
    /*jshint laxbreak:true */
    var self = this,
        ret = true,
        matches, limit, equals;

    // setError(... true) === In error state
    // setError(... false) === In valid state
    // ret === false if ever setError(... true)

    // required
    if ( fieldConfig.required === true || ( m_isFunction(fieldConfig.required) === true && fieldConfig.required.call(self, val) === true ) ) {
      if ( m_isUndefined(val) || m_isNull(val) || val.length === 0 ) {
        setError.call(self, fieldConfig.methodName, 'required', true );
        ret = false;
      } else {
        setError.call(self, fieldConfig.methodName, 'required', false );
      }
    }

    if ( m_isUndefined(val) === false && m_isNull(val) === false ) {
    // START DEFINED-ONLY CHECKS

      // type
      if ( indexOf(['st','nu','ob','ar','bo','dt'], fieldConfig.type ) > -1 ) {
        setError.call(self, fieldConfig.methodName, 'type', false );
        if ( ( fieldConfig.type === 'st' && !m_isString(val) )
          || ( fieldConfig.type === 'nu' && !m_isNumber(val) )
          || ( fieldConfig.type === 'ob' && !m_isObject(val) )
          || ( fieldConfig.type === 'ar' && !m_isArray(val) )
          || ( fieldConfig.type === 'bo' && !m_isBoolean(val) )
          || ( fieldConfig.type === 'dt' && !m_isDate(new Date(val)) )
        ) {
          setError.call(self, fieldConfig.methodName, 'type', true );
          ret = false;
        }
      }

      // min/max
      if ( m_isNumber(fieldConfig.min) || ( fieldConfig.type === 'dt' && m_isDate(fieldConfig.min) ) ) {
        if ( ( fieldConfig.type === 'st' || fieldConfig.type === 'ar' ) && val.length >= fieldConfig.min ) {
          setError.call(self, fieldConfig.methodName, 'min', false );
        } else if ( ( !fieldConfig.type || fieldConfig.type === 'nu' ) && parseFloat( val ) >= fieldConfig.min ) {
          setError.call(self, fieldConfig.methodName, 'min', false );
        } else if ( fieldConfig.type === 'dt' && new Date( val ) >= new Date(fieldConfig.min) ) {
          setError.call(self, fieldConfig.methodName, 'min', false );
        } else {
          setError.call(self, fieldConfig.methodName, 'min', true );
          ret = false;
        }
      }
      if ( m_isNumber(fieldConfig.max) || ( fieldConfig.type === 'dt' && m_isDate(fieldConfig.max) ) ) {
        if ( ( fieldConfig.type === 'st' || fieldConfig.type === 'ar' ) && val.length <= fieldConfig.max ) {
          setError.call(self, fieldConfig.methodName, 'max', false );
        } else if ( ( !fieldConfig.type || fieldConfig.type === 'nu' ) && parseFloat( val ) <= fieldConfig.max ) {
          setError.call(self, fieldConfig.methodName, 'max', false );
        } else if ( fieldConfig.type === 'dt' && new Date( val ) <= new Date(fieldConfig.max) ) {
          setError.call(self, fieldConfig.methodName, 'max', false );
        } else {
          setError.call(self, fieldConfig.methodName, 'max', true );
          ret = false;
        }
      }

      // equals
      if ( m_isString(fieldConfig.equals) ) {
        if ( m_isFunction(self[fieldConfig.equals]) && m_equals(self[fieldConfig.equals](), val) ) {
          setError.call(self, fieldConfig.methodName, 'equals', false );
          setError.call(self, fieldConfig.equals, 'equals', false );
          self.trigger('validated.' + fieldConfig.equals, false);
        } else {
          setError.call(self, fieldConfig.methodName, 'equals', true );
          setError.call(self, fieldConfig.equals, 'equals', true );
          self.trigger('validated.' + fieldConfig.equals, true);
          ret = false;
        }
      } else if ( m_isArray(fieldConfig.equals) ) {
        equals = false;
        m_forEach(fieldConfig.equals, function (target) {
          if ( m_isFunction(self[target]) ) {
            if ( m_equals(self[target](), val) ) {
              equals = true;
              setError.call(self, target, 'equals', false );
              self.trigger('validated.' + target, false);
            } else {
              setError.call(self, target, 'equals', true );
              self.trigger('validated.' + target, true);
            }
          }
        });
        setError.call(self, fieldConfig.methodName, 'equals', !equals );
        ret = ret && equals;
      }

    // END DEFINED-ONLY CHECKS
    }

    // matches
    if ( m_isRegEx(fieldConfig.matches) ) {
      matches = fieldConfig.matches.test(val) || ( m_isUndefined(val) || m_isNull(val) || val.length === 0 );
      setError.call(self, fieldConfig.methodName, 'matches', !matches );
      ret = matches && ret;
    }

    // limit
    if ( m_isUndefined(fieldConfig.limit) === false && m_isNull(fieldConfig.limit) === false ) {
      if ( m_isUndefined(val) || m_isNull(val) || val.length === 0 ) {
        setError.call(self, fieldConfig.methodName, 'limit', false );
      } else if ( m_isArray(fieldConfig.limit) || m_isObject(fieldConfig.limit) ) {
        limit = false;
        m_forEach(fieldConfig.limit, function (lim) {
          if ( m_isObject( lim ) === true && !m_isNull(lim.value) && !m_isUndefined(lim.value) ) {
            limit = limit || m_equals(lim.value, val);
          } else {
            limit = limit || m_equals(lim, val);
          }
        });
        // limit === true when a match was found, so invert for setError
        setError.call(self, fieldConfig.methodName, 'limit', !limit );
        ret = limit && ret;
      } else if ( m_isString(fieldConfig.limit) || m_isNumber(fieldConfig.limit) || m_isBoolean(fieldConfig.limit) ) {
        limit = m_equals(fieldConfig.limit, val);
        setError.call(self, fieldConfig.methodName, 'limit', !limit );
        ret = limit && ret;
      }
    }

    return ret;
  }

  Singleton = Base.extend(
    /** @lends Singleton.prototype */
    {
      $type: 'Singleton',
      $preExtend: function (properties) {
        if ( m_isObject(this.fields) ) {
          properties.fields = merge( {}, this.fields, properties.fields );
          m_forEach(properties.fields, function (value, key) {
            if ( value === false ) {
              delete properties.fields[key];
            }
          });
        }
        return properties;
      },
      /**
      Instantiates the Singleton by setting up all the field getter/setters.
      @override
      */
      init: function (data, forClone) {
        /*jshint unused:false */
        var self = this._super.apply(this, arguments);
        self.$$merged = self.$$data = data || {};
        self.$$setData = {};
        self.$loaded = data ? true : false;
        self.$dirty = false;
        self.$pristine = true;
        self.$busy = false;
        self.$valid = true;
        self.$invalid = false;
        self.$$fieldConfig = false;

        return self.each(function (fieldConfig) {
          if ( fieldConfig.getter !== undefined && !m_isFunction(fieldConfig.getter) ) {
            throw new Error('Singleton Init Error: "getter" must be undefined/null or a function');
          }
          if ( fieldConfig.setter !== undefined && !m_isFunction(fieldConfig.setter) ) {
            throw new Error('Singleton Init Error: "setter" must be undefined/null or a function');
          }
          function getter() {
            var ret,
                field = fieldConfig.key;
            //console.log('getter: ' + (fieldConfig.key ? fieldConfig.key : key) + ' = ' + self.get()[ fieldConfig.key ? fieldConfig.key : key ] );
            if ( fieldConfig.$$getterCacheSet === true ) {
              return fieldConfig.$$getterCache;
            }
            if ( fieldConfig.getter ) {
              ret = fieldConfig.getter.call(self, fieldConfig);
              if ( ret === undefined ) {
                return ret;
              }
            } else {
              field = field.split( '.' );
              ret = self.get()[ field.shift() ];
              while ( field.length > 0 ) {
                if ( m_isObject( ret ) === false ) {
                  return null;
                }
                ret = ret[ field.shift() ];
              }
              if ( ( ret === null || ret === undefined ) && fieldConfig.default !== undefined ) {
                ret = fieldConfig.default;
              }
              if ( m_isFunction(fieldConfig.mutateGet) === true ) {
                ret = fieldConfig.mutateGet.call(self, ret, fieldConfig);
              }
            }
            fieldConfig.$$getterCacheSet = true;
            fieldConfig.$$getterCache = ret;
            return ret;
          }
          function setter(val) {
            var field = fieldConfig.key,
                f, target;
            //console.log('setter: ' + (fieldConfig.key ? fieldConfig.key : key) + ' = ' + val );
            if ( fieldConfig.readonly === true ) {
              throw new Error(fieldConfig.methodName + ' is read-only.' );
            }
            self.$$merged = false;
            self.$dirty = true;
            self.$pristine = false;
            self.$loaded = true;
            fieldConfig.$$getterCacheSet = false;
            delete fieldConfig.$$getterCache;
            if ( fieldConfig.setter ) {
              fieldConfig.setter.call(self, val, fieldConfig);
              return self;
            }
            field = field.split( '.' );
            target = self.$$setData;
            while ( field.length > 1 ) {
              f = field.shift();
              target = target[ f ] = m_isObject( target[ f ] ) === true ? target[ f ] : {};
            }
            if ( m_isFunction(fieldConfig.mutateSet) === true ) {
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
          self[ fieldConfig.methodName ] = function (val) {
            if ( arguments.length ) {
              return setter.call(self[ fieldConfig.methodName ], val);
            }
            return getter.call(self[ fieldConfig.methodName ]);
          };
          self[ fieldConfig.methodName ].$label = fieldConfig.label || label(fieldConfig.configKey);
          fieldConfig.label = self[fieldConfig.methodName].$label;
          self[ fieldConfig.methodName ].$errors = {};
          self[ fieldConfig.methodName ].$parent = self;
          self[ fieldConfig.methodName ].$config = fieldConfig;
          self[ fieldConfig.methodName ].valid = function ( val ) {
            var ret = true,
                i = 0;
            if ( arguments.length === 0 ) {
              val = self[ fieldConfig.methodName ]();
            }
            if ( m_isFunction( fieldConfig.validator ) ) {
              ret = fieldConfig.validator.call(self, val, fieldConfig);
              setError(self, fieldConfig.methodName, 'validator', !ret);
            }
            ret = validate.call(self, val, fieldConfig) && ret;
            if (ret === false) {
              self.$valid = ret;
            } else if (self.$valid === false) {
              // Set $valid state to null to prevent endless loop if first field is valid
              self.$valid = null;
              for(; i<self.$$fieldConfig.length; i++) {
                self.$valid = self[ self.$$fieldConfig[i].methodName ].valid();
                if (self.$valid === false) {
                  break;
                }
              }
            }
            self.$invalid = !self.$valid;
            self.trigger('validated.' + fieldConfig.methodName, ret);
            return ret;
          };
        }); 
      },
      /**
      Method to retrieve all the current and pending data ($$data extended by $$setData) for the instance.
      @returns {object}
      */
      get: function () {
        var self = this;
        // Use a static variable as a cache
        if (self.$$merged !== false) {
          return self.$$merged;
        }
        self.$$merged = merge({}, self.$$data, self.$$setData);
        return self.$$merged;
      },
      /**
      Method to set the pending data ($$setData) for the instance. Also sets `this.$loaded = true`.
      @arg {object} val - The pending data to set on the instance
      @returns {Singleton} `this`
      */
      set: function (val) {
        var self = this;
        self.$$merged = false;
        self.$dirty = true;
        self.$pristine = false;
        self.$$setData = m_copy(val);
        self.$loaded = self.$loaded || objectKeys(val).length > 0;
        self.clearCache();
        return self;
      },
      /**
      Clears any instance and field cache that is currently present.
      @returns {Singleton} `this`
      */
      clearCache: function () {
        var self = this;
        if (self.$$merged !== false) {
          self.$$merged = false;
          self.each(function (fieldConfig) {
            fieldConfig.$$getterCacheSet = false;
            delete fieldConfig.$$getterCache;
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
        if ( m_isObject(self.fields) && self.$$fieldConfig === false ) {
          self.$$fieldConfig = [];
          m_forEach(self.fields, function (field, key) {
            var fieldConfig = m_isFunction(field) ? field.apply(self, arguments) : m_isObject(field) ? m_copy(field) : {};
            fieldConfig.key = fieldConfig.key || key;
            fieldConfig.configKey = key;
            fieldConfig.methodName = fieldConfig.methodName || cap(key);
            self.$$fieldConfig.push(fieldConfig);
          });
        }
        if ( m_isArray(self.$$fieldConfig) === true && self.$$fieldConfig.length > 0 ) {
          m_forEach(self.$$fieldConfig, function (fieldConfig) {
            cb.call(self, fieldConfig);
          });
        }
        return self;
      },
      /**
      Pulls fields out of the mode and returns them as an object. Can pas in a function to use a dynamic pick list.
      @arg {array|Singleton~pickCB} fields - List of fields to include OR function to call for each field to dynamically determine whether to include it or not
      @returns {object}
      */
      /**
      Callback for Singleton.pick.
      @callback Singleton~pickCB
      @param {FieldConfig} fieldConfig
      @param {key} fieldConfig.key
      @this {Singleton} `this`
      */
      pick: function (fields) {
        var self = this,
            ret = {},
            _fields = [];
        if ( m_isArray(self.$$fieldConfig) === true && self.$$fieldConfig.length > 0 ) {
          if (m_isFunction(fields)) {
            m_forEach(self.$$fieldConfig, function (config) {
              if ( fields.call(self, config) === true ) {
                _fields.push(config.key);
              }
            });
          } else {
            _fields = fields;
          };
          ret = pick(self.get(), _fields);
        }
        return ret;
      },
      /**
      Validates each field and returns whether the model is valid or not.
      @returns {boolean}
      */
      validate: function () {
        var self = this;
        self.each(function (fieldConfig) {
          self[ fieldConfig.methodName ].valid();
        });
        self.trigger('validated', self.$valid);
        return self.$valid;
      },
      /**
      Clears any pending data that may exist.
      @returns {Singleton} `this`
      */
      cancel: function () {
        var self = this;
        if (self.$dirty) {
          self.$dirty = false;
          self.$pristine = true;
          self.clearCache();
          self.$$setData = {};
        }
        return self;
      },
      /**
      Merges the current and pending data (or sets the current data and removes the pending data).
      @arg {object} [data] - If provided, is used as the finalized data. If not, `this.get()` is used
      @returns {Singleton} `this`
      */
      finalize: function (data) {
        var self = this;
        if ( data || self.$dirty ) {
          self.$dirty = false;
          self.$pristine = true;
          self.$$data = data || self.get();
          self.$$setData = {};
          self.trigger('finalized', data);
        }
        return self;
      },
      /**
      Clones $$setData and other properties.
      @overrides
      */
      clone: function () {
        var self = this,
            ret = self._super.apply(self, arguments);
        ret.$$data = m_copy(self.$$data);
        if ( objectKeys(self.$$setData).length > 0 ) {
          ret.set(self.$$setData);
        }
        ret.$loaded = self.$loaded;
        ret.$parent = self.$parent;
        return ret;
      },
      /**
      Sets `this.$loaded = true`, deletes `this.$busy`, and clears any instance cache that may exist.
      @overrides
      */
      resolve: function () {
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
      reject: function () {
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
        if (self.$$lastReadData) {
          return self.read(self.$$lastReadData);
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
      read: function (data, idx) {
        var self = this,
          ret;

        if (self.$busy === true) {
          self.always(function() {
            self.read(data, idx);
          });
          idx = self.unfinalize();
          return self;
        } else {
          idx = idx || self.unfinalize();
        }

        if (m_isFunction(self.readService)) {
          self.$busy = true;
          self.$$lastReadData = data || {};
          ret = self.readService(
            data,
            function (data) {
              delete self.$errors.read;
              self.finalize(data);
              self.resolve(idx);
              self.trigger('read', data);
            },
            function (data) {
              self.$errors.read = data;
              self.reject(idx);
            }
          );
          if (ret === false) {
            self.$errors.read = true;
            self.reject(idx);
          }
        } else {
          self.$errors.read = true;
          self.reject(idx);
        }
        return self;
      },
      /**
      Service to update (PUT) the data for this instance. Services should return `false` if they are currently invalid.
      @arg [data] - Data to be used during the update
      @arg {Singleton~successCallback} Success callback for the service
      @arg {Singleton~failCallback} Failure callback for the service
      @abstract
      @returns {boolean}
      */
      updateService: false,
      /**
      Uses the updateService (if defined) to attempt to update the data for the instance. Will finalize the instance upon success.
      @arg [data] - Data to be provided to the updateService. Defaults to an object contining all the fields who's "updateable" config is not false
      @returns {Singleton} `this`
      */
      update: function (data, idx) {
        var self = this,
          ret;

        if (self.$busy === true) {
          self.always(function() {
            self.update(data, idx);
          });
          idx = self.unfinalize();
          return self;
        } else {
          idx = idx || self.unfinalize();
        }

        if (m_isFunction(self.updateService)) {
          self.$busy = true;
          if (arguments.length === 0) {
            if (self.$dirty === true) {
              data = self.pick(function (fieldConfig) {
                if (fieldConfig.updateable !== false) {
                  return true;
                }
              });
            }
          }
          if (objectKeys(data).length === 0) {
            delete self.$errors.update;
            return self.resolve(idx);
          }
          ret = self.updateService(
            data,
            function (data) {
              delete self.$errors.update;
              self.finalize(data);
              self.resolve(idx);
              self.trigger('updated', data);
            },
            function (data) {
              self.$errors.update = data;
              self.reject(idx);
            }
          );
          if (ret === false) {
            self.$errors.update = true;
            self.reject(idx);
          }
        } else {
          self.$errors.update = true;
          self.reject(idx);
        }
        return self;
      },
      /**
      Service to change (PATCH) the data for this instance. Services should return `false` if they are currently invalid.
      @arg data - Data to be used during the change
      @arg {Singleton~successCallback} Success callback for the service
      @arg {Singleton~failCallback} Failure callback for the service
      @abstract
      @returns {boolean}
      */
      changeService: false,
      /**
      Uses the changeService (if defined) to attempt to change the data for the instance. Will finalize the instance upon success.
      @arg [data=this.$$setData] - Data to be provided to the changeService. Defaults to an object contining all the fields who's value has changed and who's "updateable" config is not false
      @returns {Singleton} `this`
      */
      change: function (data, idx) {
        var self = this,
            fields,
            ret;

        if (self.$busy === true) {
          self.always(function() {
            self.change(data, idx);
          });
          idx = self.unfinalize();
          return self;
        } else {
          idx = idx || self.unfinalize();
        }

        if (m_isFunction(self.changeService)) {
          self.$busy = true;
          if (arguments.length === 0) {
            if (self.$dirty === true) {
              if ( m_isArray(self.$$fieldConfig) === true && self.$$fieldConfig.length > 0 ) {
                fields = pick(self.$$fieldConfig, function (fieldConfig) {
                  if (fieldConfig.updateable !== false) {
                    return fieldConfig.key;
                  }
                }, self);
                data = pick(self.$$setData, fields);
              }
            }
          }
          if (objectKeys(data).length === 0) {
            delete self.$errors.change;
            return self.resolve(idx);
          }
          ret = self.changeService(
            data,
            function (data) {
              delete self.$errors.change;
              self.finalize(data);
              self.resolve(idx);
              self.trigger('changed', data);
            },
            function (data) {
              self.$errors.change = data;
              self.reject(idx);
            }
          );
          if (ret === false) {
            self.$errors.change = true;
            self.reject(idx);
          }
        } else {
          self.$errors.change = true;
          self.reject(idx);
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
      upload: function (data, idx) {
        var self = this,
          ret;

        if (self.$busy === true) {
          self.always(function() {
            self.upload(data, idx);
          });
          idx = self.unfinalize();
          return self;
        } else {
          idx = idx || self.unfinalize();
        }

        if (m_isFunction(self.uploadService)) {
          self.$busy = true;
          ret = self.uploadService(
            data,
            function (data) {
              delete self.$errors.upload;
              self.finalize(data);
              self.resolve(idx);
              self.trigger('uploaded', data);
            },
            function (data) {
              self.$errors.upload = data;
              self.reject(idx);
            }
          );
          if (ret === false) {
            self.$errors.upload = true;
            self.reject(idx);
          }
        } else {
          self.$errors.upload = true;
          self.reject(idx);
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
      @arg [data] - Data to be provided to the createService. Defaults to an object contining all the fields who's "createable" config is not false
      @returns {Singleton} `this`
      */
      create: function (data, idx) {
        var self = this,
          ret;

        if (self.$busy === true) {
          self.always(function() {
            self.create(data, idx);
          });
          idx = self.unfinalize();
          return self;
        } else {
          idx = idx || self.unfinalize();
        }

        if (m_isFunction(self.createService)) {
          self.$busy = true;
          if (arguments.length === 0) {
            if (self.$dirty === true) {
              data = self.pick(function (fieldConfig) {
                if (fieldConfig.createable !== false) {
                  return fieldConfig.key;
                }
              });
            }
          }
          if (objectKeys(data).length === 0) {
            delete self.$errors.create;
            return self.resolve(idx);
          }
          ret = self.createService(
            data,
            function (data) {
              delete self.$errors.create;
              self.finalize(data);
              self.resolve(idx);
              self.trigger('created', data);
            },
            function (data) {
              self.$errors.create = data;
              self.reject(idx);
            }
          );
          if (ret === false) {
            self.$errors.create = true;
            self.reject(idx);
          }
        } else {
          self.$errors.create = true;
          self.reject(idx);
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
      delete: function (data, idx) {
        var self = this,
          ret;

        if (self.$busy === true) {
          self.always(function() {
            self.delete(data, idx);
          });
          idx = self.unfinalize();
          return self;
        } else {
          idx = idx || self.unfinalize();
        }

        if (m_isFunction(self.deleteService)) {
          self.$busy = true;
          ret = self.deleteService(
            data,
            function (data) {
              delete self.$errors.delete;
              self.finalize(data || {});
              self.resolve(idx);
              self.trigger('deleted', data);
            },
            function (data) {
              self.$errors.delete = data;
              self.reject(idx);
            }
          );
          if (ret === false) {
            self.$errors.delete = true;
            self.reject(idx);
          }
        } else {
          self.$errors.delete = true;
          self.reject(idx);
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
angular.module( 'angular-m' )
  .factory( 'Singleton', ['Base', 'REGEX', SingletonFactory ] );

function CollectionFactory(Base, Singleton) {
  /**
  Base model that represents multiple objects.
  @class Collection
  @extends Base
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
    if (m_isString(field) && field.length > 0) {
      field = field.split('.');
      while (field.length > 0) {
        f = field.shift();
        if (m_isFunction(obj[f]) === true) {
          val = obj[f]();
        } else if (m_isObject(val) === false) {
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

        self.$$data = data || [];
        self.$$addData = [];
        self.length = self.$$data.length;
        self.$loaded = self.length > 0;
        self.$$origData = null;
        self.$selected = [];
        self.$selectedCount = 0;
        self.$allSelected = false;
        self.$noneSelected = true;
        self.$busy = false;
      },
      /**
      Triggers `cb` for each current child in the instance.
      @arg {Collection~eachCB} cb - Method to call for each child
      @returns {Collection} `this`
      */
      /**
      Callback for Collection.each.
      @callback Collection~eachCB
      @param data - The child object
      @param {number} index - Index position of the child in the current data for the instance
      @this {Singleton} `this`
      */
      each: function (cb) {
        var self = this;
        if (m_isFunction(cb) === true) {
          m_forEach(self.get(), cb);
        }
        return self;
      },
      /**
      Triggers `cb` for each current child in the instance and returns the resulting array.
      @arg {Collection~mapCB} cb - Method to call for each child
      @returns {Array} Result of the map opperation
      */
      /**
      Callback for Collection.map.
      @callback Collection~mapCB
      @param data - The child object
      @param {number} index - Index position of the child in the current data for the instance.
      @this {Singleton} `this`
      */
      map: function (cb) {
        if (m_isFunction(cb) === true) {
          return map(this.get(), cb);
        }
        return [];
      },
      /**
      Method to retrieve all the current data for the instance.
      @returns {ChildModel[]}
      */
      get: function () {
        var self = this;
        if ( self.$$modeled ) {
          return self.$$modeled;
        }
        self.$$modeled = new Array(self.length);
        m_forEach(self.$$data, function (obj, i) {
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
          self.$$modeled[i] = ret;
        });
        return self.$$modeled;
      },
      /**
      Method to retrieve specific fields from all the current data for the instance.
      @returns {Object[]}
      */
      pluck: function (fields) {
        var self = this,
            ret = new Array(self.length);
        if (m_isArray(fields) === false) {
          fields = [fields];
        }
        self.each(function (child, idx) {
          m_forEach(fields, function (f) {
            if (m_isFunction(child[f])) {
              ret[idx] = ret[idx] || {};
              ret[idx][f] = child[f]();
            }
          });
        });
        return ret;
      },
      /**
      Method to set the data for the instance. Also sets `this.$loaded = true`. Will re-apply any sorting/filtering after setting the data.
      @arg {array} val - The data to set on the instance
      @returns {Collection} `this`
      */
      set: function (val) {
        var self = this.end(true);
        self.$$data = val;
        self.length = self.$$data.length;
        self.$loaded = self.$loaded || self.length > 0;
        self.$$modeled = null;
        if (self.$$filter) {
          self.filter(self.$$filter);
        }
        if (self.$$sort) {
          self.sort(self.$$sort);
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
        if (m_isUndefined(obj) || obj === null) {
          ret.push({});
        } else if (obj instanceof self.childModel) {
          ret.push(obj);
        } else if (obj instanceof Singleton) {
          ret.push(obj.get());
        } else if (obj instanceof Collection) {
          ret = ret.concat(obj.get());
        } else if (m_isArray(obj) === true) {
          m_forEach(obj, function (i, val) {
            ret.push(val);
          });
        } else if (m_isObject(obj) === true) {
          ret.push(obj);
        } else {
          throw new Error('Invalid object added to Collection: ' + obj);
        }
        m_forEach(ret, function (obj, i) {
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
        self.$$addData = ret;
        if (obj instanceof Collection || m_isArray(obj) === true) {
          return ret;
        } else {
          return ret[0];
        }
      },
      filter: function (_filter) {
        var self = this,
            newData = [];
        if (self.$$data.length > 0) {
          if (m_isFunction(_filter) === true) {
            self.$$filter = _filter;
            self.$$origData = self.$$origData || m_copy(self.$$data);
            self.$$data = filter(self.get(), _filter);
            self.length = self.$$data.length;
            self.$$modeled = null;
          } else if (m_isObject(_filter) === true) {
            if (keys(_filter).length > 0) {
              self.$$filter = _filter;
              self.$$origData = self.$$origData || m_copy(self.$$data);
              filter(self.get(), function (val) {
                var ret = true;
                pick(_filter, function (v, k) {
                  var value;
                  if (m_isFunction(val[k]) === true) {
                    value = val[k]();
                  } else {
                    value = val[k];
                  }
                  if (m_isArray(value) === true) {
                    ret = ret && value.indexOf(v) > -1;
                  } else {
                    ret = ret && m_equals(value, v);
                  }
                  if (ret === false) {
                    val.select(false);
                    return ret;
                  }
                });
                if (ret === true) {
                  newData.push(val.get());
                }
              });
              self.$$data = newData;
              self.length = self.$$data.length;
              self.$$modeled = null;
              evalSelected.call(self);
            }
          } else {
            throw new Error('Invalid filter value provided: ' + filter);
          }
        } else {
          self.$$filter = _filter;
        }
        return self;
      },
      sort: function (sort, preserveCase) {
        var self = this,
            len, sf;

        function compare(f, descending) {
          var field  = f;
          if (m_isFunction(f) === false) {
            f = function (a, b) {
              a = getValue(field, a);
              b = getValue(field, b);
              if (m_isObject(a)) {
                a = JSON.stringify(a);
              }
              if (m_isObject(b)) {
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
          if (m_isString(sort) === true) {
            sort = sort.split();
          }
          if (m_isFunction(sort) === true) {
            self.$$sort = sort;
            self.$$origData = self.$$origData || m_copy(self.$$data);
            self.$$modeled = self.get().sort(sort);
          } else if (m_isArray(sort) === true && sort.length > 0) {
            self.$$origData = self.$$origData || m_copy(self.$$data);
            len = sort.reverse().length;
            while (--len) {
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
            self.$$modeled = self.get().sort(sf);
          } else {
            throw new Error('Invalid sort value provided: ' + sort);
          }
          self.$$data = new Array(self.length);
          self.each(function (item, idx) {
            self.$$data[idx] = item.get();
          });
        } else {
          self.$$sort = sort;
        }
        return self;
      },
      end: function (keepHistory) {
        var self = this;
        if (self.$$origData !== null) {
          self.select(false);
          self.$$data = m_copy(self.$$origData);
          self.$$addData = [];
          self.$$modeled = null;
          self.length = self.$$data.length;
          self.$$origData = null;
          if (keepHistory !== true) {
            delete self.$$sort;
            delete self.$$filter;
          }
        }
        return self;
      },
      unique: function (field) {
        var self = this,
            uniques = {},
            ret = [];
        if (m_isString(field) && field.length > 0) {
          self.each(function (item) {
            var val = getValue(field, item);
            if (m_isArray(val) === true) {
              m_forEach(val, function(v) {
                if (m_isObject(v) === true) {
                  v = JSON.stringify(v);
                }
                if (uniques[v.toString()] === undefined) {
                  uniques[v.toString()] = true;
                  ret.push(v);
                }
              });
            } else  {
              if (m_isObject(val) === true) {
                val = JSON.stringify(val);
              }
              debugger;
              if (val !== null && val !== undefined && uniques[val.toString()] === undefined) {
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
          self.each(function (item) {
            item.select(true, true);
          });
        } else if (index === false) {
          self.each(function (item) {
            item.select(false, true);
          });
          self.$selected = [];
          self.$selectedCount = 0;
        } else if (m_isNumber(index) === true) {
          self.get()[index].select(value);
        }
        evalSelected.call(self);
        return self;
      },
      clone: function () {
        var self = this,
            ret = self._super.apply(self, arguments);
        ret.$$data = m_copy(self.$$data);
        ret.$$addData = m_copy(self.$$addData);
        ret.$$origData = m_copy(self.$$origData);
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
        if (self.$$lastReadData) {
          return self.read(self.$$lastReadData);
        }
        return self.read();
      },

      /**
      Success callback passed into a service.
      @arg data - The data resulting from a sucessful service call
      @callback Collection~successCallback
      */
      /**
      Fail callback passed into a service.
      @arg data - The data resulting from an erroring service call
      @callback Collection~failCallback
      */
      /**
      Service to read (GET) the data for this instance. Services should return `false` if they are currently invalid.
      @arg data - Data to be used during the read
      @arg {Collection~successCallback} Success callback for the service
      @arg {Collection~failCallback} Failure callback for the service
      @abstract
      @returns {boolean}
      */
      readService: false,
      /**
      Uses the readService (if defined) to attempt to retrieve the data for the instance. Will finalize the instance.
      @arg [data] - Data to be provided to the readService
      @returns {Collection} `this`
      */
      read: function (data, idx) {
        var self = this,
            ret;

        if (self.$busy === true) {
          self.always(function() {
            self.read(data, idx);
          });
          idx = self.unfinalize();
          return self;
        } else {
          idx = idx || self.unfinalize();
        }

        if (m_isFunction(self.readService)) {
          self.$busy = true;
          self.$$lastReadData = data || {};
          ret = self.readService(
            data,
            function (data) {
              delete self.$errors.read;
              self.set(data);
              self.resolve(idx);
            },
            function (data) {
              self.$errors.read = data;
              self.reject(idx);
            }
          );
          if (ret === false) {
            self.$errors.read = true;
            self.reject(idx);
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
      update: function (data, idx) {
        var self = this,
            ret;

        if (self.$busy === true) {
          self.always(function() {
            self.update(data, idx);
          });
          idx = self.unfinalize();
          return self;
        } else {
          idx = idx || self.unfinalize();
        }

        if (m_isFunction(self.updateService)) {
          self.$busy = true;
          if (arguments.length === 0) {
            delete self.$errors.update;
            return self.resolve(idx);
          }
          ret = self.updateService(
            data,
            function (data) {
              delete self.$errors.update;
              self.resolve(idx);
            },
            function (data) {
              self.$errors.update = data;
              self.reject(idx);
            }
          );
          if (ret === false) {
            self.$errors.update = true;
            self.reject(idx);
          }
        } else {
          self.$errors.update = true;
          self.reject(idx);
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

angular.module( 'angular-m' )
  .factory( 'Collection', [ 'Base', 'Singleton', CollectionFactory ] );

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
      ctrl.$parsers.unshift(validate);
      ctrl.$formatters.unshift(validate);
    }
  };
}

angular.module('angular-m.inputs', [])
  .directive('input', input)
  .directive('select', input)
  .directive('textarea', input);
})(window, window.angular);