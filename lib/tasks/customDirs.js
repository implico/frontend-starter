module.exports = function(appData) {

  var 
      gulp         = appData.gulp,
      changed      = require('gulp-changed'),
      merge        = require('merge-stream');


  appData.tasks.customDirs = {
    run: function(taskData) {

      taskData = taskData || { dirInfos: appData.dirs.custom, showMessages: true, name: '' };
      if (!taskData.dirInfos) {
        taskData.dirInfos = appData.dirs.custom;
      }

      var streams = [];

      var injector = new appData.Injector('customDirs', appData, taskData);
      
      if (taskData.showMessages)
        console.log('Starting \'custom dirs\' [' + taskData.name + ']...');

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
          if (!injector.isCanceled) {
            stream = gulp.src(stream ? stream : dirInfo.from);
          }
          stream = injectorDir.run('limit', stream, injectorData);
          if (!injector.isCanceled) {
            stream = stream.pipe(changed(dirInfo.to));
          }
          stream = injectorDir.run('dest', stream, injectorData);
          if (!injector.isCanceled) {
            stream = stream.pipe(gulp.dest(dirInfo.to));
          }

          streams.push(stream);
        }
      }

      injector.run('finish', streams, { dirInfos: dirInfos });

      if (streams.length) {
        var promise = appData.app.streamToPromise(merge.apply(null, streams));
        promise.then(() => {
          if (taskData.showMessages) {
            console.log('Finished \'custom dirs\' [' + taskData.name + ']');
          }
        });
        return promise;
      }
      else {
        if (taskData.showMessages) {
          console.log('Finished \'custom dirs\' [' + taskData.name + ']');
        }
        return Promise.resolve();
      }
    }
  }
}