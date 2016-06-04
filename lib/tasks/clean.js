module.exports = function(appData) {

  var 
    del          = require('del'),
    fs           = require('fs'),
    path         = require('path');


  appData.tasks.clean = {
    run: function(taskData) {
      taskData = taskData || {};

      var injector = new appData.Injector('clean', appData, taskData);

      var delDirs = injector.run('init', []);
      if (injector.isTaskCanceled(delDirs)) {
        return Promise.resolve();
      }

      delDirs = injector.run('cache', delDirs);
      if (!injector.isCanceled) {
        delDirs.push(appData.dirs.cache);
      }

      // if (appData.config.clean.dist) {
      //   delDirs['dist'] = [appData.dirs.dist.main];
      // }
      // else {
      //   delDirs['dist'] = [];
      // }
      delDirs = injector.run('styles', delDirs);
      if (!injector.isCanceled) {
        delDirs.push(appData.dirs.dist.styles);
      }
      delDirs = injector.run('sprites', delDirs);
      if (!injector.isCanceled) {
        delDirs.push(appData.dirs.src.styles.sprites);
      }
      delDirs = injector.run('fonts', delDirs);
      if (!injector.isCanceled) {
        delDirs.push(appData.dirs.dist.fonts);
      }
      delDirs = injector.run('js', delDirs);
      if (!injector.isCanceled) {
        delDirs.push(appData.dirs.dist.js);
      }
      delDirs = injector.run('images', delDirs);
      if (!injector.isCanceled) {
        delDirs.push(appData.dirs.dist.images);
      }
      delDirs = injector.run('views', delDirs);
      if (!injector.isCanceled) {
        delDirs.push(appData.dirs.dist.views + '*.*');

        //add views subdirs (only corresponding subdirs are removed, because usually views are placed in the root dir)
        if (appData.dirs.src.views.main && fs.existsSync(appData.dirs.dist.views)) {
          delDirs = delDirs.concat(fs.readdirSync(appData.dirs.src.views.scripts).filter(function(file) {
            return fs.statSync(path.join(appData.dirs.src.views.scripts, file)).isDirectory();
          }).map(function(dir) {
            return path.join(appData.dirs.dist.views, dir);
          }));
        }
      }
      delDirs = injector.run('custom', delDirs);
      if (!injector.isCanceled) {
        for (var dirName in appData.dirs.custom) {
          if (!appData.dirs.custom.hasOwnProperty(dirName))
            continue;
          var dirInfo = appData.dirs.custom[dirName];

          //compatibility error
          if (typeof dirInfo.clean !== 'undefined') {
            console.error('Frontend-starter error (deprecated): please change "clean: false" into "inject: { clean: false }" in your ' + appData.dirs.customConfig.dirsFile + ' file (custom dirs definitions)');
            process.exit(1);
          }

          var injectorDir = new appData.Injector(dirInfo, appData, taskData);

          delDirs = injectorDir.run('clean', delDirs, { id: dirName, dirInfo: dirInfo });
          if (!injectorDir.isCanceled) {
            if (dirInfo.to !== null)
              delDirs.push(dirInfo.to);
          }
        }
      }

      delDirs = injector.run('del', delDirs);
      if (!injector.isCanceled) {
        var delFiles = del.sync(delDirs, { force: true });

        if (delFiles.length) {
          console.log('Deleted files/folders:\n', delFiles.join('\n'));
        }
        else {
          console.log('No files deleted.');
        }
      }

      injector.run('finish', delDirs);

      return Promise.resolve();
    }
  }
}