'use strict';

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
      taskParams = taskParams || { isWatch: false, itemInfos: config.sprites.items };
      if (!taskParams.itemInfos) {
        taskParams.itemInfos = appData.config.sprites.items;
      }

      var streams = [];

      var injector = new appData.Injector('sprites', appData, taskParams);
      var itemInfos = injector.run('init', taskParams.itemInfos);
      if (injector.isTaskCanceled(itemInfos)) {
        return Promise.resolve();
      }


      itemInfos.forEach(function(itemInfo) {

        injector.taskData = { itemInfo };

        var spriteData = injector.run('src');
        if (!injector.isCanceled) {
          spriteData = gulp.src(appData.app.taskUtils.sanitizeGlob(itemInfo.src))
            .pipe(spritesmith(itemInfo.options));
        }
        else {
          //item canceled
          if (!spriteData) {
            return;
          }
        }

        var imgStream = spriteData.img;

        imgStream = injector.run('imgLimit', imgStream);
        if (!injector.isCanceled) {
          imgStream = imgStream.pipe(buffer());
        }

        imgStream = injector.run('imgOptimize', imgStream);
        if (!injector.isCanceled) {
          var injectorImages = new appData.Injector('images', appData);
          imgStream = imgStream.pipe(imagemin(injectorImages.taskConfig.imagemin));
        }
        imgStream = injector.run('imgDest', imgStream);
        if (!injector.isCanceled) {
          imgStream = imgStream.pipe(gulp.dest(itemInfo.dest));
        }
        streams.push(imgStream);

        var cssStream = spriteData.css;

        cssStream = injector.run('cssDest', cssStream);
        if (!injector.isCanceled) {
          cssStream = cssStream.pipe(gulp.dest(appData.dirs.dist.sprites.styles));
        }
        streams.push(cssStream);
      });

      injector.run('finish', streams, taskParams.itemInfos);

      var promise;
      if (streams.length) {
        promise = appData.app.taskUtils.streamToPromise(merge.apply(merge, streams));
      }
      else {
        promise = Promise.resolve();
      }

      promise.then(() => {
        injector.run('reload', itemInfos);
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
