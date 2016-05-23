module.exports = function(appData) {

  var 
      gulp         = require('gulp'),
      autoprefixer = require('autoprefixer'),
      extend       = require('extend'),
      plumber      = require('gulp-plumber'),
      sourcemaps   = require('gulp-sourcemaps'),
      postcss      = require('gulp-postcss'),
      sass         = require('gulp-sass');


  appData.tasks.styles = {
    run: function(taskData) {
      taskData = taskData || { isDev: true, cb: null };

      if (!appData.dirs.src.styles.main)
        return Promise.resolve();
      
      var configStyles = extend(true, appData.config.styles.common, appData.config.styles[taskData.isDev ? 'dev': 'prod']);

      var ret = gulp.src(appData.dirs.src.styles.main + '*.scss')
        .pipe(plumber({
          errorHandler: function (error) {
            console.log(error.message);
            this.emit('end');
          }
        }));

      if (configStyles.sourceMaps) {
        ret = ret
          .pipe(sourcemaps.init());
      }

      ret = ret
            .pipe(sass(configStyles.sass).on('error', sass.logError))
            .pipe(postcss([ autoprefixer({ browsers: configStyles.autoprefixer.browsers }) ]));

      if (configStyles.sourceMaps) {
        ret = ret
          .pipe(sourcemaps.write(/*'.'*/null, { sourceRoot: configStyles.sourceMapsRoot }));  //saving sourcemaps to an external file causes Browsersync to reload whole page on SASS change
      }

      ret = ret
        .pipe(gulp.dest(appData.dirs.dist.styles));

      if (taskData.cb) {
        ret.on('finish', () => {
          taskData.cb();
        });
      }

      return ret;
    }
  }
}