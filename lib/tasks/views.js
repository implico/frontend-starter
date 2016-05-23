module.exports = function(appData) {

  var 
      gulp         = require('gulp'),
      changed      = require('gulp-changed'),
      extend       = require('extend'),
      swig         = require('gulp-swig');


  appData.tasks.views = {
    run: function(taskData) {
      taskData = taskData || { isDev: true };

      if (!appData.dirs.src.views.main)
        return Promise.resolve();
      
      var configViews = extend(true, appData.config.views.common, appData.config.views[taskData.isDev ? 'dev': 'prod']);

      var ret = gulp.src(appData.dirs.src.views.scripts + '**/*');

      if (configViews.useSwig) {
        ret = ret.pipe(swig(configViews.swig));
      }
      else {
        ret = ret.pipe(changed(appData.dirs.dist.views));
      }
      ret = ret.pipe(gulp.dest(appData.dirs.dist.views));

      return ret;
    }
  }
}