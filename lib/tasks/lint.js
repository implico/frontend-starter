'use strict';

module.exports = function(appData) {

  const gulp         = appData.gulp,
        debug        = require('gulp-debug'),
        merge        = require('merge2'),
        named        = require('vinyl-named'),
        path         = require('path');

  // Use gulp-eslint installed in app if available
  let eslint;
  try {
    eslint = require(path.join(appData.dirs.appModules, 'gulp-eslint'));
  } catch (ex) {
    eslint = require('gulp-eslint');
  }

  appData.tasks.lint = {
    run: function(taskParams) {
      taskParams = taskParams || {};

      var streams = [];
      var injector = new appData.Injector('lint', appData, taskParams);

      var comps = appData.tasks.js.getComps().getContent();
      for (var compId in comps) {
        if (!comps.hasOwnProperty(compId))
          continue;
        var comp = comps[compId],
            injectorData = { comp };

        var isWebpack = comp.getData('webpack');            

        var stream = injector.run('src', null, injectorData);
        if (injector.isTaskCanceled(stream)) {
          continue;
        }

        if (!injector.isCanceled) {
          if (isWebpack) {
            stream = gulp.src(appData.app.taskUtils.sanitizeGlob(stream ? stream : comp.getData('filename')))
              .pipe(named());
          }
          else {
            stream = gulp.src(appData.app.taskUtils.sanitizeGlob(stream ? stream : comp.getGlob('app')), { base: appData.dirs.src.main });
          }
        }

        stream = this.perform(stream, injector, injectorData);

        stream = injector.run('finish', stream, injectorData);
        if (stream) {
          streams.push(stream);
        }
        stream.on('error', () => {});
      }

      return appData.app.taskUtils.streamToPromise(merge.apply(merge, streams));//, new Promise((rs, rj) => { setTimeout(() => { rs(); }, 5000 ) })]);
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
