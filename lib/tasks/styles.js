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

      // if (!appData.dirs.src.styles.main)
      //   return Promise.resolve();
      
      var injector = new appData.Injector('styles', appData, taskData);

      var stream = injector.run('src');
      
      if (!injector.cancel) {
        stream = gulp.src(stream ? stream : (appData.dirs.src.styles.main + '*.scss'))
          .pipe(plumber({
            errorHandler: function (error) {
              console.log(error.message);
              this.emit('end');
            }
          }));
      }

      if (injector.taskConfig.sourceMaps) {
        stream = injector.run('sourceMapsInit', stream);
        if (!injector.cancel) {
          stream = stream.pipe(sourcemaps.init());
        }
      }

      stream = injector.run('sass', stream);
      if (!injector.cancel) {
        stream = stream.pipe(sass(injector.taskConfig.sass).on('error', sass.logError));
      }

      stream = injector.run('autoprefixer', stream);
      if (!injector.cancel) {
        stream = stream.pipe(postcss([ autoprefixer(injector.taskConfig.autoprefixer) ]));
      }

      if (injector.taskConfig.sourceMaps) {
        stream = injector.run('sourceMapsWrite', stream);
        if (!injector.cancel) {
          //saving sourcemaps inline - external file causes Browsersync to reload whole page on SASS change
          stream = stream.pipe(sourcemaps.write(/*'.'*/null, { sourceRoot: injector.taskConfig.sourceMapsRoot }));
        }
      }

      stream = injector.run('dest', stream);
      if (!injector.cancel) {
        stream = stream.pipe(gulp.dest(appData.dirs.dist.styles));
      }
      stream = injector.run('finish', stream);

      if (taskData.cb) {
        stream.on('finish', () => {
          taskData.cb();
        });
      }

      return stream;
    }
  }
}