module.exports = function(appData) {

  var 
      gulp         = require('gulp'),
      changed      = require('gulp-changed'),
      merge        = require('merge-stream');


  appData.tasks.customDirs = {
    run: function(taskData) {

      taskData = taskData || { dirInfos: [], isDev: true, cb: null };

      var streams = [];

      var injector = new appData.Injector('customDirs', appData, taskData);
      
      if (taskData.cb)
        console.log('Starting \'custom dirs\'...');

      var dirInfos = injector.run('init', taskData.dirInfos);

      for (var dirName in dirInfos) {
        if (!dirInfos.hasOwnProperty(dirName))
          continue;

        var dirInfo = dirInfos[dirName];

        var injectorDir = new appData.Injector(dirInfo, appData, taskData);

        //data passed to injector as a second parameter
        var injectorData = { id: dirName, dirInfo: dirInfo };

        var stream = injectorDir.run('src', null, injectorData );

        if (dirInfo.to !== null) {
          if (!injector.cancel) {
            stream = gulp.src(stream ? stream : dirInfo.from);
          }
          stream = injectorDir.run('limit', stream, injectorData);
          if (!injector.cancel) {
            stream = stream.pipe(changed(dirInfo.to));
          }
          stream = injectorDir.run('dest', stream, injectorData);
          if (!injector.cancel) {
            stream = stream.pipe(gulp.dest(dirInfo.to));
          }

          streams.push(stream);
        }
      }

      injector.run('finish', streams, { dirInfos: dirInfos });

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