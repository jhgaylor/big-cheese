var selectn = require('selectn');

// TODO: DataSources should really not need to always be passed in here.
//   Instead, there should be a "Commander" with which DataSources are register.
var Command = function (DataSources, data_source_keys, buildFn) {
  // returns a hashtable of data_source keys w/ a promise for its data
  // accounts for 'keys.like.this' for {keys:{like:{this: new DataSource()}}}
  // the data_source key will be undefined is the lookup failed
  function getDataSourceGetters () {
    var source_promise_getters = {};
    data_source_keys.forEach(function (source_key) {
      source = selectn(source_key, DataSources)
      if (source === null) {
        // there is not a datasource for this location
        console.log("Could not find datasource at location ", source_key);
        return;
      }
      // set the value to the promise getter
      source_promise_getters[source_key] = source.get;
    });
    return source_promise_getters;
  }

  return {
    // opts needs to be kwargs so that it can be passed
    //   all over the place and every body know how to use the object
    run: function (opts) {
      var source_promise_getters = getDataSourceGetters()
      return buildFn(opts, source_promise_getters)
    }
  };
}


module.exports = Command
