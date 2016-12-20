'use strict';

module.exports = function(appData) {

  const gulp          = appData.gulp,
        autoprefixer  = require('gulp-autoprefixer'),
        extend        = require('extend'),
        cssnano       = require('gulp-cssnano'),
        gcmq          = require('gulp-group-css-media-queries'),
        plumber       = require('gulp-plumber'),
        sourcemaps    = require('gulp-sourcemaps'),
        sass          = require('gulp-sass'),
        sassGlob      = require('gulp-sass-glob');


  appData.tasks.styles = {
    run: function(taskParams) {
      taskParams = taskParams || { isWatch: false };

      var injector = new appData.Injector('styles', appData, taskParams);

      var stream;
      var src = injector.run('src', [appData.dirs.src.styles + '*.scss']);
      if (injector.isTaskCanceled(src)) {
        return Promise.resolve();
      }
      
      if (!injector.isCanceled) {
        stream = gulp.src(appData.app.taskUtils.sanitizeGlob(src))
          .pipe(plumber({
            errorHandler: function (error) {
              console.log(error.message);
              this.emit('end');
            }
          }));
      }
      else {
        stream = src;
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
        stream = stream.pipe(autoprefixer(injector.taskConfig.autoprefixer));
      }

      stream = injector.run('optimizeMediaQueries', stream);
      if (!injector.isCanceled) {
        stream = stream.pipe(gcmq());
      }

      stream = injector.run('optimize', stream);
      if (!injector.isCanceled) {
        stream = stream.pipe(cssnano(injector.taskConfig.cssnano));
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

      return appData.app.taskUtils.streamToPromise(stream);
    }
  }
}
