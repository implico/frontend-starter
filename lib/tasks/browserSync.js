module.exports = function(appData) {

  var 
      extend       = require('extend');

  appData.tasks.browserSync = {
    run: function(isDev, blockOpen) {
      var configBS = extend(true, appData.config.browserSync.common, appData.config.browserSync[isDev ? 'dev': 'prod']);
      if (blockOpen) {
        configBS.options.open = false;
      }

      if (configBS.enable) {
        return new Promise(function(resolve, reject) {
          appData.app.browserSync.init(configBS.options, function() {
            resolve();
          });
        });
      }
      else return Promise.resolve();
    }
  }
}