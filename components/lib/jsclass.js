var AutodafePart = global.autodafe.AutodafePart;
var fs        = require('fs');

module.exports = JSClass.inherits( AutodafePart );

function JSClass( params ){
  this._init( params );
}

JSClass.prototype._init = function( params ){
  JSClass.parent._init.call( this, params );
  this.re = {
    block_tags : {
      inline: /\/\*+(.*)\*\//,
      startBlock: /\/\*+/,
      endBlock: /\*\//,
      blockComment: /^\s*\*+(\s*.*)$/
    }
  }
  this.jsdoc_tags = {
    '@author'       : [ 'name', 'string' ],
    '@version'      : true,
    '@constructor'  : true,
    '@deprecated'   : [ 'description', 'string' ],
    '@event'        : true,
    '@method'       : true,
    '@function'     : true,
    '@name'         : [ 'string' ],
    '@this'         : [ 'name' ],
    '@param'        : [ 'name', 'type', 'description', 'array' ],
    '@property'     : [ 'name', 'type', 'description', 'array' ],
    '@returns'      : [ 'type', 'description' ],
    '@return'       : [ 'type', 'description', 'eq:returns' ],
    '@public'       : true,
    '@private'      : true,
    '@protected'    : true,
    '@static'       : true,
    '@field'        : true,
    '@throws'       : [ 'type', 'description', 'array' ],
    '@extends'      : [ 'string' ],
//    '@augments'     : true,
    '@type'         : [ 'type', 'string' ],
    '@example'      : [ 'multilines' ],
    '@description'  : [ 'multilines' ],
    '@see'          : [ 'string', 'array' ],
    '@since'        : ['string'],
    '@namespace'    : true,
    '@default'      : ['string']
  };
  this.used_RegExp = {
    tag : /\s(@.+?)\s/ig,
    eq  : /eq:(.+)/
  };

  this.block  = {};
  this.blocks  = [];

  this.class = this.parse_file( params.path ) ? this.create_class( params.path ) : null;

}

JSClass.prototype.parse_file = function( path ){
  var data = fs.readFileSync( path, 'utf8' ) + '';
  if( !/@constructor/.test( data ) ) return false;
  var comment = [],
      source  = [],
      text,
      lines = data.split("\n");

  for ( var i = 0, ln = lines.length; i < ln; i++ ) {
    var line = lines[i];

    if( this.re.block_tags.inline.test( line ) ) source.push( line );
    else if ( this.re.block_tags.startBlock.test( line ) ) {
      if( comment.length > 0 ){
        this.parse_block( comment, source );
        comment = [];
        source  = [];
        }
    } else if ( this.re.block_tags.endBlock.test( line ) ) {
      continue;
    } else if ( this.re.block_tags.blockComment.test( line ) ){
        text = this.re.block_tags.blockComment.exec( line )[1] ;
        comment.push( text.replace(/@/g,' @') + ' ' );
    } else if( line != '' && comment.length > 0 )
        source.push( line );
    if( i == ln-1 )
      this.parse_block( comment, source );
  }
   return true;
}

JSClass.prototype.parse_block = function( comment, source ){
  var line = '',
      lines = [],
      tag = '';
  this.block = { '@source' : source };
  for ( var i = 0, ln = comment.length; i < ln; i++ ) {
    var check = this.check_tag( comment[ i ] );
    if( check ){
      if( lines.length > 0 ) {
        this.add_tag( lines, tag );
        lines = [];
        line = '';
      }
      if( line != '' ){
        this.add_tag( [ line ], tag );
        line = '';
      }
      tag = check;
    } else if( !/\S/g.test( comment[ i ] ) || tag == '@example' ){
      lines.push( line );
      line = '';
    }
    line += comment[ i ];
    if( i == ln-1 ) {
      if( /\S/g.test( line ) ) lines.push( line );
      if( lines.length ) this.add_tag( lines, tag );
    }
  }
  this.blocks.push( this.block );
}

JSClass.prototype.check_tag = function( line ){
  var re = this.used_RegExp.tag;
  var tag = /\s(@.+?)\s/.exec( line );
  if( !tag ) return false;
  if( !this.used_RegExp[ tag[1] ] ) this.used_RegExp[ tag[1] ] = new RegExp( tag[1] + "\\s+(\\{.+?\\})?\\s*(.*?)$" );
  return  Object.keys( this.jsdoc_tags ).indexOf( tag[ 1 ] ) != -1 ? tag[ 1 ] : false;
}

JSClass.prototype.add_tag = function( lines, tag ){
  if( !tag ){       // это - вступление
    this.block[ '@description' ] = lines;
    return;
  }

  var re = this.used_RegExp[ tag ];
  var res = re.exec( lines.shift() );
  var fields = this.jsdoc_tags[ tag ];
  if( !Array.isArray( fields ) ){
    if( !this.block[ tag ] ) this.block[ tag ] = true;
    return;
  }

  var tag_el = {};
  if( fields.indexOf( 'type' ) != -1 ) tag_el.type = this._get_type( res[ 1 ] ) ;
  if( fields.indexOf( 'name' ) != -1 ){
    var name = res[ 2 ].trim().split( ' ' ),
        tmp;
    if( tmp = /\[(.*?)\]/.exec( name[ 0 ] ) ){
      tmp = tmp[ 1 ].split( '=' );
      tag_el.name = tmp.shift();
      tag_el.default_value = tmp.length ? tmp.join('=') : null;
    } else {
      tag_el.name = name[ 0 ];
      tag_el.required = true;
    }
    name.shift();
    res[ 2 ] = name ? name.join( ' ' ) : '';
  }
  var description = ( lines.length == 0 ) ? res[ 2 ].trim() : [ res[ 2 ].trim() ].concat( lines );
  if( fields.indexOf( 'description' ) != -1 ) tag_el.description = description;
  if( fields.indexOf( 'multilines' ) != -1 ) tag_el = description;
  if( fields.indexOf( 'string' ) != -1 ){
    tag_el = Object.isEmpty( tag_el ) ? tag_el = res[ 2 ].trim() : tag_el[ Object.keys( tag_el )[0] ];
  }
  var eq = this._check_eq( fields );
  if( eq ) tag = '@' + eq;

  if( !this.block[ tag ] )
    this.block[ tag ] = ( fields.indexOf( 'array' ) != -1 ) ? [ tag_el ] : tag_el;
  else if( fields.indexOf( 'array' ) != -1 ) this.block[ tag ].push( tag_el );
}

JSClass.prototype._get_type = function( str ){
  if( !str ) return { name : '', type : '' };
  str = str.replace( /{(.+)}/, '$1').trim();
  if( !/|/.test( str ) ) return { name : str, type : str };
  return str.split( '|').map( function( type ){ return { name : type, type : type } } );
}

JSClass.prototype._check_eq = function( fields ){
  var result;
  for( var i = 0, ln = fields.length; i < ln; i++ )
    if( result = this.used_RegExp.eq.exec( fields[ i ] ) )
      return result[1];
  return false;
}

JSClass.prototype.extract_method_name = function( source ){
  if( Array.isArray( source ) ) source = source[0];
  var result = /(.*)function\s*(\w*)/i.exec( source );
  if( result ){
    if( /\S/.test( result[ 2 ] ) ) return result[ 2 ].trim();
    result = /\.(\w+)(\s|=)/i.exec( result[ 1 ]);
    return result ? result[ 1 ].trim() : '';
  }
  return '';
}

JSClass.prototype.extract_property_name = function( source ){
  var result = /(.+?).(\w+)\s*=/i.exec( source );
  return result ? result[ 2 ].trim() : '';
}

JSClass.prototype.create_class = function( path ){
  var short_path = path.split( '/autodafe/'),
      arrays = this.get_arrays();
  return {
        path              : path,
        short_path        : short_path[ 1 ] ? 'autodafe/' + short_path[ 1 ] : path,
        className         : arrays.constructor.name,
        constructor       : arrays.constructor,
        methods           : arrays.methods,
        properties        : arrays.properties,
        events            : arrays.events
      }
}

JSClass.prototype.get_arrays = function(){
  var self = this;
  var result = {
    methods    : [],
    properties : [],
    events     : []
  };

  this.blocks.forEach( function( block ){

    var b = block[ '@description' ] ? {
      short_description : Array.isArray( block[ '@description' ] ) ? block[ '@description' ][ 0 ] : block[ '@description' ]
    } : {};

    for( var i in block ) b[ i.substring(1) ] = block[ i ];

    if( b.param ) b.top_params = b.param.filter(function( param ){
      return !/\./.test( param.name );
    });
    b = self._get_block_type( b, block );
    result[ b.block_type ].push( b );
    if( block[ '@constructor' ] ) result.constructor = result.methods.pop();
  });
  [ 'methods', 'events', 'properties' ].forEach( function( a ){
    result[ a ] = self.sort_array( result[ a ] );
  });
//  result.methods    = this.sort_array( result.methods );
//  result.events     = this.sort_array( result.events );
//  result.properties = this.sort_array( result.properties );
  return result;
}

JSClass.prototype._get_block_type = function( b, block ){
  if( block[ '@event' ] ){
    var tmp = block[ '@name' ].split( '#' );
    b.event_name = tmp[ 1 ] ? tmp[ 1 ].trim() : tmp[ 0 ].trim();
    b.block_type = 'events';
    return b;
  }
  if( block[ '@field' ] ){
    b.block_type = 'properties';
    return b;
  }
  if( block[ '@name' ] ){
    b.block_type = ( /function/.test( block[ '@source' ][0] )) ? 'methods' : 'properties';
    return b;
  }
  if( b.name = this.extract_method_name( block[ '@source' ] ) ) b.block_type = 'methods';
  else {
      b.name = this.extract_property_name( block[ '@source' ] );
      b.block_type = 'properties';
    }
  return b;
}

JSClass.prototype.sort_array = function( array ){
  return array.sort( function( a, b ){
    a = a.name.toLowerCase().replace(/^_+/, '');
    b = b.name.toLowerCase().replace(/^_+/, '');

    if( a < b )  return -1;
    if( a == b ) return 0;
    if( a > b )  return 1;
  } )
}
