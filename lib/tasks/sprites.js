module.exports = function(appData) {

  var 
      gulp         = require('gulp'),
      buffer       = require('vinyl-buffer'),
      imagemin     = require('gulp-imagemin'),
      merge        = require('merge-stream'),
      spritesmith  = require('gulp.spritesmith'),
      plumber      = require('gulp-plumber'),
      sourcemaps   = require('gulp-sourcemaps'),
      postcss      = require('gulp-postcss'),
      sass         = require('gulp-sass');


  appData.tasks.sprites = {
    run: function(isDev, itemInfo, done) {
      if (done)
        console.log('Starting \'sprites\'...');

      var spriteData = gulp.src(itemInfo.imgSource + '**/*').pipe(spritesmith(itemInfo.options));

      var imgStream = spriteData.img
        .pipe(buffer());

      if (!isDev) {
        imgStream = imgStream
          .pipe(imagemin(appData.config.images.imagemin));
      }
      imgStream = imgStream
        .pipe(gulp.dest(itemInfo.imgDest));

      var cssStream = spriteData.css
          .pipe(gulp.dest(appData.dirs.src.styles.sprites));

      return merge(imgStream, cssStream).on('finish', function() {
        if (done) {
          done();
          console.log('Finished \'sprites\'');
        }
        appData.app.browserSync.reload();
      });
    }
  }
}
