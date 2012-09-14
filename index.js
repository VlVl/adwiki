exports.run = function( options ){
  var config    = require( './config' ),
      autodafe  = require( 'autodafe' );

  options = options || {};

  if ( options.http_port )
    config.components.http.port = options.http_port;

  if ( options.project )
    config.components.jsdoc_parser.dir = options.project;

  var opt_names = {
    user        : "login",
    password    : "pass",
    start_page  : "default_post",
    project_name : "project_name"
  }

  for ( var opt in opt_names ){
    if ( options[ opt ] ) config.params[ opt_names[opt] ] = options[ opt ];
  }
  
  if ( options.db ) config.components.db = Object.merge( config.components.db, options.db );

  autodafe.create_application( config ).run();
}