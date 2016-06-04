'use strict';

module.exports = function(appData) {

  const gulp         = appData.gulp,
        debug        = require('gulp-debug'),
        eslint       = require('gulp-eslint'),
        merge        = require('merge-stream');

  appData.tasks.lint = {
    run: function(taskData) {
      taskData = taskData || {};

      var streams = [];
      var injector = new appData.Injector('lint', appData, taskData);

      var comps = appData.tasks.js.getComps().getContent();
      for (var compId in comps) {
        if (!comps.hasOwnProperty(compId))
          continue;
        var comp = comps[compId],
            injectorData = { comp };

        var stream = injector.run('src', null, injectorData);
        if (injector.isTaskCanceled(stream)) {
          continue;
        }

        if (!injector.isCanceled) {
          stream = gulp.src(stream ? stream : comp.getGlob('app'), { base: appData.dirs.src.main });
        }

        stream = this.perform(stream, injector, injectorData);

        stream = injector.run('finish', stream, injectorData);
        if (stream) {
          streams.push(stream);
        }
        stream.on('error', () => {});
      }

      return appData.app.streamToPromise(merge.apply(merge, streams));//, new Promise((rs, rj) => { setTimeout(() => { rs(); }, 5000 ) })]);
    },

    perform(stream, injector, injectorData, injectorJs) {

      if (!injector) {
        injector = new appData.Injector('lint', appData);
      }

      stream = injector.run('lint', stream, injectorData);
      if (!injector.isCanceled) {
        stream = stream.pipe(eslint(injector.taskConfig.options));
      }

      stream = injector.run('format', stream, injectorData);
      if (!injector.isCanceled) {
        let formatFn = injector.taskConfig.formatOnce ? eslint.format : eslint.formatEach;
        stream = stream.pipe(formatFn.apply(eslint, injector.taskConfig.formatParams));
      }

      if (injectorJs) {
        stream = injectorJs.run('lintFailAfterError', stream, injectorData);
        if (!injectorJs.isCanceled) {
          stream = stream.pipe(eslint.failAfterError());
          stream.on('error', (err) => {
            //console.log(err.name + ': ' + err.message);
            stream.emit('end');
          });
        }
      }

      return stream;
    }
  }
}