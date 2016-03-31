module.exports = function(dirs, config, app, tasks) {

	var 
	    gulp       	 = require('gulp'),
	    changed      = require('gulp-changed'),
	    merge        = require('merge-stream');


	tasks.customDirs = {
		run: function(dirInfos, isDev, done) {

	    var streams = [];

	    if (done)
	      console.log('Starting \'custom dirs\'...');

	    for (var dirName in dirInfos) {
	      if (!dirInfos.hasOwnProperty(dirName))
	        continue;

	      var dirInfo = dirInfos[dirName];

	      if ((!isDev || dirInfo.dev) && (isDev || dirInfo.prod) && (dirInfo.to !== null)) {
	        var stream = gulp.src(dirInfo.from)
	          .pipe(changed(dirInfo.to))
	          .pipe(gulp.dest(dirInfo.to));

	        streams.push(stream);
	      }
	    };

	    if (streams.length) {
	      return merge.apply(null, streams).on('finish', function() {
	        if (done) {
	          done();
	          console.log('Finished \'custom dirs\'');
	        }
	      });
	    }
	    else {
	      if (done) {
	        done();
	        console.log('Finished \'custom dirs\'');
	      }
	      return Promise.resolve();
	    }
	  }
	}
}