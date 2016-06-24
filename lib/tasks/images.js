'use strict';

module.exports = function(appData) {

  const gulp         = appData.gulp,
        changed      = require('gulp-changed'),
        imagemin     = require('gulp-imagemin'),
        plumber      = require('gulp-plumber'),
        extend       = require('extend');


  appData.tasks.images = {
    run: function(taskParams) {
      taskParams = taskParams || { isWatch: false };

      var injector = new appData.Injector('images', appData, taskParams);

      var stream;
      var src = injector.run('src', [appData.dirs.src.images + '**/*']);
      if (injector.isTaskCanceled(src)) {
        return Promise.resolve();
      }

      if (!injector.isCanceled) {
        stream = gulp.src(appData.app.taskUtils.sanitizeGlob(src))
          .pipe(plumber());
      }
      else {
        stream = src;
      }

      stream = injector.run('limit', stream);
      if (!injector.isCanceled) {
        stream = stream.pipe(changed(appData.dirs.dist.images));
      }

      stream = injector.run('optimize', stream);
      if (!injector.isCanceled) {
        stream = stream.pipe(imagemin(injector.taskConfig.imagemin));
      }

      stream = injector.run('dest', stream);
      if (!injector.isCanceled) {
        stream = stream.pipe(gulp.dest(appData.dirs.dist.images));
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