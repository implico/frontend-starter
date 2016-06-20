module.exports = function(appData) {

  const extend      = require('extend');

  appData.tasks.browserSync = {
    run: function(taskParams) {
      taskParams = taskParams || { blockOpen: false };

      var injector = new appData.Injector('browserSync', appData, taskParams);

      var stream = injector.run('init');

      if (!injector.isCanceled) {
        if (taskParams.blockOpen) {
          injector.taskConfig.options.open = false;
        }

        return new Promise(function(resolve, reject) {
          appData.browserSync.init(injector.taskConfig.options, function() {
            resolve();
          });
        });
      }
      else {
        return appData.app.taskUtils.streamToPromise(stream);
      }
    }
  }
}