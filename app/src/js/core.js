var APP = APP || {};

(function($, APP) {
  
  /*
      Modules code
      for particular pages/modules (defined in app.js and/or other files)
  */
  APP.module = APP.module || {};

  /*
      System components
  */
  var core = APP.core = APP.core || {};

  core.init = function(isDynamic) {
    $.each(APP.module, function(moduleId) {
      var init = true;
      if (this._check) {
        init = this._check(isDynamic);
      }
      else {
        init = core.isModule(moduleId);
      }

      if (init)
        this.init(isDynamic);
    });
  }


  //returns true if the current page has an id (or one of passed ids if array): #module-[id], to enable individual page/module code
  core.isModule = function(id, prepend) {
    
    if (typeof prepend == 'undefined')
      prepend = '#module-';

    var isCurrent = false;
    if (!(id instanceof Array))
      id = [id];

    $.each(id, function() {
      if ($(prepend + this).length) {
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
        markerVal = parseInt($('[data-bp-marker]').css('z-index'));

    switch (mode) {

      case 'mobile':
        ret = markerVal == 1;
        break;

      case 'tablet':
        ret = exact ? (markerVal == 2) : (markerVal <= 2);
        break;

      case 'desktop':
        ret = exact ? (markerVal == 3) : (markerVal <= 3);
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