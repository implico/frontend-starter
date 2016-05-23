module.exports = function(appData) {

  var 
      gulp         = require('gulp'),
      changed      = require('gulp-changed'),
      imagemin     = require('gulp-imagemin'),
      plumber      = require('gulp-plumber');


  appData.tasks.images = {
    run: function(taskData) {
      taskData = taskData || { isDev: true };
      if (!appData.dirs.src.img)
        return Promise.resolve();
      
      var imgGlob = [appData.dirs.src.img + '**/*'];
      appData.config.sprites.items.forEach(function(spriteDir) {
        imgGlob.push('!' + spriteDir.imgSource);
        imgGlob.push('!' + spriteDir.imgSource + '**/*');
      });

      var injector = new appData.Injector('images', appData, taskData);

      var stream = injector.run('init');

      if (!stream) {
        stream = gulp.src(imgGlob)
      }

      stream = stream
        .pipe(plumber());

      stream = injector.run('changed', stream);
      if (!injector.isCanceled('changed')) {
        stream = stream
          .pipe(changed(appData.dirs.dist.img));
      }

      if (!taskData.isDev && !injector.isCanceled('imagemin')) {
        stream = injector.run('imagemin', stream);
        if (!injector.isCanceled('imagemin')) {
          stream = stream
            .pipe(imagemin(appData.config.images.imagemin));
        }
      }

      stream = injector.run('dest', stream);
      if (!injector.isCanceled('dest')) {
        stream = stream
          .pipe(gulp.dest(appData.dirs.dist.img));
      }

      stream = injector.run('finish', stream);

      return stream;
    }
  }
}