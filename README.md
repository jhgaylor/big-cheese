NPM package to expose the glories of DataSources and Commands.


# purpose of each piece

## datasource

create a kue task for a job to be done that will get the necessary data if it isn't in the cache

### kue

allows for prioritizing, rate limiting, and scaling the fulfillment of jobs.

## command

aggregate datasource promises and make them available in a command that will mix/match the data and return a promise for the aggregate result. (note: does it need to be a promise? should it be?)

# benefits of the structure

allows for building libraries of datasources and commands that combine those datasources allowing for the end user of the library to very easily work with data that otherwise would had a higher barrier to entry. essentially this package provides a new way to build api wrappers and web scrapers that can easily be combined with other wrappers to make it incredibly simple to build and consume very complex datasets.

reusability is key here. ever written a function that gets and formats some data and then needed the data in another format? with this pattern just build a data source to get the data, and another data source for each view of the data (if you need it cached or easily reused in another datasource/command). use commands for consuming the data sources w/ options. commands can be nested as well if you don't want to cache the results. 

# why did I build it?

I can't count how many times i've used an api wrapper and i've written dozens. this might be overkill to replace a single client library, but for projects that need data from multiple sources this pattern is a boon to my productivity. My favorite part about it is that it lets people share both the product of their data consumption (Commands), it also lets them share the building blocks of their data (datasources) for other developers to mixin to their own Commands.

# why should you use it?

Maybe One day: middleware that could keep every single registered data source up to data.

# TODO:

Use Kue inside of DataSource. Then find a way to enable job processing. For instance, one process might be a job queuer while another is a job doer but they both use this library. the code to run jobs will be baked right in, just needs to be turned on.

Remove the first parameter, DataSources, from the Command "constructor". There should be a "Commander" with a register method such as `Commander.register('riot.static.champions', DataSourceObject)` or `Commander.register({riot:{static:{champions: DataSourceObject}}})` or event `Commander.register([DataSourceDicts])` would make Command aware of the sources.

