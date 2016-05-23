module.exports = function(appData) {

  var 
      extend       = require('extend');

  appData.tasks.browserSync = {
    run: function(taskData) {
      taskData = taskData || { isDev: true, blockOpen: false };
      var configBS = extend(true, appData.config.browserSync.common, appData.config.browserSync[taskData.isDev ? 'dev': 'prod']);
      if (taskData.blockOpen) {
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