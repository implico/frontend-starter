'use strict';

module.exports = function(appData) {

  const del          = require('del'),
        fs           = require('fs'),
        path         = require('path');


  appData.tasks.clean = {
    run: function(taskParams) {
      taskParams = taskParams || {};

      var injector = new appData.Injector('clean', appData, taskParams);

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
      delDirs = injector.run('spritesStyles', delDirs);
      if (!injector.isCanceled) {
        delDirs.push(appData.dirs.src.sprites.styles);
      }
      delDirs = injector.run('spritesImages', delDirs);
      if (!injector.isCanceled) {
        if (appData.dirs.dist.sprites != appData.dirs.dist.images) {
          delDirs.push(appData.dirs.dist.sprites);
        }
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
        appData.config.customDirs.items.forEach((dirInfo) => {
          var injectorDir = new appData.Injector(dirInfo, appData, taskParams);

          delDirs = injectorDir.run('clean', delDirs, { dirInfo: dirInfo });
          if (!injectorDir.isCanceled) {
            if (dirInfo.dest !== null)
              delDirs.push(dirInfo.dest);
          }
        });
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