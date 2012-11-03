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
  var params  = Wiki.parent.global_view_params.apply( this, arguments );
  params.page = "docs";
  return params;
}


Wiki.prototype.docs = function ( response, request ) {
//  var parser  = this.app.jsdoc_parser;
  var parser  = this.app.files_parser;
  response.merge_params({
    classes : parser.get_classes()
  });

  var clazz   = parser.get_class_by_name( request.params.class );
  if ( !clazz ) return response.send();

  var parents = [], parent = clazz;
    while( parent = parser.get_class_by_name( parent.constructor.extends ) )
      parents.push( parent.className );

  response.send({
    parents : parents,
    class   : clazz
  });
};


Wiki.prototype.file = function( response, request ){
  var Class = this.app.files_parser.get_class_by_name( request.params.class );

  response.send({
    fileName  : path.basename( Class.path ),
    listing   : fs.readFileSync( Class.path, 'utf8' )
  });
};


Wiki.prototype.reload = function( response, request ){
  if (request.user.can( 'reload_adwiki' )) this.app.files_parser.reload();
  request.redirect( request.original_request.headers.referer );
}