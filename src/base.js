function BaseFactory() {
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
angular.module( 'angular-m' ).factory( 'Base', BaseFactory );