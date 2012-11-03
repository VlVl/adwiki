/**
 * Single Class
 *
 * Description
 * @constructor
 */
function SingleClass(){
  this._init();
}


/**
 * @event
 * @name no_type
 * @param p
 */

/**
 * @event
 * @name one_type
 * @param {Number} p
 */

/**
 * @event
 * @name multi_type
 * @param {Number|SingleClass|RelatedClass} p
 */

/**
 * Some description
 * @private
 */
SingleClass.prototype._init = function(){
  /**
   * just description
   */
  this.no_type = 0;

  /**
   * description and type
   * @type {Number}
   */
  this.one_type = 1;

  /**
   * many types
   * @type {Number|SingleClass|RelatedClass}
   */
  this.multiple_types = Infinity;
}


/**
 * just description and no type
 * @param p
 * @return {Object}
 */
SingleClass.prototype.m_no_type = function( p ){}


/**
 * description and single type
 * @param {Object} p
 * @return {Object} description of returns
 */
SingleClass.prototype.m_one_type = function( p ){}


/**
 * multi types
 * @param {Object|SingleClass|RelatedClass} p
 * @return {Object|SingleClass|RelatedClass} description
 */
SingleClass.prototype.m_multiple_types = function( p ){}