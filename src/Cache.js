var redis = require('redis');
var Q = require('q');

var REDIS_HOST = process.env.BIG_CHEESE_REDIS_HOST || "127.0.0.1";
var REDIS_PORT = process.env.BIG_CHEESE_REDIS_PORT || 6379;
var REDIS_PASSWORD = process.env.BIG_CHEESE_REDIS_PASSWORD || null;
// A function that returns a cache object. Each cache object
// has an open connection to the cache server.
// All the methods of the cache objects return a promise
//   to facilitate chaining as well as to be consistent
var Cache = function () {
  // the redis handle is private.
  var CacheClient = (function () {
    // TODO: use password to auth
    var client = redis.createClient(REDIS_PORT, REDIS_HOST, {});
    client.on("error", function (err) {
      console.log("Redis client threw error: ", err)
      throw err;
    });
    return client;
  })();

  return {
    // a promise to return the value held at `key`
    get: function (key) {
      return Q.ninvoke(CacheClient, 'get', key);
    },
    // returns a promise for the result of setting
    // the value in the cache at `key`
    set: function (key, value, timeout) {
      // timeout has a default value of 0;
      timeout =  timeout || 0;
      var setterPromise = Q.ninvoke(CacheClient, 'set', key, value);
      // set the expiration after the key is set. this block will be
      // outside of the normal control flow but its effects aren't critical
      // to the success of the application. Fail quietly.
      if (timeout > 0) {
        setterPromise.then(function () {
          Q.ninvoke('expire', key, timeout).catch(function (err) {
            console.log("Failed to set a redis key expiration", key, timeout);
          });
        });
      }
      return setterPromise;
    },
    // returns null. This method wouldn't be in the middle of a chain anyway.
    quit: function () {
      CacheClient.quit();
      return null;
    }
  }
};

module.exports = Cache
