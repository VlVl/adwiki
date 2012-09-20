var fs          = require( 'fs' );
var path        = require( 'path' );
var less        = require( 'less' );

module.exports = Site.inherits( require('./base') );

//todo: remake auth
function Site( params ) {
  this._init( params );
}

Site.prototype._init = function( params ){
  Site.parent._init.call( this, params );

  this.app.on( 'views_are_loaded', this._compile_templates.bind( this ) );
  if ( this.app.views_loaded ) this._compile_templates();

}

Site.prototype._compile_templates = function(){
//  var templates = this.app.params.templates;
//
//  for ( var template in templates ) {
//    var file     = fs.readFileSync( path.join( this.app.base_dir, template ), 'utf8' );
//    var compiled = this.dust.compile( file, path.basename( template, '.html' ) );
//    var file_path = path.join( this.app.base_dir, templates[ template ], path.basename( template, '.html' ) + '.js' );
//    if ( path.existsSync( file_path ) ) fs.unlinkSync( file_path );
//    var fd = fs.openSync( file_path, 'a', 0666 );
//    fs.writeSync( fd, compiled, null, 'utf8' );
//    fs.closeSync( fd );
//  }

  var style = fs.readFileSync( path.join( this.app.base_dir, 'static/css/style.less' ), 'utf8' );
  var parser = new less.Parser({
      paths: [ path.join( this.app.base_dir, 'node_modules/twitter-bootstrap/less/' ) ]//, // Specify search paths for @import directives
//      filename: 'style.less' // Specify a filename, for better error messages
  });

  var self = this;
  parser.parse( style, function (e, tree) {
    var css = tree.toCSS({ compress: true }); // Minify CSS output
    var css_file = path.join( self.app.base_dir, 'static/css/style.css' );
    if ( path.existsSync( css_file ) ) fs.unlinkSync( css_file );
    var fd = fs.openSync( css_file, 'a', 0666 );
    fs.writeSync( fd, css, null, 'utf8' );
    fs.closeSync( fd );
  });
}


Site.prototype.index = function( response, request ){
  response.send({
    unpublished : this.models.post.find_all_by_attributes({ news : 2 }, { order : 'id' }),
    article     : this.models.post.find_by_attributes({ name : this.app.params.default_post }),
    news        : this.models.post.find_all_by_attributes({ news : 1 }, { order : 'date DESC' }),
    page_name   : this.app.params.default_post
  });
};


Site.prototype.login = function ( response, request ) {
  if ( request.user.is_authorized()) request.redirect( request.original_request.headers.referer );

  var login = this.app.params.login,
      pass  = this.app.params.pass;

  if ( request.params.login == login && request.params.pass == pass ){
    var user = new this.models.user( request.params );
    this.app.users.authorize_session( request.client.session, user );

    return request.redirect( request.original_request.headers.referer );
  }

  response.merge_params({
    auth_failed : 'Неверно введен логин или пароль'
  });
  this.action('index', response, request);
};


Site.prototype.logout = function( response, request ){
  if ( request.user.is_authorized() ) {
    this.app.users.logout_session( request.client.session );
  }

  request.redirect( request.original_request.headers.referer );
}