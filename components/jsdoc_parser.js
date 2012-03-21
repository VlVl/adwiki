var Component = global.autodafe.Component;
var fs        = require('fs');
var path      = require('path');
var Class     = require( './lib/class.js' );


module.exports = JSDocParser.inherits( Component ); // наследуем от Component

/**
 * Пользовательский компонент
 *
 * @constructor
 * @param {Object} params параметры для компонента, задаются в конфигурационном файле
 */
function JSDocParser( params ) {
  this._init( params );
}
/**
 * Инициализация компонента
 *
 * @param {Object} params
 */
JSDocParser.prototype._init = function ( params ) {
  // Вызов инициализации родительского класса
  JSDocParser.parent._init.call( this, params );
  this.re = {
      // block control
      inline: /\/\*+(.*)\*\//,
      startBlock: /\/\*+/,
      endBlock: /\*\//,
      blockComment: /\s*\*+(\s*.*)$/,

      // jsdoc tags
      constructor: /@constructor/i
      };

  this._classes = {};
  this.dir = path.normalize( params.dir ) || path.normalize( '..' ); 
  this.add_rules();
  this.collect_classes( this.dir );
  this.create_types_links();
}

JSDocParser.prototype.reload = function(){
  this._classes = {};
  this.collect_classes( this.dir );
  this.create_types_links();
  return this.get_classes_names()
};

JSDocParser.prototype.parse_file = function( path ){
  var data = fs.readFileSync( path, 'utf8' ) + '';
  if( !this.re.constructor.test( data ) ) return false;
  var blocks = [],
  inBlock = false,
  last_line = false,
  text,

  lines = data/*.replace(/<pre>/g, '<pre class="code">' )*/.split("\n");

  for ( var i = 0, ln = lines.length; i < ln; i++ ) {
    var line = lines[i];
    last_line = false;

    if ( this.re.inline.test( line ) ) {
        text = this.re.inline.exec( line )[1];// коммент вида /* .. */

    } else if ( this.re.startBlock.test( line ) || i == ln-1 ) {
      last_line = false;
      if( block ){
        if( this.re.constructor.test( block.comment.join('') ) && blocks.length ){
          this.add_class( new Class( { path : path, blocks : blocks } ) );
          blocks = [];
        }
        if( i == ln-1 ) block.source.push( line );
        blocks.push( block );
      }
      inBlock = true;
      var block = {
          comment : [],
          source  : []
      };

    } else if ( inBlock && this.re.endBlock.test( line ) ) {
      block.comment.push( ' @' );
        inBlock = false;
        last_line = true;
    }

    if ( inBlock && this.re.blockComment.test( line ) ){
      text = this.create_links( this.re.blockComment.exec( line )[1] );
      //block.comment += ( text == '' ) ? ' ' : text;
      block.comment.push( text.replace(/@/g,' @') + ' ');
    } else if( !last_line && line != '' )
        if( block ) block.source.push( line );

  if( i == ln-1 )
    this.add_class( new Class( { path : path, blocks: blocks } ) );
  }

}

JSDocParser.prototype.collect_classes = function( file_path ){
  var stats = fs.statSync( file_path );

  if ( stats.isDirectory() ){
    fs.readdirSync( file_path ).forEach( function( file ) {
      this.collect_classes( path.join( file_path, file ));
    }, this );
  } else {
    if( path.extname( file_path ) == '.js' ) {
      this.parse_file( file_path );
    }
  }
};

JSDocParser.prototype.get_class_by_name = function( className ){
  return this._classes[ className ];
}

JSDocParser.prototype.add_class = function( clazz ){
  this._classes[ clazz.className ] = clazz;
}

JSDocParser.prototype.get_classes_names = function(){
  return Object.keys( this._classes ).sort();
}

JSDocParser.prototype.get_classes = function () {
  return this.get_classes_names().map( this.get_class_by_name.bind( this ) );
};

JSDocParser.prototype.create_links = function( text ){
  var link, clazz;
  while( link = /{@link\s+(.+?)}/ig.exec( text )){
    text = text.replace( /{@link\s+(.+?)}/i, this.link( link[ 1 ] ) );
  }
  if( link = /@see\s+(.+?)$/ig.exec( text ) ){
    text = text.replace( link[ 1 ], this.link( link[ 1 ] ) );
  }
  return text;
}

JSDocParser.prototype.create_types_links = function(){
  var self = this,
      names = this.get_classes_names();
  Object.values( this._classes ).for_each( function( _class ){
    _class.properties.for_each( function( el ){
      if( names.indexOf( el.type ) != -1 )
        el.type = self.link( el.type );
    } );
    _class.events.for_each( function( el ){
      if( el.params )
        el.params.for_each( function( param ){
          if( names.indexOf( param.type ) != -1 )
            param.type = self.link( param.type );
      } )
    } )
    _class.methods.for_each( function( el ){
      if( names.indexOf( el.method_throws.type ) != -1 )
        el.method_throws.type = self.link( el.method_throws.type );
      if( names.indexOf( el.returns.type ) != -1 )
        el.returns.type = self.link( el.returns.type );
      if( el.params )
        el.params.for_each( function( param ){
          if( names.indexOf( param.type ) != -1 )
            param.type = self.link( param.type );
      } )
    } )
  } )
}

JSDocParser.prototype.add_rules = function(){
  var router = this.app.router;
  router.add_rule( 'class', 'site.docs' );
  router.add_rule( 'class/<class:\[A-Za-z:#]+>', 'site.docs' );
  router.add_rule( 'reload', 'site.reload' );
}

JSDocParser.prototype.link = function( str ){
  var tmp = str.split( '.' );
  var link = '<a href="' + this.app.router.create_url( 'site.docs', { class : tmp[ 0 ] });
  link += tmp[ 1 ] ? ( '#' + tmp[ 1 ] ) : '';
  link += '">' + str + '</a>' ;
  return link;
}