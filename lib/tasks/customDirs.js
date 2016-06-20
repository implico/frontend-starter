'use strict';

module.exports = function(appData) {

  const gulp         = appData.gulp,
        changed      = require('gulp-changed'),
        merge        = require('merge-stream');


  appData.tasks.customDirs = {
    run: function(taskParams) {

      taskParams = taskParams || { isWatch: false, dirInfos: appData.config.customDirs.items };
      if (!taskParams.dirInfos) {
        taskParams.dirInfos = appData.config.customDirs.items;
      }

      var streams = [];

      var injector = new appData.Injector('customDirs', appData, taskParams);
      
      var dirInfos = injector.run('init', taskParams.dirInfos);
      if (injector.isTaskCanceled(dirInfos)) {
        return Promise.resolve();
      }

      dirInfos.forEach(function(dirInfo) {
        var injectorDir = new appData.Injector(dirInfo, appData, taskParams, { dirInfo: dirInfo });

        var stream = injectorDir.run('src', null);
        if (injectorDir.isTaskCanceled(stream)) {
          return;
        }

        if (dirInfo.dest !== null) {
          if (!injector.isCanceled) {
            stream = gulp.src(appData.app.taskUtils.sanitizeGlob(stream ? stream : dirInfo.src));
          }
          stream = injectorDir.run('limit', stream);
          if (!injector.isCanceled) {
            stream = stream.pipe(changed(dirInfo.dest));
          }
          stream = injectorDir.run('dest', stream);
          if (!injector.isCanceled) {
            stream = stream.pipe(gulp.dest(dirInfo.dest));
          }

          streams.push(stream);
        }
      });

      injector.run('finish', streams, { dirInfos: dirInfos });

      var promise;
      if (streams.length) {
        promise = appData.app.taskUtils.streamToPromise(merge.apply(merge, streams));
      }
      else {
        promise = Promise.resolve();
      }

      promise.then(() => {
        injector.run('reload');
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