module.exports = function(dirs, config, app, tasks) {

	var 
    del          = require('del'),
    fs           = require('fs'),
    path         = require('path');


	tasks.clean = {
    run: function(clearCache) {
      var delDirs = [];

      if (clearCache) {
      	delDirs['cache'] = [dirs.cache];
      }
      delDirs['dist'] = [];
      delDirs['fonts'] = this.getConfigDirGlob(dirs.dist.fonts, config.clean.fonts);
      delDirs['styles'] = this.getConfigDirGlob(dirs.dist.styles, config.clean.styles);
      delDirs['sprites'] = this.getConfigDirGlob(dirs.src.styles.sprites, config.clean.sprites);
      delDirs['js'] = this.getConfigDirGlob(dirs.dist.js, config.clean.js);
      delDirs['img'] = this.getConfigDirGlob(dirs.dist.img, config.clean.img);
      delDirs['views'] = this.getConfigDirGlob(dirs.dist.views, config.clean.views, '*.*');
      delDirs['custom'] = [];

      //add dist dir
      if (config.clean.dist) {
        delDirs['dist'] = [dirs.dist.main];
      }

      //add sprites src styles
      // if (config.clean.sprites) {
      //   config.sprites.items.forEach(function(spriteInfo){
      //     var filename = spriteInfo.options.cssName;
      //     if (filename) {
      //       delDirs['sprites'].push(dirs.src.styles.sprites + filename);
      //     }
      //   });
      // }

      //add views subdirs
      if (dirs.src.views.main && delDirs['views'].length && fs.existsSync(dirs.dist.views)) {
        delDirs['views'] = delDirs['views'].concat(fs.readdirSync(dirs.src.views.scripts).filter(function(file) {
          return fs.statSync(path.join(dirs.src.views.scripts, file)).isDirectory();
        }).map(function(dir) {
          return path.join(dirs.dist.views, dir);
        }));
      }

      //add custom dirs
      if (config.clean.custom) {
        for (var dirName in dirs.custom) {
          if (!dirs.custom.hasOwnProperty(dirName))
            continue;
          var dirInfo = dirs.custom[dirName];

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
      //del.sync(dirs.dist.main);

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