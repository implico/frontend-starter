module.exports = function(dirs, config, app, tasks) {

	var 
			extend       = require('extend');

	tasks.browserSync = {
		run: function(isDev, blockOpen) {
	    var configBS = extend(true, config.browserSync.common, config.browserSync[isDev ? 'dev': 'prod']);
	    if (blockOpen) {
	      configBS.options.open = false;
	    }

	    if (configBS.enable) {
	      return new Promise(function(resolve, reject) {
	        app.browserSync.init(configBS.options, function() {
	          resolve();
	        });
	      });
	    }
	  }
  }
}