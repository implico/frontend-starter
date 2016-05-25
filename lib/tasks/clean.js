module.exports = function(appData) {

  var 
    del          = require('del'),
    fs           = require('fs'),
    path         = require('path');


  appData.tasks.clean = {
    run: function(taskData) {
      taskData = taskData || { clearCache: false };
      var delDirs = [];

      var injector = new appData.Injector('clean', appData, taskData);
      if (injector.cancelTask)
        return injector.cancelTask;

      delDirs = injector.run('cache', delDirs);

      if (!injector.isCanceled('cache')) {
        delDirs.push(appData.dirs.cache);
      }

      // if (appData.config.clean.dist) {
      //   delDirs['dist'] = [appData.dirs.dist.main];
      // }
      // else {
      //   delDirs['dist'] = [];
      // }
      delDirs = injector.run('styles', delDirs);
      if (!injector.isCanceled('styles')) {
        delDirs.push(appData.dirs.dist.styles);
      }
      delDirs = injector.run('sprites', delDirs);
      if (!injector.isCanceled('sprites')) {
        delDirs.push(appData.dirs.src.styles.sprites);
      }
      delDirs = injector.run('fonts', delDirs);
      if (!injector.isCanceled('fonts')) {
        delDirs.push(appData.dirs.dist.fonts);
      }
      delDirs = injector.run('js', delDirs);
      if (!injector.isCanceled('js')) {
        delDirs.push(appData.dirs.dist.js);
      }
      delDirs = injector.run('images', delDirs);
      if (!injector.isCanceled('images')) {
        delDirs.push(appData.dirs.dist.images);
      }
      delDirs = injector.run('views', delDirs);
      if (!injector.isCanceled('views')) {
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
      if (!injector.isCanceled('custom')) {
        for (var dirName in appData.dirs.custom) {
          if (!appData.dirs.custom.hasOwnProperty(dirName))
            continue;
          var dirInfo = appData.dirs.custom[dirName];

          var injectorDir = new appData.Injector(dirInfo, appData, taskData);
          if (injectorDir.cancelTask)
            return injectorDir.cancelTask;

          delDirs = injectorDir.run('clean', delDirs, { id: dirName, dirInfo: dirInfo });
          if (!injectorDir.isCanceled('clean')) {
            if (dirInfo.to !== null)
              delDirs.push(dirInfo.to);
          }
        }
      }

      delDirs = injector.run('del', delDirs);
      if (!injector.isCanceled('del')) {
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