module.exports = function(appData) {

  const gulp         = appData.gulp,
        changed      = require('gulp-changed'),
        extend       = require('extend'),
        htmlmin      = require('gulp-htmlmin');


  appData.tasks.views = {
    run: function(taskParams) {
      taskParams = taskParams || { isWatch: false };

      var injector = new appData.Injector('views', appData, taskParams);

      var stream = injector.run('src');
      if (injector.isTaskCanceled(stream)) {
        return Promise.resolve();
      }

      if (!injector.isCanceled) {
        stream = gulp.src(appData.app.taskUtils.sanitizeGlob(stream ? stream : (appData.dirs.src.views + '**/*')));
      }

      stream = injector.run('limit', stream);
      if (!injector.isCanceled) {
        stream = stream.pipe(changed(appData.dirs.dist.views));
      }

      stream = injector.run('optimize', stream);
      if (!injector.isCanceled) {
        stream = stream.pipe(htmlmin(injector.taskConfig.htmlmin));
      }

      stream = injector.run('dest', stream);
      if (!injector.isCanceled) {
        stream = stream.pipe(gulp.dest(appData.dirs.dist.views));
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