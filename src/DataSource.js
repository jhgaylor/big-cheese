// Instantiate the cache and connect to redis. by doing it here instead of
// in the "constructor" we will use only a single redis connection.
// TODO: look into the performance implications of a single redis connection versus many.
var cache = require('./Cache')();
var Q = require('q');

// basic namespaced json serializer
var defaultKeyFn = function (name, opts) {
  // the name param is passed because w/o it a passed in function
  // wouldn't have access to it.
  optsStr = JSON.stringify(opts);
  return "datasource:"+[name, optsStr].join("-");
};

// DataSource(name, [timeout,] getterFn)
// this signature is easier for consumers of the api than DataSource(name, options)
function DataSource (name, timeout, getterFn, keyFn) {
  // allows for the optional exclusion of the timeout parameter.
  if (getterFn === null) {
    // getterFns promises should resolve to a POJO so it can be json serialized.
    // the job of the getterFns is to make IO calls and process the results
    // into a data structure that gets cached and used by the commands' buildFns
    // to process into responses. defaults to a noop
    getterFn = timeout || function () {};
    // TODO: determine the proper default value, 0 or null
    timeout = 0;
  }
  // Returns the key for this data source, which is built from it's name
  // and `opts` which allows for a single named data source's results to be
  // namespaced and cached once per set of arguments it is called with
  // The default keyFn is a basic JSON serializer
  keyFn = keyFn || defaultKeyFn;

  // a reference to the deferred that has a lifespan longer than the call
  // to get.
  var dataDeferred;
  return {
    // ease of life for developers
    name: name,
    // always returns a promise
    // the promise will resolve w/ data or reject with an http or redis err
    // if it is called again before the promise resolves, it returns
    //   the pending promise rather than overwriting it. This will allow
    //   for data sources to depend on other data source w/o worrying
    //   about load order.
    //   NOTE: this dependency can't be circular.
    get: function (opts) {
      var key = keyFn(name, opts);
      // don't overwrite the promise while it's being fulfilled
      if ((dataDeferred === undefined) || (!dataDeferred.promise.isPending())) {
        dataDeferred = Q.defer()
        // this will get the value one way or another!
        cache.get(key, getterFn, opts).then(function (data) {
          if (data) {
            console.log("cache hit", key);
            dataDeferred.resolve(JSON.parse(data))
            return;
          }

          console.log("cache miss", key);
          var getterDeferred = Q.defer();
          // will resolve or reject getterDeferred.promise from the getterFn
          getterFn(opts, getterDeferred.makeNodeResolver());
          // cache the value once we get it
          getterDeferred.promise.then(function (data) {
            // store the data as a json string
            cache.set(key, JSON.stringify(data), this.timeout);
            dataDeferred.resolve(data);
          })
          .catch(function (err) {
            dataDeferred.reject(err);
          });
        });
      }
      return dataDeferred.promise
    }
  }
}

module.exports = DataSource
