module.exports = function(appData) {

  const gulp         = appData.gulp,
        changed      = require('gulp-changed'),
        merge        = require('merge-stream');


  appData.tasks.customDirs = {
    run: function(taskData) {

      taskData = taskData || { isWatch: false, dirInfos: appData.dirs.custom };
      if (!taskData.dirInfos) {
        taskData.dirInfos = appData.dirs.custom;
      }

      var streams = [];

      var injector = new appData.Injector('customDirs', appData, taskData);
      
      var dirInfos = injector.run('init', taskData.dirInfos);
      if (injector.isTaskCanceled(dirInfos)) {
        return Promise.resolve();
      }

      for (var dirName in dirInfos) {
        if (!dirInfos.hasOwnProperty(dirName))
          continue;

        var dirInfo = dirInfos[dirName];

        var injectorDir = new appData.Injector(dirInfo, appData, taskData);

        //data passed to injector as a second parameter
        var injectorData = { id: dirName, dirInfo: dirInfo };

        var stream = injectorDir.run('src', null, injectorData );
        if (injectorDir.isTaskCanceled(stream)) {
          continue;
        }

        if (dirInfo.to !== null) {
          if (!injector.isCanceled) {
            stream = gulp.src(stream ? stream : dirInfo.from);
          }
          stream = injectorDir.run('limit', stream, injectorData);
          if (!injector.isCanceled) {
            stream = stream.pipe(changed(dirInfo.to));
          }
          stream = injectorDir.run('dest', stream, injectorData);
          if (!injector.isCanceled) {
            stream = stream.pipe(gulp.dest(dirInfo.to));
          }

          streams.push(stream);
        }
      }

      injector.run('finish', streams, { dirInfos: dirInfos });

      if (streams.length) {
        var promise = appData.app.streamToPromise(merge.apply(merge, streams));
        promise.then(() => {
          injector.run('reload');
          if (!injector.isCanceled) {
            if (taskData.isWatch) {
              appData.browserSync.reload();
            }
          }
        });
        return promise;
      }
      else {
        return Promise.resolve();
      }
    }
  }
}