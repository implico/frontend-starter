module.exports = function(appData) {

  const gulp          = appData.gulp,
        autoprefixer  = require('autoprefixer'),
        extend        = require('extend'),
        plumber       = require('gulp-plumber'),
        sourcemaps    = require('gulp-sourcemaps'),
        postcss       = require('gulp-postcss'),
        sass          = require('gulp-sass'),
        sassGlob      = require('gulp-sass-glob');


  appData.tasks.styles = {
    run: function(taskData) {
      taskData = taskData || {};

      var injector = new appData.Injector('styles', appData, taskData);

      var stream = injector.run('src');
      if (injector.isTaskCanceled(stream)) {
        return Promise.resolve();
      }
      
      if (!injector.isCanceled) {
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
        if (!injector.isCanceled) {
          stream = stream.pipe(sourcemaps.init());
        }
      }

      stream = injector.run('sassGlob', stream);
      if (!injector.isCanceled) {
        stream = stream.pipe(sassGlob());
      }

      stream = injector.run('sass', stream);
      if (!injector.isCanceled) {
        stream = stream.pipe(sass(injector.taskConfig.sass).on('error', sass.logError));
      }

      stream = injector.run('autoprefixer', stream);
      if (!injector.isCanceled) {
        stream = stream.pipe(postcss([ autoprefixer(injector.taskConfig.autoprefixer) ]));
      }

      if (injector.taskConfig.sourceMaps) {
        stream = injector.run('sourceMapsWrite', stream);
        if (!injector.isCanceled) {
          //saving sourcemaps inline - external file causes Browsersync to reload whole page on SASS change
          stream = stream.pipe(sourcemaps.write(/*'.'*/null, { sourceRoot: injector.taskConfig.sourceMapsRoot }));
        }
      }

      stream = injector.run('dest', stream);
      if (!injector.isCanceled) {
        stream = stream.pipe(gulp.dest(appData.dirs.dist.styles));
      }

      stream = injector.run('reload', stream);
      if (!injector.isCanceled) {
        stream = stream.pipe(appData.browserSync.stream());
      }

      stream = injector.run('finish', stream);

      return appData.app.streamToPromise(stream);
    }
  }
}