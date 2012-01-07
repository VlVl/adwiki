/**
 * Входной скрипт.
 */
var config    = require( './config/main' ),
    autodafe  = require( 'autodafe' );

autodafe.create_application( config ).run();
