var Controller  = global.autodafe.Controller;
var fs          = require( 'fs' );
var path        = require( 'path' );

module.exports = SiteController.inherits( Controller ); // наследуем от Controller

/**
 * Единственный в данном приложении контроллер, который и отвечает за логику работы приложения
 *
 * @constructor
 * @extends Controller
 * @param {Object} params
 */
function SiteController( params ) {
  this._init( params );
}


/**
 * Метод для отправки view клиенту. Перегружает Controller.send_response, добавляет в параметры, передаваемые в view
 * ссылку на модель пользователя user, если пользоваетель гость, user будет равен null
 *
 * @param {String} view название вьюшки, которую будем рендерить
 * @param {Client} client клиент которому будет отправлена view
 * @param {Object} params параметры для передачи в вью
 */
SiteController.prototype.send_response = function ( view, client, params ) {
  params = params || {};

  SiteController.parent.send_response.call( this, view, client, params );
};


/**
 * Главная страница сайта. Этот метод указан в секции router.rules конфигурационного файла для корня сайта
 *
 * @param {Object} params параметры пришедшие с запросом
 * @param {Client} client клиент совершающий действие
 * @param {String} error ошибка которая может передасться из других действий для того чтобы показать главную страницу
 * с ошибкой
 */
SiteController.prototype.index = function ( params, client, error ) {
  var class = this.app.jsdoc_parser.get_class_by_name( params.class );
  var files = this.app.jsdoc_parser.get_classes_names();
  this.send_response( 'main', client, { class : class,files : files } );
};