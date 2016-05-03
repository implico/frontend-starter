module.exports = function(dirs, config, app, tasks) {

  var 
      gulp         = require('gulp'),
      changed      = require('gulp-changed');

  tasks.fonts = {
    run: function() {
      if (!dirs.src.fonts)
        return Promise.resolve();
      
      return gulp.src(dirs.src.fonts + '**/*')
        .pipe(changed(dirs.dist.fonts))
        .pipe(gulp.dest(dirs.dist.fonts));
    }
  }
}