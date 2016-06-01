module.exports = function(appData) {

  var 
      batch        = require('gulp-batch'),
      watch        = require('gulp-watch');

  appData.tasks.watch = {
    run: function(taskData) {
      taskData = taskData || {}

      var dirs = appData.dirs,
          config = appData.config,
          app = appData.app,
          tasks = appData.tasks,
          gulp = appData.gulp;

      //styles
      if (dirs.src.styles.main) {
        //exclude sprite stylesheets
        var watchGlob = [dirs.bower + '**/*.scss', dirs.bower + '**/*.css', dirs.src.styles.main + '**/*.scss', dirs.src.styles.main + '**/*.css'];
        watchGlob.push('!' + dirs.src.styles.sprites);
        
        watch(watchGlob, batch(function (events, done) {
          gulp.start('styles', done);
        })).on('error', function(err) {
          //console.error(err);
        });
      }

      //fonts
      if (dirs.src.fonts) {
        watch(dirs.src.fonts + '**/*', batch(function (events, done) {
          gulp.start('fonts', app.reload(done));
        })).on('error', function(err) {
          //console.error(err);
        });
      }

      //sprites
      config.sprites.items.forEach(function(itemInfo) {
        watch(itemInfo.imgSource + '**/*.*', batch(function (events, done) {
          tasks.sprites.run({ itemInfo: itemInfo, showMessages: true }).then(app.reload(done));
        })).on('error', function(err) {
          //console.error(err);
        });
      });

      //JS
      var comps = tasks.js.getComps().getContent();
      for (var compId in comps) {
        if (!comps.hasOwnProperty(compId))
          continue;
        var comp = comps[compId];
        
        //js - app
        (() => {
          var curCompId = compId;
          //console.log('Watching app', compId, comp.getGlob('app', true));
          var globApp = comp.getGlob('app', true);
          if (globApp.length) {
            watch(globApp, batch(function (events, done) {
              tasks.js.run({ compId: curCompId, isApp: true, taskNameBegin: 'js:app (' + curCompId + ')', taskNameEnd: true}).then(done);
            })).on('error', function(err) {
              //console.error(err);
            });
          }

          //console.log('Watching vendor', curCompId, comp.getGlob('bower', true).concat(comp.getGlob('vendor', true)));
          //js - vendor
          var globVendor = comp.getGlob('bower', true).concat(comp.getGlob('vendor', true));
          if (globVendor.length) {
            watch(globVendor, batch(function (events, done) {
              tasks.js.run({ compId: curCompId, isApp: false, taskNameBegin: 'js (' + curCompId + ')', taskNameEnd: false }).then(() => {
                tasks.js.run({ compId: curCompId, isApp: true, taskNameBegin: false, taskNameEnd: 'js (' + curCompId + ')'}).then(done);
              });
            })).on('error', function(err) {
              //console.error(err);
            });
          }
        })();
      }
      
      //images
      if (dirs.src.images) {
        //exclude sprite dirs
        var watchGlob = [dirs.src.images + '**/*'];
        config.sprites.items.forEach((spriteInfo) => {
          watchGlob.push('!' + spriteInfo.imgSource);
        });

        watch(watchGlob, batch(function (events, done) {
          //timeout for temp files to be erased
          setTimeout(() => {
            gulp.start('images', app.reload(done));
          }, 500);
        })).on('unlink', function(path) {
          //TODO: handle images removal in dist dir
        }).on('error', function(err) {
          //console.error(err);
        });
      }

      //views
      if (dirs.src.views) {
        watch([dirs.src.views + '**/*'], batch(function (events, done) {
          gulp.start('views', app.reload(done));
        })).on('error', function(err) {
          console.error(err);
        });
      }

      //custom dirs
      for (var dirName in dirs.custom) {
        if (!dirs.custom.hasOwnProperty(dirName))
          continue;

        var dirInfo = dirs.custom[dirName];

        ((dirInfo) => {
          watch(dirInfo.from, batch(function (events, done) {
            tasks.customDirs.run({ dirInfos: [dirInfo], showMessages: true, name: dirName }).then(app.reload(done));
          })).on('error', function(err) {
            //console.error(err);
          });
        })(dirInfo);
      }

      return new Promise((resolve, reject) => {
        tasks.browserSync.run({ blockOpen: config.main.isRestart }).then(() => {
          resolve();
        });
      });
    }
  }
}