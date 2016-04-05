module.exports = function(dirs, config, app, tasks) {

	var 
	    gulp       	 = require('gulp'),
	    changed      = require('gulp-changed'),
	    imagemin     = require('gulp-imagemin'),
	    plumber      = require('gulp-plumber');


	tasks.images = {
		run: function(isDev) {
			if (!dirs.src.img)
				return Promise.resolve();
			
	    var imgGlob = [dirs.src.img + '**/*'];
	    config.sprites.items.forEach(function(spriteDir) {
	      imgGlob.push('!' + spriteDir.imgSource);
	      imgGlob.push('!' + spriteDir.imgSource + '**/*');
	    });

	    var ret = gulp.src(imgGlob)
	      .pipe(plumber())
	      .pipe(changed(dirs.dist.img));

	    if (!isDev) {
	      ret = ret
	        .pipe(imagemin(config.images.imagemin));
	    }
	    ret = ret
	      .pipe(gulp.dest(dirs.dist.img));

	    return ret;
		}
	}
}