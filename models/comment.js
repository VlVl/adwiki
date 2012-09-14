var ActiveRecord = global.autodafe.db.ActiveRecord;

module.exports = Comment.inherits( ActiveRecord );

function Comment( params ) {
  this._init( params );
}

Comment.prototype._init = function( params ){
  Comment.parent._init.call( this, params );
  this._.date_to_show = '';
  this._.date_to_show.get = function(){
    var date = this.get_attribute('date');
//    var new_date  = date.getUTCDate() > 9 ? date.getUTCDate() : '0' + date.getUTCDate();
    var new_date  = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
    var new_month = date.getMonth() > 9 ? date.getMonth() : '0' + date.getMonth();
    var new_year  = date.getFullYear();

//    var new_hour = date.getUTCHours() > 9 ? date.getUTCHours() : '0' + date.getUTCHours();
    var new_hour = date.getHours() > 9 ? date.getHours() : '0' + date.getHours();
    var new_minute  = date.getUTCMinutes() > 9 ? date.getUTCMinutes() : '0' + date.getUTCMinutes();

    return new_date + "." + new_month + "." + new_year + ' в ' + new_hour + ':' + new_minute;
  }
}

Comment.prototype.get_table_name = function () {
  return 'comments';
};


Comment.prototype.attributes = function(){
  return {
    'post_id' : 'safe required',
    'text'    : 'safe required',
    'name'    : 'safe',
    'date'    : 'safe'
  };
}
