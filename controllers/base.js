module.exports = Base.inherits( global.autodafe.Controller );

function Base(params){
  this._init( params );
}


Base.prototype.global_view_params = function(){
  return {
    project_name : this.app.params.project_name,
    page         : "",
    page_name    : "",
    articles     : this.models.post.find_all_by_attributes({
      news : 0
    }, {
      select : 'id, name',
      order : 'id'
    })
  }
}


Base.prototype._is_auth = function( request ){
  return request.client.get_cookie( 'autodafe_user' )
      && request.client.get_cookie( 'autodafe_pass' );
}