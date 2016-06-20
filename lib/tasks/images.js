'use strict';

module.exports = function(appData) {

  const gulp         = appData.gulp,
        changed      = require('gulp-changed'),
        imagemin     = require('gulp-imagemin'),
        plumber      = require('gulp-plumber'),
        extend       = require('extend');


  appData.tasks.images = {
    run: function(taskParams) {
      taskParams = taskParams || { isWatch: false };

      // if (!appData.dirs.src.images)
      //   return Promise.resolve();
      
      var imgGlob = [appData.dirs.src.images + '**/*'];
      appData.config.sprites.items.forEach(function(spriteDir) {
        let imgSource = spriteDir.imgSource;
        //remove dir separator as it causes creating empty dir
        imgGlob.push('!' + (imgSource.charAt(imgSource.length - 1) == '/' ? imgSource.slice(0, -1) : imgSource));
        imgGlob.push('!' + imgSource + '**/*');
      });

      var injector = new appData.Injector('images', appData, taskParams);
      //fallback
      if (appData.config.images.optimize && appData.config.images.optimize.optimizationLevel) {
        console.log('Frontend-starter error (deprecated): please change reference in ' + appData.dirs.customConfig.configFile + ' from config.images.optimize to config.images.imagemin');
        process.exit(1);
      }

      var stream = injector.run('src', imgGlob);
      if (injector.isTaskCanceled(stream)) {
        return Promise.resolve();
      }

      if (!injector.isCanceled) {
        stream = gulp.src(appData.app.taskUtils.sanitizeGlob(stream ? stream : imgGlob))
          .pipe(plumber());
      }

      stream = injector.run('limit', stream);
      if (!injector.isCanceled) {
        stream = stream.pipe(changed(appData.dirs.dist.images));
      }

      if (!injector.isCanceled) {
        stream = injector.run('optimize', stream);
        if (!injector.isCanceled) {
          stream = stream.pipe(imagemin(injector.taskConfig.imagemin));
        }
      }

      stream = injector.run('dest', stream);
      if (!injector.isCanceled) {
        stream = stream.pipe(gulp.dest(appData.dirs.dist.images));
      }

      stream = injector.run('finish', stream);

      var promise = appData.app.taskUtils.streamToPromise(stream);

      promise.then(() => {
        stream = injector.run('reload');
        if (!injector.isCanceled) {
          if (taskParams.isWatch) {
            appData.browserSync.reload();
          }
        }
      });

      return promise;
    }
  }
}