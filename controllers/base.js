module.exports = Base.inherits( global.autodafe.Controller );

function Base(params){
  this._init( params );
}


Base.prototype.global_view_params = function(){
  return {
    project_name : this.app.params.project_name,
    page         : "",
    page_name    : ""
  }
}


Base.prototype._is_auth = function( request ){
  return request.client.get_cookie( 'autodafe_user' )
      && request.client.get_cookie( 'autodafe_pass' );
}