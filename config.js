/**
 * Настройки приложения
 */
var config = module.exports = {

  /**
   * Название приложения ( пока что используется только для логирования )
   *
   * @type {String}
   */
  name                : 'docs',

  /**
   * Корневая директория приложения, в ней по умолчанию ищутся директории с моделями, контроллерами, вьюшками,
   * компонентами, а также относительно нее задаются другие пути в конфигурационном файле
   *
   * @type {String}
   */
  base_dir            : __dirname,

  /**
   * Контроллер использующийся по умолчанию там где не указан явно. Важно: при подключении к приложению по любому из
   * протоколов, у этого контроллера вызывается действие client_connect, где можно например произвести авторизацию
   * клиента по куки. Имя контроллера должно совпадать с названием файла, в котором он описан.
   *
   * @type {String}
   */
  default_controller  : 'site',

  /**
   * Если значение true - вьюшки подгружаются один раз при создании приложения и больше никогда не проверяются на
   * изменения, если false - измененные вьюшки перезагружаются каждый раз при обращении к ним
   *
   * @type {Boolean}
   */
  cache_views         : false,

  /**
   * Настройки компонента отвечающего за перенаправление запросов и генерацию запросов
   *
   * @type {Object}
   */
  router : {

    /**
     * Правила перенаправления запросов, ключи запрашиваемых УРЛ, с возможностью указания параметров, значения -
     * путь к действию в виде контроллер.действие Также тут можно указать какие типы запросов могут быть обработаны
     * для данного действия. 'post' - для HTTP POST, 'get' - для HTTP GET, 'delete' - для HTTP DELETE,
     * 'ws' - для запроса через WebSocket, если не указано - то любой
     *
     * @type {Object}
     */
    rules     : {
      ''                          : 'site.index',
      'article'                   : 'blog.article',
      'article/<post:.+?>'        : 'blog.article',
      'edit'                      : 'blog.edit',
      'edit/<post:\\d+>'          : 'blog.edit',
      'remove/<post:\\d+>'        : 'blog.remove  | post',
      'save'                      : 'blog.save    | post',
//      'comment'                   : 'blog.comment | post',
      'login'                     : 'site.login   | post',
      'logout'                    : 'site.logout',
      'class'                     : 'wiki.docs',
      'class/<class:[A-Za-z:#]+>' : 'wiki.docs',
      'reload'                    : 'wiki.reload',
      'file/<class:[A-Za-z:#]+>'  : 'wiki.file'
    }
  },

  params  : {
    project       : {
      name        : '',
      description : '',
      twitter     : '',
      github      : '',
      copy        : '',
      author      : ''
    },
    default_post  : 'About project',
    login         : 'admin',
    pass          : ''//,
//    templates     : {
//      'views/templates/blog/comments.html' : 'views/js/templates'
//    }
  },

  /**
   * Компоненты, загружаемые до инициализации ядра приложения
   * log_router - чтобы видеть этапы инициализации ядра
   * db - для инициализации моделей, которые используют доступ к базе данных
   *
   * @type {Array}
   */
  preload_components : [ 'log_router', 'db' ],

  /**
   * Настройка подключаемых компонентов. Здесь указываются как компаненты autodafe, так и пользовательские. Ключами
   * всегда является название подключаемого компонентка ( для пользовательских компонентов это название файла ), а
   * значениями - настройки для компонента. Если для компонента не надо передавать настройки, нужно просто указать true
   *
   * @type {Object}
   */
  components : {

    // Пользовательские компоненты
    jsdoc_parser : {
      dir : require('path').join( __dirname, 'node_modules/autodafe/framework' )
    },

    my_tools     : true,

    // компонент управляющий правами пользователей
    users   : {
      model   : 'user',
      roles   : {
        user  : '!!user.login',
        admin : function( user, app ) {
          return user.login == app.params.login;
        }
      },
      roles_groups : {
        all : 'admin, guest, user'
      },
      rights : {
        create  : 'admin',
        view    : 'all',
        edit    : 'admin',
        remove  : 'admin'
      }
    },

    // http сервер
    http                : {
      port            : 3000,

      // здесь указываются директории в которых ищутся файлы
      root_folders    : {
        js        : 'static/js',
        css       : 'static/css',
        images    : 'static/images',
        img       : 'node_modules/twitter-bootstrap/img',
        bootstrap : 'node_modules/twitter-bootstrap/js'
      }
    },

    // настройки логгера
    log_router          : {
      routes : {
        console : {
          levels : [ 'trace', 'info', 'warning', 'error' ]
        }
      }
    },

    // настройки подключения к базе данных
    db : {
      type      : 'mysql',
      user      : 'root',
      password  : '',
      database  : 'test',
      host      : 'localhost'
    }
  }
};