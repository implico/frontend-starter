'use strict';

module.exports = function(appData) {

  const gulp         = appData.gulp,
        changed      = require('gulp-changed');

  appData.tasks.fonts = {
    run: function(taskParams) {
      taskParams = taskParams || { isWatch: false };

      // if (!appData.dirs.src.fonts)
      //   return Promise.resolve();

      var injector = new appData.Injector('fonts', appData, taskParams);

      var stream;
      var src = injector.run('src', [appData.dirs.src.fonts + '**/*']);
      if (injector.isTaskCanceled(src)) {
        return Promise.resolve();
      }
      
      if (!injector.isCanceled) {
        stream = gulp.src(appData.app.taskUtils.sanitizeGlob(src));
      }
      else {
        stream = src;
      }
      
      stream = injector.run('limit', stream);
      if (!injector.isCanceled) {
        stream = stream.pipe(changed(appData.dirs.dist.fonts));
      }
      stream = injector.run('dest', stream);
      if (!injector.isCanceled) {
        stream = stream.pipe(gulp.dest(appData.dirs.dist.fonts));
      }
      stream = injector.run('finish', stream);

      var promise = appData.app.taskUtils.streamToPromise(stream);

      promise.then(() => {
        stream = injector.run('reload');
        if (!injector.isCanceled) {
          if (taskParams.isWatch) {
            appData.browserSync.reload();
          }
        }
      });

      return promise;
    }
  }
}