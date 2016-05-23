module.exports = function(appData) {

  var 
      gulp         = require('gulp'),
      changed      = require('gulp-changed');

  appData.tasks.fonts = {
    run: function(taskData) {
      taskData = taskData || {};
      
      if (!appData.dirs.src.fonts)
        return Promise.resolve();
      
      return gulp.src(appData.dirs.src.fonts + '**/*')
        .pipe(changed(appData.dirs.dist.fonts))
        .pipe(gulp.dest(appData.dirs.dist.fonts));
    }
  }
}