var fs          = require( 'fs' );
var path        = require( 'path' );
var less        = require( 'less' );

module.exports = Wiki.inherits( require('./base'));


function Wiki( params ) {
  this._init( params );
}


Wiki.prototype._init = function( params ){
  Wiki.parent._init.call( this, params );

  this.views_folder = 'wiki';
}


Wiki.prototype.global_view_params = function(){
  var params  = Wiki.parent.global_view_params.call( this );
  params.page = "docs";
  return params;
}


Wiki.prototype.docs = function ( response, request ) {
  response.send({
    class   : this.app.jsdoc_parser.get_class_by_name( request.params.class ),
    classes : this.app.jsdoc_parser.get_classes()
  });
};


Wiki.prototype.file = function( response, request ){
  var Class = this.app.jsdoc_parser.get_class_by_name( request.params.class );

  response.send({
    fileName  : path.basename( Class.path ),
    listing   : fs.readFileSync( Class.path, 'utf8' )
  });
};


Wiki.prototype.reload = function( response, request ){
  this.app.jsdoc_parser.reload();
  request.redirect('/');
}