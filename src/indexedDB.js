function IndexDBService($rootScope, $window, $q) {
  
  var openRequest,
      DB;

  function open(name, version) {
    var deferred = $q.defer();

    openRequest = $window.indexedDB.open(name, version);

    openRequest.onsuccess = function (event) {
      DB = openRequest.result;
      deferred.resolve(DB, event);
    };
    openRequest.onerror = function (event) {
      deferred.reject(openRequest.errorCode, event);
    }
    return deferred;
  }

  return {
    open: open,

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

angular.module( 'angular-m.DB', [] )
  .service( '$mDB', [ '$rootScope', '$window', '$q', IndexDBService ] );
