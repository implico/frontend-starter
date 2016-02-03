var APP = APP || {};

(function($, APP) {
  
  /*
      Pages code
      for particular pages (defined in app.js and/or other files)
  */
  var pages = APP.pages = APP.pages || {};

  /*
      System modules
  */
  var core = APP.core = APP.core || {};

  core.init = function() {
    $.each(APP.pages, function(pageId) {
      var init = true;
      if (this._check) {
        init = this._check();
      }
      else {
        init = core.isPage(pageId);
      }

      if (init)
        this.init();
    });
  }


  //returns true if the current page has an id (or one of passed ids if array): #page-[id], to enable individual page code
  core.isPage = function(id) {

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
  core.isBreakpoint = function(mode, exact) {

    var ret,
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
    APP.core.init();
  });

  
})(jQuery, APP);