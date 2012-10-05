var fs          = require('fs');
var path        = require('path');
var jsclass     = require( './lib/jsclass.js' );


module.exports = FilesParser.inherits( global.autodafe.Component );

/**
 * Пользовательский компонент
 *
 * @constructor
 * @param {Object} params параметры для компонента, задаются в конфигурационном файле
 */
function FilesParser( params ) {
  this._init( params );
}
/**
 * Инициализация компонента
 *
 * @param {Object} params
 */
FilesParser.prototype._init = function ( params ) {
  // Вызов инициализации родительского класса
  FilesParser.parent._init.call( this, params );

  this._classes = {};
//  this.dir = path.normalize( params.dir ) || path.normalize( '..' );
  this.dir = path.normalize( __dirname + '/../_debug' );
  this.current_className = '';
  this.collect_classes( this.dir );
  this.create_links();
}

FilesParser.prototype.reload = function(){
  this._classes = {};
  this.collect_classes( this.dir );
  this.create_links();
  return this.get_classes_names()
};

FilesParser.prototype.collect_classes = function( file_path ){
  var stats = fs.statSync( file_path );

  if ( stats.isDirectory() ){
    fs.readdirSync( file_path ).forEach( function( file ) {
      this.collect_classes( path.join( file_path, file ));
    }, this );
  } else {
      this.add_file( file_path );
  }
};
FilesParser.prototype.add_file = function( file_path ){
  var clazz;
  switch ( path.extname( file_path ) ) {
    case '.js'   : clazz = ( new jsclass( { path : file_path }) ).class;break;
    case '.json' : clazz = require( file_path );break;
  }
  this.add_class( clazz );
}

FilesParser.prototype.get_class_by_name = function( className ){
  return this._classes[ className ];
}

FilesParser.prototype.add_class = function( clazz ){
  this._classes[ clazz.className ] = clazz;
}

FilesParser.prototype.get_classes_names = function(){
  return Object.keys( this._classes ).sort();
}

FilesParser.prototype.get_classes = function () {
  return this.get_classes_names().map( this.get_class_by_name.bind( this ) );
};

FilesParser.prototype.create_links = function(){
  this.names = this.get_classes_names();
  for( clazz in this._classes ){
    this.current_className = clazz;
    this._create_links( this._classes[ clazz ] );
  }
}

FilesParser.prototype._create_links = function( obj ){
  var self = this;
  for( var tag in obj ){
    switch ( tag ){
      case 'constructor'       : this._create_links( obj[ tag ] );break;
      case 'example'           :
      case 'description'       :
      case 'short_description' : obj[ tag ] = this.find_links_in_description( obj[ tag ]);break;
      case 'type'              : if( this.names.indexOf( obj.type ) != -1 ) obj.type = this.link( obj.type );
                                 break;
      case 'see'               : obj[ tag ] = this.find_links_in_see( obj[ tag ]);break;
      case 'source'            : break;
      default                  :
        if( Array.isArray( obj[ tag ] ) )
          obj[ tag ].forEach( function( el ){
            self._create_links( el );
          } )
        else
        if( Object.isObject( obj[ tag ] ) ) this._create_links( obj[ tag ] );
    }
  }
}

FilesParser.prototype.find_links_in_description = function( descr ){
  var self = this, re = /{\s@link\s+(.+?)}/ig;
  if( !Array.isArray( descr ) )
      descr = descr.replace( re, function( str, p1 ) { return self.link( p1 ) } );
  else
  for( var i = 0, ln = descr.length; i< ln; i++ )
    descr[ i ] = descr[ i ].replace( re, function( str, p1 ) { return self.link( p1 ) } );
  return descr;

}

FilesParser.prototype.find_links_in_see = function( see ){
  if( Array.isArray( see ) )
    for( var j = 0, ln = see.length; j< ln; j++ )
      see[ j ] = this.link( see[ j ] );
  else see = this.link( see );
  return see;
}

FilesParser.prototype.link = function( str ){
  var tmp = str.split( '.' );
  var link = '<a href="' + this.app.router.create_url( 'wiki.docs', { class : tmp[ 0 ] });
  if ( tmp[ 1 ] ) link += ( '#' + tmp[ 1 ] );
  else if( tmp[ 0 ] == this.current_className ) link += ( '#' + tmp[ 0 ] );
  link += '">' + str + '</a>' ;
  return link;
}