module.exports = Base.inherits( global.autodafe.Controller );

function Base(params){
  this._init( params );
}


Base.prototype.global_view_params = function( response, request ){
  return {
    user          : request.user,
    project       : this.app.params.project,
    page          : "",
    page_name     : "",
    articles      : this.models.post.find_all_by_attributes({
      news    : 0
    }, {
      select  : 'id, name',
      order   : 'id'
    })
  }
}


Base.prototype.before_action = function( action, response, request ){
  var user = this.app.users.get_by_client( request.client );

  if (
    user.is_guest() &&
    request.client.get_cookie('a_secret') ==
      require('crypto').createHash('md5').update( this.app.params.login + this.app.params.pass ).digest("hex") )
  {
    var model = new this.models.user( this.app.params );
    this.app.users.authorize_session( request.client.session, model );
  }

  request.user = this.app.users.get_by_client( request.client );
}