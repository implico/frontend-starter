module.exports = function(appData) {

  const gulp         = appData.gulp,
        buffer       = require('vinyl-buffer'),
        imagemin     = require('gulp-imagemin'),
        merge        = require('merge-stream'),
        spritesmith  = require('gulp.spritesmith'),
        plumber      = require('gulp-plumber'),
        sourcemaps   = require('gulp-sourcemaps'),
        postcss      = require('gulp-postcss'),
        sass         = require('gulp-sass');


  appData.tasks.sprites = {
    run: function(taskParams) {
      taskParams = taskParams || { isWatch: false, itemInfo: {} };

      var injector = new appData.Injector('sprites', appData, taskParams);

      var spriteData = injector.run('init');
      if (injector.isTaskCanceled(spriteData)) {
        return Promise.resolve();
      }

      if (!spriteData) {
        spriteData = gulp.src(appData.app.sanitizeGlob(taskParams.itemInfo.imgSource))
          .pipe(spritesmith(taskParams.itemInfo.options));
      }

      var imgStream = injector.run('imgSrc', spriteData.img);

      if (!injector.isCanceled) {
        imgStream = spriteData.img
          .pipe(buffer());
      }

      imgStream = injector.run('imgOptimize', imgStream);
      if (!injector.isCanceled) {
        var injectorImages = new appData.Injector('images', appData);
        imgStream = imgStream.pipe(imagemin(injectorImages.taskConfig.imagemin));
      }
      imgStream = injector.run('imgDest', imgStream);
      if (!injector.isCanceled) {
        imgStream = imgStream.pipe(gulp.dest(taskParams.itemInfo.imgDest));
      }

      var cssStream = injector.run('cssSrc', spriteData.css);
      if (!injector.isCanceled) {
        cssStream = spriteData.css;
      }

      cssStream = injector.run('cssDest', cssStream);
      if (!injector.isCanceled) {
        cssStream = cssStream.pipe(gulp.dest(appData.dirs.src.sprites.styles));
      }

      var promise = appData.app.streamToPromise(merge(imgStream, cssStream));
      promise.then(() => {
        injector.run('reload');
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
