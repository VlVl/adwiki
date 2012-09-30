var fs       = require('fs');
var path     = require('path');
var util     = require('util');
var rl       = require('readline').createInterface( process.stdin, process.stdout );
var autodafe = require('autodafe');
var db_name;

var config = {
  name      : 'ADWiki installation',
  base_dir  : path.join( __dirname, '../..'),

  preload_components : ['log_router', 'db'],
  components : {
    log_router : {
      routes : {
        console : {
          levels : [ 'trace', 'info', 'warning', 'error' ]
        }
      }
    },

    db : {
      type      : 'mysql',
      user      : 'root',
      password  : '',
      database  : 'adwiki',
      host      : 'localhost',
      port      : 3306
    }
  }
}



var db_questions = [
  [ 'user',     'User\'s name for connection to MySQL (user should have rights to create schemas, "root" by default):' ],
  [ 'password', 'Password for that user (empty by default):' ],
  [ 'database', 'DB schema name (will be created automatically if not exist, "adwiki" by default):' ],
  [ 'host',     'Host where MySQL is running ("localhost" by default):' ],
  [ 'port',     'MySQL port (3306 by default):' ]
];

ask(0);

function ask( qn ){
  rl.question( db_questions[ qn ][1], function( answer ){
    answer = answer.trim();
    if (answer) config.components.db[ db_questions[ qn ][0] ] = answer;

    if (++qn != db_questions.length) ask( qn );
    else {
      rl.close();

      db_name = config.components.db.database;
      delete config.components.db.database;

      autodafe.create_application( config, app_started );
    }
  });
}


function app_started( e, app ){
  if (e) {
    console.log( 'Error while starting autodafe application' );
    throw e;
  }

  var commands = fs
    .readFileSync( path.resolve( __dirname, 'data/docs.sql' ), 'utf8' )
    .split(';').filter( function( str ){
      return str.trim();
    } );

  commands.unshift(
    'drop schema if exists `%s`'.format( db_name ),
    'create schema `%s` default character set utf8 collate utf8_general_ci'.format( db_name ),
    'use `%s`'.format( db_name )
  );

  var listener = new global.autodafe.lib.Listener;

  commands.forEach( function( command ){
    app.db.query( command, listener.get_callback() );
  } );

  listener.success(function(){
    app.log( 'Database created successfully', 'info' );

    var config_file = path.join( __dirname, '../../index.js' );
    app.log( 'Create common config file in ' + config_file );

    var data = require('./data/default_config.js');

    data.db.user      = config.components.db.user;
    data.db.password  = config.components.db.password;
    data.db.host      = config.components.db.host;
    data.db.port      = config.components.db.port;
    data.db.database  = db_name;

    var file_content = [ 'require("adwiki").run(', util.inspect( data ), ');' ];

    if ( fs.existsSync( config_file ) ) fs.unlinkSync( config_file );
    var fd = fs.openSync( config_file, 'a', 0666 );
    fs.writeSync( fd, file_content.join(''), null, 'utf8' );
    fs.closeSync( fd );

    app.log( 'Start file created successfully. For starting site type: node index.js', 'info' );
    app.stop();
  });
}