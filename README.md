NPM package to expose the glories of DataSources and Commands.

# TODO:

Use Kue inside of DataSource. Then find a way to enable job processing. For instance, one process might be a job queuer while another is a job doer but they both use this library. the code to run jobs will be baked right in, just needs to be turned on.

Remove the first parameter, DataSources, from the Command "constructor". There should be a "Commander" with a register method such as `Commander.register('riot.static.champions', DataSourceObject)` or `Commander.register({riot:{static:{champions: DataSourceObject}}})` or event `Commander.register([DataSourceDicts])` would make Command aware of the sources.