$SingletonFactory.$inject = ['$BaseFactory', '$RegExConstant'];
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