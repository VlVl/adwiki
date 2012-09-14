var ActiveRecord = global.autodafe.db.ActiveRecord;

module.exports = Post.inherits( ActiveRecord );

function Post( params ) {
  this._init( params );
}

Post.prototype._init = function( params ){
  Post.parent._init.call( this, params );

  this._.is_news = true;
  this._.is_news.get = function(){
    return this.get_attribute( 'news' ) != 0;
  }
}

Post.prototype.get_table_name = function(){
  return 'posts';
}


Post.prototype.relations = function () {
  return {
    'comments' : this.has_many( 'comment' ).by( 'post_id', {
      order : 'comments.date DESC'
    } )
  }
};


Post.prototype.attributes = function(){
  return {
    name        : 'required safe',
    description : 'required safe',
    news        : 'safe'
  };
}