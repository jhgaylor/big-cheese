var BigCheese = require('./index.js');
var Command = BigCheese.Command;
var DataSource = BigCheese.DataSource;

// this gives us a way to modify the cacheing scale
// `ONE_SECOND = 1 * 2` for instance would make everything
// cache for twice as long.
var ONE_SECOND = 1;
var ONE_MINUTE = ONE_SECOND * 60;
var ONE_HOUR = ONE_MINUTE * 60;
var ONE_DAY = ONE_HOUR * 24;
var ONE_WEEK = ONE_DAY * 7;

var DataSources = {
  bar: {
    baz: DataSource('used_for_namespacing_in_cache', ONE_WEEK,
      function (opts, done) {
      	// make an IO call for some data
        done(null, JSON.stringify({data:"Hello"}));
      }
    ),
  }
};

Commands = {
	foo: Command(DataSources, ['bar.baz'], function (opts, dataSourceGetters) {
    // build the data structure that should be send from the API to the caller
    // now have access to the data source values by calling getDataSourceGetters(options) which will return a promise for the data in that source
    // each build function is responsible for waiting for the data sources to load.
    opts = opts || {};
    return dataSourceGetters['bar.baz'](opts);
	}),
};


DataSources.bar.baz.get({})
  .then(function(res) {
    console.log("res", res);
  })
  .catch(function (err) {
    console.log("error getting data", err);
  });

Commands.foo.run()
  .then(function(res) {
    console.log("res", res);
  })
  .catch(function (err) {
    console.log("err with command", err)
  })
