module.exports = function(appData) {

  var 
      gulp         = appData.gulp,
      changed      = require('gulp-changed'),
      extend       = require('extend');


  appData.tasks.views = {
    run: function(taskData) {
      taskData = taskData || {};

      var injector = new appData.Injector('views', appData, taskData);

      var stream = injector.run('src');
      if (injector.isTaskCanceled(stream)) {
        return Promise.resolve();
      }
            
      if (!injector.isCanceled) {
        stream = gulp.src(stream ? stream : (appData.dirs.src.views + '**/*'));
      }

      stream = injector.run('limit', stream);
      if (!injector.isCanceled) {
        stream = stream.pipe(changed(appData.dirs.dist.views));
      }

      stream = injector.run('dest', stream);
      if (!injector.isCanceled) {
        stream = stream.pipe(gulp.dest(appData.dirs.dist.views));
      }

      stream = injector.run('finish', stream);

      return appData.app.streamToPromise(stream);
    }
  }
}