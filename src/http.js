function HTTPService($rootScope, $http) {

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
angular.module( 'angular-m.http' ).service( '$mhttp', [ '$rootScope', '$http', HTTPService ] );