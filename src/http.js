function HTTPService($rootScope, $http, $q) {

  var METHODS = {
    read: 'GET',
    update: 'PUT',
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

angular.module( 'angular-m.http', [] )
  .service( '$mhttp', [ '$rootScope', '$http', '$q', HTTPService ] );
