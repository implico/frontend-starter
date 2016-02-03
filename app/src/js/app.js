var APP = APP || {};

(function($, APP) {
  
  var pages = APP.pages = APP.pages || {};

  //layout - common for all
  var layout = pages.layout = {

    //always initialized
    _check: function() {
      return true;
    },
    
    init: function() {

    }
  }

  //index - homepage
  var index = pages.index = {

    //if function "_check" is found, its return value indicates wheter to initialize this controller
    //in this example, if uncommented, controller will be initialized if an element with id="page-index" or id="page-news" is found

    /*_check: function() {
      return APP.core.isPage(['index', 'news']);
    },*/
    
    init: function() {
      //by default, only initialized if element with id="page-index" is found

    }
  }

  
})(jQuery, APP);