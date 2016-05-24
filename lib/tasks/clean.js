module.exports = function(appData) {

  var 
    del          = require('del'),
    fs           = require('fs'),
    path         = require('path');


  appData.tasks.clean = {
    run: function(taskData) {
      taskData = taskData || { clearCache: false };
      var delDirs = [];

      if (taskData.clearCache) {
        delDirs['cache'] = [appData.dirs.cache];
      }
      
      if (appData.config.clean.dist) {
        delDirs['dist'] = [appData.dirs.dist.main];
      }
      else {
        delDirs['dist'] = [];
      }
      delDirs['fonts'] = this.getConfigDirGlob(appData.dirs.dist.fonts, appData.config.clean.fonts);
      delDirs['styles'] = this.getConfigDirGlob(appData.dirs.dist.styles, appData.config.clean.styles);
      delDirs['sprites'] = this.getConfigDirGlob(appData.dirs.src.styles.sprites, appData.config.clean.sprites);
      delDirs['js'] = this.getConfigDirGlob(appData.dirs.dist.js, appData.config.clean.js);
      delDirs['img'] = this.getConfigDirGlob(appData.dirs.dist.img, appData.config.clean.img);
      delDirs['views'] = this.getConfigDirGlob(appData.dirs.dist.views, appData.config.clean.views, '*.*');
      delDirs['custom'] = [];

      //add sprites src styles
      // if (appData.config.clean.sprites) {
      //   appData.config.sprites.items.forEach(function(spriteInfo){
      //     var filename = spriteInfo.options.cssName;
      //     if (filename) {
      //       delDirs['sprites'].push(appData.dirs.src.styles.sprites + filename);
      //     }
      //   });
      // }

      //add views subdirs
      if (appData.dirs.src.views.main && delDirs['views'].length && fs.existsSync(appData.dirs.dist.views)) {
        delDirs['views'] = delDirs['views'].concat(fs.readdirSync(appData.dirs.src.views.scripts).filter(function(file) {
          return fs.statSync(path.join(appData.dirs.src.views.scripts, file)).isDirectory();
        }).map(function(dir) {
          return path.join(appData.dirs.dist.views, dir);
        }));
      }

      //add custom dirs
      if (appData.config.clean.custom) {
        for (var dirName in appData.dirs.custom) {
          if (!appData.dirs.custom.hasOwnProperty(dirName))
            continue;
          var dirInfo = appData.dirs.custom[dirName];

          if (dirInfo.clean) {
            delDirs['custom'].push(dirInfo.to);
          }
        }
      }

      var delDirsGlob = [];
      
      for (dirKey in delDirs) {
        if (delDirs.hasOwnProperty(dirKey)) {
          delDirsGlob = delDirsGlob.concat(delDirs[dirKey]);
        }
      };

      var delFiles = del.sync(delDirsGlob, { force: true });

      if (delFiles.length) {
        console.log('Deleted files/folders:\n', delFiles.join('\n'));
      }
      else {
        console.log('No files deleted.');
      }

      return Promise.resolve();
    },

    getConfigDirGlob: function(baseDir, configDir, suffix) {
      ret = [];
      if (configDir) {
        if (configDir === true)
          configDir = [baseDir + (suffix ? suffix : '')];

        if (configDir instanceof Array) {
          ret = configDir;
        }
        else {
          console.warn('Error: config.clean dir value expected to be an array.', baseDir, configDir);
        }
      }
      
      return ret;
    }
  }
}