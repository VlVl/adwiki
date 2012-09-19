var AutodafePart = global.autodafe.AutodafePart;

module.exports = ClassElement.inherits( AutodafePart );

function ClassElement(params) {
  this._init( params )
}

ClassElement.prototype._init = function( params ){
  ClassElement.parent._init.call( this, params );
  this.name        = params.name;
  this.static      = params.static || false;
  this.privacy     = params.privacy;
  this.description = params.description;
  this.properties  = params.properties || [];
  this.type        = params.type;
  this.example     = params.example;
  this.params        = params.params;
  this.returns       = params.returns;
  this.method_throws = params.method_throws;
  this.extends       = params.extends;
  this.see           = params.see;


  this._.trim_name = '';
  this._.trim_name.get = function(){
    return this.name.trim();
  }

  this._.short_description = '';
  this._.short_description.get = function(){
    return Array.isArray( this.description ) ? this.description[ 0 ] : this.description;
  };

  this._.event_name = '';
  this._.event_name.get = function(){
    var tmp = this.name.split( '#' );
    return tmp[ 1 ].trim() || tmp[ 0 ].trim();
  }

  this._.top_params.get = function(){
    return this.params && this.params.filter(function( param ){
      return !/\./.test( param.name );
    });
  }
};