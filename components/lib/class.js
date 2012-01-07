var Method = require( './method.js');
var Property = require( './property.js');

module.exports = Class = function( params ){
  return this._init( params );
}

Class.prototype._init = function( params ){
  this.re = {
      // jsdoc tags
      author: /@author\s+(.*)/i,
      version: /@version\s+(.*)/i,
      constructor: /@constructor/i,
      deprecated: /@deprecated/i,
      event: /@event/i,
      method: /@(method|function)/i,
      name: /@name\s+(.+)@/i,
      memberOf: /@this\s+(.*)/i,
      param: /@param\s+{(.*?)}\s+(.+?)\s+(.*?)@/ig,
      property: /@property\s+{(\w+)}\s+(.+?)\s+(.*?)@/ig,
      returns: /@returns\s+{(\w+)}\s+(.*?)@/i,
      privacy: /@(public|private|protected)/i,
      static: /@static/i,
      method_throws: /@throws\s+{(\w*)}\s+(.*?)@/i,
      extends: /@(extends|augments)\s+(.*?)\s+/i,
      type: /@(type)\s+{(\w+)}/i,
      example : /@example\s+(.*?)$/i
      };
  
  this.path = params.path || 'file unknown';
  this.className = '';
  this.methods   = [];
  this.properties = [];
  this.description = '';

  if( params.blocks && params.blocks.length ) this.parse_blocks( params.blocks );

  return this;
} 
    
Class.prototype.check = function( str, block ){
  if( typeof block == 'string' ) return this.re[ str ].test( block );
  return this.re[ str ].test( block.comment ) || this.re[ str ].test( block.source )
}

Class.prototype.is_method = function( block ){
  if( this.check( 'method', block.comment.join('') ) ) return true;
  for (var i = 0, ln_i = block.source.length; i < ln_i; i++)
    if( block.source[ i ] != '' ) return /function/.test( block.source[ i ] )
}
    
//Class.prototype.replace_links = function( block ){
//  return { comment : block.comment.replace( /@link/g, '&link'),
//           source  : block.source };
//}
    
    
Class.prototype.parse_blocks = function( blocks ){
  for (var i = 0, ln_i = blocks.length; i < ln_i; i++) {
  //if( this.check( 'author', block.comment ) || this.check ( 'version', block.comment ) ) return this.parse_head();
    if( this.is_method( blocks[ i ] ) )
      this.parse_method( blocks[ i ] );
    else 
      this.parse_property( blocks[ i ] );
  }
}

Class.prototype.parse_head = function(){
}

// --------------------- PROPERTIES ------------------------------

Class.prototype.parse_property = function( block ){
  var comment = block.comment.join('');
  var name = this.get_name( comment );
  if( !name ) name = this.extract_property_name( block.source.join('') );
//  this.properties[ name ] =  new Property({
  this.properties.push( new Property({
    name        : name,
    static      : this.check( 'static', comment ),
    privacy     : this.get_privacy( comment ),
    description : this.get_description( block.comment ),
    properties  : this.get_params( 'property', comment ),
    example     : this.get_description( block.comment, 'example' ),
    type        : this.get_single_field( 'type', comment )
  }))
}

Class.prototype.extract_property_name = function( source ){
  var result = /(.+?).(\w+)\s*=/i.exec( source );
  return result ? result[ 2 ] : '';
}


// --------------------- METHODS ------------------------------

Class.prototype.parse_method = function( block ){
  var comment = block.comment.join('');

  var name = this.get_name( comment );
  if( !name ) name = this.extract_method_name( block.source.join('') );
  var description = this.get_description( block.comment );
  if( this.check( 'constructor', comment ) ){
    this.className = name;
    this.extends   = this.get_single_field( 'extends', block.comment );
    this.description = description;
    description = 'Конструктор класса';
  }
  //this.methods[ name ] = new Method({
  this.methods.push( new Method({
    name          : name,
    params        : this.get_params( 'param', comment ),
    returns       : this.get_type_descr( 'returns', comment ),
    method_throws : this.get_type_descr( 'method_throws', comment ),
    privacy       : this.get_privacy( comment ),
    static        : this.check( 'static', comment ),
    description   : description,
    example       : this.get_description( block.comment, 'example' ),
    properties    : this.get_params( 'property', comment )
  }))
}

Class.prototype.get_params = function( tag, comment ){
  var result,arr = [];
  while( (result = this.re[ tag ].exec( comment ) ) != null ){
    arr.push({
      type : result[ 1 ],
      name : result[ 2 ],
      //description : this.get_description( result[ 3 ] )
      description : result[ 3 ]
    } )
  this.re[tag].lastIndex = result[ 0 ].length + result.index - 1;
}
  return arr;
}

Class.prototype.get_name = function( comment ){
  var result = this.re.name.exec( comment );
//  return  result ? this.get_description( result[ 1 ] ) : null;
  return  result ? result[ 1 ] : null;
}

Class.prototype.extract_method_name = function( source ){
  var result = /(.*)function\s*(\w*)/i.exec( source );
  if( result ){
    if( result[ 2 ] != '' ) return result[ 2 ].replace( ' ', '' );
    result = /\.(\w+)(\s|=)/i.exec( result[ 1 ]);
    return result ? result[ 1 ] : '';
  }
  return '';
}

Class.prototype.get_type_descr = function( tag, comment ){
  var result = this.re[ tag ].exec( comment );
  return  result ? {
    type : result[ 1 ],
    //description : this.get_description( result[ 2 ] )
    description : result[ 2 ]
  } : '';
}

Class.prototype.get_description = function( comment, tag ){
  var index = 0,
      ln = comment.length,
      result = [];
  if( tag ){
    index = this._get_line_index_by_tag( comment, tag );
    if( index == ln ) return null;
    result.push( comment[ index ].replace( '@' + tag, '') );
    index++;
  }
  while( index < ln ){
    if( /@/.test( comment[ index ] ) || index == ln-1 ) return result;
    result.push( comment[ index ] );
    index++;
  }
}

Class.prototype.get_single_field = function( tag, comment ){
  var result = this.re[ tag ].exec( comment );
  //return result ? this.get_description( result[ 2 ] ) : null;
  return result ? result[ 2 ] : null;
}

Class.prototype.get_privacy = function( comment ){
  var result = this.re.privacy.exec( comment );
  return result ? result[ 1 ] : '';
}

Class.prototype._get_line_index_by_tag = function( array, tag ){
  for (var i = 0, ln_i = array.length; i < ln_i; i++)
    if( this.re[ tag ].test( array[ i ] ) ) return i;
  return i;
}