$(function(){
  var el         = $( window );
  var menu       = $('#list_content');
  var desc       = $('#page_content');
  var top_offset = menu.offset().top + menu.outerHeight();
  var menu_shown = true;

  el.scroll( check );
  check();

  function check(){
    var hide_menu = el.scrollTop() > top_offset;

    if ( hide_menu && menu_shown ) {
      menu_shown = false;
      menu.hide();
      desc.attr( 'class', 'span12' );
    }

    if ( !hide_menu && !menu_shown ) {
      menu_shown = true;
      menu.show();
      desc.attr( 'class', 'span9' );
    }
  }
})