module.exports = function(appData) {

  var 
      extend       = require('extend');

  appData.tasks.browserSync = {
    run: function(taskData) {
      taskData = taskData || { blockOpen: false };

      var injector = new appData.Injector('browserSync', appData, taskData);

      var stream = injector.run('init');

      if (!injector.isCanceled) {
        if (taskData.blockOpen) {
          injector.taskConfig.options.open = false;
        }

        return new Promise(function(resolve, reject) {
          appData.browserSync.init(injector.taskConfig.options, function() {
            resolve();
          });
        });
      }
      else {
        return appData.app.streamToPromise(stream);
      }
    }
  }
}