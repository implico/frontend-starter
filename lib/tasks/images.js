module.exports = function(appData) {

  var 
      gulp         = require('gulp'),
      changed      = require('gulp-changed'),
      imagemin     = require('gulp-imagemin'),
      plumber      = require('gulp-plumber');


  appData.tasks.images = {
    run: function(isDev) {
      if (!appData.dirs.src.img)
        return Promise.resolve();
      
      var imgGlob = [appData.dirs.src.img + '**/*'];
      appData.config.sprites.items.forEach(function(spriteDir) {
        imgGlob.push('!' + spriteDir.imgSource);
        imgGlob.push('!' + spriteDir.imgSource + '**/*');
      });

      var ret = gulp.src(imgGlob)
        .pipe(plumber())
        .pipe(changed(appData.dirs.dist.img));

      if (!isDev) {
        ret = ret
          .pipe(imagemin(appData.config.images.imagemin));
      }
      ret = ret
        .pipe(gulp.dest(appData.dirs.dist.img));

      return ret;
    }
  }
}