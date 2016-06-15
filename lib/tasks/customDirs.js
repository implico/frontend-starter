module.exports = function(appData) {

  const gulp         = appData.gulp,
        changed      = require('gulp-changed'),
        merge        = require('merge-stream');


  appData.tasks.customDirs = {
    run: function(taskParams) {

      taskParams = taskParams || { isWatch: false, dirInfos: appData.dirs.custom };
      if (!taskParams.dirInfos) {
        taskParams.dirInfos = appData.dirs.custom;
      }

      var streams = [];

      var injector = new appData.Injector('customDirs', appData, taskParams);
      
      var dirInfos = injector.run('init', taskParams.dirInfos);
      if (injector.isTaskCanceled(dirInfos)) {
        return Promise.resolve();
      }

      for (var dirName in dirInfos) {
        if (!dirInfos.hasOwnProperty(dirName))
          continue;

        var dirInfo = dirInfos[dirName];

        var injectorDir = new appData.Injector(dirInfo, appData, taskParams, { id: dirName, dirInfo: dirInfo });

        var stream = injectorDir.run('src', null);
        if (injectorDir.isTaskCanceled(stream)) {
          continue;
        }

        if (dirInfo.to !== null) {
          if (!injector.isCanceled) {
            stream = gulp.src(appData.app.sanitizeGlob(stream ? stream : dirInfo.from));
          }
          stream = injectorDir.run('limit', stream);
          if (!injector.isCanceled) {
            stream = stream.pipe(changed(dirInfo.to));
          }
          stream = injectorDir.run('dest', stream);
          if (!injector.isCanceled) {
            stream = stream.pipe(gulp.dest(dirInfo.to));
          }

          streams.push(stream);
        }
      }

      injector.run('finish', streams, { dirInfos: dirInfos });

      var promise;
      if (streams.length) {
        promise = appData.app.streamToPromise(merge.apply(merge, streams));
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