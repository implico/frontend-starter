var APP = APP || {};

(function($, APP) {
  
  APP.init = function() {
    $.each(APP.pages, function() {
      if (this.init)
        this.init();
    });
  }

  /*
      Pages code
      for particular pages
  */
  var pages = APP.pages = APP.pages || {};

  //layout - common for all
  var layout = pages.layout = {
    
    init: function() {

    }
  }

  //index - homepage
  var index = pages.index = {
    
    init: function() {
      if (!modules.isPage('index'))
        return;

    }
  }

  

  /*
      Functional modules
  */
  var modules = APP.modules = APP.modules || {};

  //returns true if the current page has an id (or one of passed ids if array): #page-[id], to enable individual page code
  modules.isPage = function(id) {

    var isCurrent = false;
    if (!(id instanceof Array))
      id = [id];

    $.each(id, function() {
      if ($('#page-' + this).length) {
        isCurrent = true;
        id = this;
        return false;
      }
    });

    return isCurrent ? id : false;
  }

  
  //checks for current media query range, defined by CSS z-index applied to body element
  modules.isBreakpoint = function(mode, exact) {

    var ret,
      width = $(window).width(),
      height = $(window).height(),
      indicatorVal = parseInt($('body').css('z-index'));

    switch (mode) {

      case 'mobile':
        ret = indicatorVal == 1;
        break;

      case 'tablet':
        ret = exact ? (indicatorVal == 2) : (indicatorVal <= 2);
        break;

      case 'desktop':
        ret = exact ? (indicatorVal == 3) : (indicatorVal <= 3);
        break;
    }

    return ret;
  }


  /*
      Init
  */
  $(function() {
    APP.init();
  });

  
})(jQuery, APP);