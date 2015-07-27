$CollectionFactory.$inject = ['$BaseFactory'];
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
angular.module( 'angular-m' ).factory( 'Collection', $CollectionFactory );