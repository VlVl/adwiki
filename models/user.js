module.exports = User.inherits( global.autodafe.Model );

function User( params ){
  this._init(params);
}


User.prototype.attributes = function(){
  return {
    name : 'safe',
    id   : 'key'
  };
}