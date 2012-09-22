exports.run = function( options ){
  var config    = require( './config' ),
      autodafe  = require( 'autodafe' );

  options = options || {};

  if ( options.http_port )
    config.components.http.port = options.http_port;

  if ( options.project )
    config.components.jsdoc_parser.dir = options.project.path;

  config.params['login']    = options.user;
  config.params['pass']     = options.password;
  config.params['project']  = Object.merge( config.params['project'], options.project );
  config.params['default_post'] = options.project.start_page;

  if ( options.db ) config.components.db = Object.merge( config.components.db, options.db );

  autodafe.create_application( config ).run();
}