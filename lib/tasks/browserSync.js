module.exports = function(appData) {

  var 
      extend       = require('extend');

  appData.tasks.browserSync = {
    run: function(taskData) {
      taskData = taskData || { isDev: true, blockOpen: false };

      var injector = new appData.Injector('browserSync', appData, taskData);

      var stream = injector.run('init');

      if (!injector.cancel) {
        if (taskData.blockOpen) {
          injector.taskConfig.options.open = false;
        }

        return new Promise(function(resolve, reject) {
          appData.app.browserSync.init(injector.taskConfig.options, function() {
            resolve();
          });
        });
      }
      else {
        return stream;
      }
    }
  }
}