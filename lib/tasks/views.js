module.exports = function(appData) {

  var 
      gulp         = require('gulp'),
      changed      = require('gulp-changed'),
      extend       = require('extend');


  appData.tasks.views = {
    run: function(taskData) {
      taskData = taskData || {};

      // if (!appData.dirs.src.views.main)
      //   return Promise.resolve();

      var injector = new appData.Injector('views', appData, taskData);

      var stream = injector.run('src');
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

      return stream;
    }
  }
}