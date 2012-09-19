var fs          = require( 'fs' );
var path        = require( 'path' );
var less        = require( 'less' );

module.exports = Blog.inherits( require('./base') );

function Blog( params ) {
  this._init( params );
}


Blog.prototype._init = function( params ){
  Blog.parent._init.call(this, params);

  this.views_folder = 'blog';
}


Blog.prototype.global_view_params = function(){
  var params  = Blog.parent.global_view_params.call( this );
  params.page = "blog";
  return params;
}


Blog.prototype.article = function( response, request ){
  response.send({
    auth        : this._is_auth,
    unpublished : this.models.post.find_all_by_attributes({ news : 2 }, { order : 'id' }),
    article     : this.models.post.With('comments').find_by_attributes({
      name        : request.params.post || this.app.params.default_post
    })
  });
}


Blog.prototype.edit = function( response, request ){
  response.view_name('editor');

  if ( !this._is_auth ) return response.send({ auth : false });

  response.send({
    auth          : true,
    article       : this.models.post.find_by_pk( request.params.post )
  });
}


Blog.prototype.remove = function( response, request ){
  if ( !this._is_auth ) return response.view_name('editor').send({ auth : false });

  var self = this;
  response
    .create_listener()
    .handle_emitter( this.models.post.remove_by_pk( request.params.post ))
    .success( function(){
      request.redirect( self.create_url('blog.article') );
    });
}


Blog.prototype.save = function( response, request ){
  var listener = response.create_listener();
  var id       = request.params.id;

  if( !id ){
    var post = new this.app.models.post( request.params );
    listener.stack <<= post.save();
  }
  else
    listener.stack <<= this.models.post.update_by_pk( id, request.params );

  listener.success( request.redirect.bind( request, this.create_url('blog.article', {
    post : request.params.name
  })));
}

//Site.prototype.comment = function( response, request ){
//  var self      = this;
//  var comment   = new this.app.models.comment( request.params );
//  comment.date  = new global.autodafe.db.Expression('NOW()');
//
//  comment.save( [ 'post_id', 'name', 'text', 'date' ] )
//      .on( 'success', this.send_response.bind( this, 'comment', client, { comment : comment }))
//      .on( 'error', function( error ){
//            self.send_response( 'error', client, { error : error } )
//          })
//      .on( 'not_valid', function( errors ){
//            self.send_response( 'error', client, { error : errors } )
//          })
//}