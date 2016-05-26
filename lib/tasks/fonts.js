module.exports = function(appData) {

  var 
      gulp         = require('gulp'),
      changed      = require('gulp-changed');

  appData.tasks.fonts = {
    run: function(taskData) {
      taskData = taskData || {};

      // if (!appData.dirs.src.fonts)
      //   return Promise.resolve();

      var injector = new appData.Injector('fonts', appData, taskData);

      var stream = injector.run('src');
      
      if (!injector.cancel) {
        stream = gulp.src(stream ? stream : (appData.dirs.src.fonts + '**/*'));
      }
      
      stream = injector.run('limit', stream);
      if (!injector.cancel) {
        stream = stream.pipe(changed(appData.dirs.dist.fonts));
      }
      stream = injector.run('dest', stream);
      if (!injector.cancel) {
        stream = stream.pipe(gulp.dest(appData.dirs.dist.fonts));
      }
      stream = injector.run('finish', stream);

      return stream;
    }
  }
}