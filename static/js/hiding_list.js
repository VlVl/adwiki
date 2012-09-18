$(function(){
  var el         = $( window );
  var menu       = $('#list_content');
  var desc       = $('#page_content');
  var top_offset = menu.offset().top + menu.outerHeight();
  var menu_shown = true;
  var top_dif    = 100; // todo: определять динамически

  el.scroll( check );
  check();

  function check(){
    var hide_menu = el.scrollTop() > top_offset + ( menu_shown ? top_dif : 0 );
    var height    = 0;
    var changes   = false;

    if ( hide_menu && menu_shown ) {
      menu_shown = false;
      if ( !top_dif ) height = el.height();
      menu.hide();
      desc.attr( 'class', 'span9' );
      if ( !top_dif ) top_dif = height - el.height();
      changes = true;
    }

    if ( !hide_menu && !menu_shown ) {
      menu_shown = true;
      if ( !top_dif ) height = el.height();
      menu.show();
      desc.attr( 'class', 'span6' );
      if ( !top_dif ) top_dif = el.height() - height;
      changes = true;
    }

    //todo: переделать
    if ( changes )
      setTimeout( function(){ $('body').scrollspy('refresh') }, 100 );
  }
})