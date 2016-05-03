module.exports = function(dirs, config, app, tasks) {

  var 
      gulp         = require('gulp'),
      changed      = require('gulp-changed'),
      extend       = require('extend'),
      swig         = require('gulp-swig');


  tasks.views = {
    run: function(isDev) {
      if (!dirs.src.views.main)
        return Promise.resolve();
      
      var configViews = extend(true, config.views.common, config.views[isDev ? 'dev': 'prod']);

      var ret = gulp.src(dirs.src.views.scripts + '**/*');

      if (configViews.useSwig) {
        ret = ret.pipe(swig(configViews.swig));
      }
      else {
        ret = ret.pipe(changed(dirs.dist.views));
      }
      ret = ret.pipe(gulp.dest(dirs.dist.views));

      return ret;
    }
  }
}