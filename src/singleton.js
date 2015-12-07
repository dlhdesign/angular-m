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
    return str.charAt(0).toUpperCase() + str.slice(1)
      .replace(/[a-z]([A-Z])/g, function (v, l, os) { // Handle "camelCase" => "Camel Case"
        return str.charAt(os + 1) + ' ' + l.toUpperCase();
      })
      .replace(/_([a-z])/g, function (v, l) { // Handle "underscore_case" => "Underscore Case"
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
            while ( field.length > 0 ) {
              f = field.shift();
              target = target[ f ] = m_isObject( target[ f ] ) === true ? target[ f ] : {};
            }
            if ( m_isFunction(fieldConfig.mutateSet) === true ) {
              val = fieldConfig.mutateSet.call(self, val, fieldConfig);
            }
            target[ field[ 0 ] ] = val;
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
