module.exports = User.inherits( global.autodafe.Model );

function User( params ){
  this._init(params);
}


User.prototype.attributes = function(){
  return {
    login : 'safe',
    id    : 'key'
  };
}