module.exports = function(appData) {

  var 
      gulp         = require('gulp'),
      changed      = require('gulp-changed'),
      merge        = require('merge-stream');


  appData.tasks.customDirs = {
    run: function(taskData) {

      taskData = taskData || { dirInfos: [], isDev: true, cb: null };

      var streams = [];

      if (taskData.cb)
        console.log('Starting \'custom dirs\'...');

      for (var dirName in taskData.dirInfos) {
        if (!taskData.dirInfos.hasOwnProperty(dirName))
          continue;

        var dirInfo = taskData.dirInfos[dirName];

        if ((!taskData.isDev || dirInfo.dev) && (taskData.isDev || dirInfo.prod) && (dirInfo.to !== null)) {
          var stream = gulp.src(dirInfo.from)
            .pipe(changed(dirInfo.to))
            .pipe(gulp.dest(dirInfo.to));

          streams.push(stream);
        }
      }

      if (streams.length) {
        return merge.apply(null, streams).on('finish', function() {
          if (taskData.cb) {
            taskData.cb();
            console.log('Finished \'custom dirs\'');
          }
        });
      }
      else {
        if (taskData.cb) {
          taskData.cb();
          console.log('Finished \'custom dirs\'');
        }
        return Promise.resolve();
      }
    }
  }
}