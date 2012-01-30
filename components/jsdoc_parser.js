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
      blockComment: /\s*\*+\s*(.*)$/,

      // jsdoc tags
      constructor: /@constructor/i
      };

  this._classes = {};
  this.dir = path.normalize( params.dir ) || path.normalize( '..' ); 
  this.add_rules();
  this.collect_classes( this.dir );
}

JSDocParser.prototype.parse_file = function( path ){
  var data = fs.readFileSync( path, 'utf8' ) + '';
  if( !this.re.constructor.test( data ) ) return false;
  var blocks = [],
  inBlock = false,
  last_line = false,
  text,

  lines = data.replace(/<pre>/g, '<pre class="code">' ).split("\n");

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
        blocks.push( block );
      }
      inBlock = true;
      var block = {
          comment : [],
          source  : []
      };

    } else if ( inBlock && this.re.endBlock.test( line ) ) {
        //block.comment[ block.comment.length - 1 ] = block.comment[ block.comment.length - 1 ] + ' @';
      block.comment.push( ' @' );
        inBlock = false;
        last_line = true;
    }

    if ( inBlock && this.re.blockComment.test( line ) ){
      text = this.create_links( this.re.blockComment.exec( line )[1] );
      //block.comment += ( text == '' ) ? ' ' : text;
      block.comment.push( text.replace(/@/g,' @') );
    } else if( !last_line )
        //if( block ) block.source += line;
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
      //this.log( 'parsing file %s'.format( file_path ) );
      this.parse_file( file_path );
    }
  }
};

JSDocParser.prototype.get_class_by_name = function( className ){
  return this._classes[ className ];
}

JSDocParser.prototype.add_class = function( class ){
  this._classes[ class.className ] = class;
}

JSDocParser.prototype.get_classes_names = function(){
  return Object.keys( this._classes ).sort();
}

JSDocParser.prototype.create_links = function( text ){
  var link, class;
  while( link = /{@link\s+(.+?)}/ig.exec( text )){
    class = link[ 1 ].split( '.' );
    var str = '<a href="' + this.app.router.create_url( 'site.docs', { class : class[ 0 ] });
    str += class[ 1 ] ? ( '#' + class[ 1 ] ) : '';
    str += '">' + link[ 1 ] + '</a>' ;
    text = text.replace( /{@link\s+(.+?)}/i, str );
  }
  return text;
}

JSDocParser.prototype.add_rules = function(){
  var router = this.app.router;
  router.add_rule( 'class', 'site.docs' );
  router.add_rule( 'class/<class:\\w+>', 'site.docs' );
}