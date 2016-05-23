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
    run: function(taskData) {
      taskData = taskData || { isDev: true, itemInfo: {}, done: null };

      if (taskData.done)
        console.log('Starting \'sprites\'...');

      var spriteData = gulp.src(taskData.itemInfo.imgSource + '**/*').pipe(spritesmith(taskData.itemInfo.options));

      var imgStream = spriteData.img
        .pipe(buffer());

      if (!taskData.isDev) {
        imgStream = imgStream
          .pipe(imagemin(appData.config.images.imagemin));
      }
      imgStream = imgStream
        .pipe(gulp.dest(taskData.itemInfo.imgDest));

      var cssStream = spriteData.css
          .pipe(gulp.dest(appData.dirs.src.styles.sprites));

      return merge(imgStream, cssStream).on('finish', function() {
        if (taskData.done) {
          taskData.done();
          console.log('Finished \'sprites\'');
        }
        appData.app.browserSync.reload();
      });
    }
  }
}
