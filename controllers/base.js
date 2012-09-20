module.exports = Base.inherits( global.autodafe.Controller );

function Base(params){
  this._init( params );
}


Base.prototype.global_view_params = function( response, request ){
  return {
    user         : request.user,
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


Base.prototype.before_action = function( action, response, request ){
  request.user = this.app.users.get_by_client( request.client );
}