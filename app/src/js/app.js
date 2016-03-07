(function($, APP) {
  
  //layout - common for all
  APP.module.layout = {

    //always initialized
    _check: function() {
      return true;
    },
    
    init: function() {

    }
  }

  //index - homepage
  APP.module.index = {

    //if function "_check" is found, its return value indicates wheter to initialize this module
    //in this example, if uncommented, module will be initialized if an element with id="module-index" or id="module-news" is found

    /*_check: function() {
      return APP.core.isModule(['index', 'news']);
    },*/
    
    init: function() {
      //by default, with no _check function, only initialized if element with id="modle-index" is found

      //e.g. this.slider();
    }
  }

  
})(jQuery, APP);