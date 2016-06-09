'use strict';

module.exports = function(appData) {

  const gulp         = appData.gulp,
        batch        = require('gulp-batch');

  appData.tasks.watch = {
    run: function(taskData) {
      taskData = taskData || {}

      var dirs = appData.dirs,
          config = appData.config,
          app = appData.app,
          tasks = appData.tasks,
          gulp = appData.gulp;

      var injector = new appData.Injector('watch', appData, taskData);

      injector.run('init');

      //styles
      injector.run('styles');
      if (dirs.src.styles.main && !injector.isCanceled) {
        //exclude sprite stylesheets
        var watchGlob = [dirs.bower + '**/*.scss', dirs.bower + '**/*.css', dirs.src.styles.main + '**/*.scss', dirs.src.styles.main + '**/*.css'];
        watchGlob.push('!' + dirs.src.styles.sprites);
        
        gulp.watch(watchGlob, gulp.series('styles')).on('error', function(err) {
          //console.error(err);
        });
      }

      //fonts
      injector.run('fonts');
      if (dirs.src.fonts && !injector.isCanceled) {
        var fn = function() {
          return tasks.fonts.run({ isWatch: true });
        }
        fn.displayName = 'fonts';
        gulp.watch(dirs.src.fonts + '**/*', fn).on('error', function(err) {
          //console.error(err);
        });
      }

      //sprites
      injector.run('sprites');
      if (!injector.isCanceled) {
        config.sprites.items.forEach(function(itemInfo) {
          let fn = function() {
            return tasks.sprites.run({ isWatch: true, itemInfo: itemInfo });
          }
          fn.displayName = 'sprites';
          gulp.watch(itemInfo.imgSource + '**/*.*', fn).on('error', function(err) {
            //console.error(err);
          });
        });
      }

      //JS
      injector.run('js');
      if (!injector.isCanceled) {
        var comps = tasks.js.getComps().getContent();
        for (var compId in comps) {
          if (!comps.hasOwnProperty(compId))
            continue;
          var comp = comps[compId];
          
          (() => {
            var curCompId = compId;
            //js: app
            injector.run('jsApp', undefined, { compId: compId, comp: comp });
            if (!injector.isCanceled) {
              //console.log('Watching app', compId, comp.getGlob('app', true));
              var globApp = comp.getGlob('app', true);
              if (globApp.length) {
                let fn = function() {
                  return tasks.js.run({ isWatch: true, compId: curCompId, isApp: true });  //, taskNameBegin: 'js:app (' + curCompId + ')', taskNameEnd: true
                }
                fn.displayName = 'js:app';
                gulp.watch(globApp, fn).on('error', function(err) {
                  //console.error(err);
                });
              }
            }

            //js: vendor
            injector.run('jsVendor', undefined, { compId: compId, comp: comp });
            if (!injector.isCanceled) {
              //console.log('Watching vendor', curCompId, comp.getGlob('bower', true).concat(comp.getGlob('vendor', true)));
              var globVendor = comp.getGlob('bower', true).concat(comp.getGlob('vendor', true));
              if (globVendor.length) {
                let fn = function(){
                  return new Promise((resolve, reject) => {
                    tasks.js.run({ isWatch: true, compId: curCompId, isApp: false, taskNameBegin: 'js (' + curCompId + ')', taskNameEnd: false }).then(() => {
                      tasks.js.run({ isWatch: true, compId: curCompId, isApp: true, taskNameBegin: false, taskNameEnd: 'js (' + curCompId + ')'}).then(resolve);
                    });
                  });
                }
                fn.displayName = 'js:vendor';
                gulp.watch(globVendor, fn).on('error', function(err) {
                  //console.error(err);
                });
              }
            }
          })();
        }
      }
      
      //images
      injector.run('images');
      if (dirs.src.images && !injector.isCanceled) {
        //exclude sprite dirs
        var watchGlob = [dirs.src.images + '**/*'];
        config.sprites.items.forEach((spriteInfo) => {
          watchGlob.push('!' + spriteInfo.imgSource);
          watchGlob.push('!' + spriteInfo.imgSource + '**/*');
        });

        var fn = function(cb) {
          //timeout for temp files to be erased
          setTimeout(() => {
            appData.tasks.images.run({ isWatch: true }).then(() => {
              cb();
            });
          }, 500);
        }
        fn.displayName = 'images';

        gulp.watch(watchGlob, fn).on('error', function(err) {
          //console.error(err);
        });
      }

      //views
      injector.run('views');
      if (dirs.src.views && !injector.isCanceled) {
        var fn = function() {
          return tasks.views.run({ isWatch: true });
        }
        fn.displayName = 'views';
        gulp.watch([dirs.src.views + '**/*'], fn).on('error', function(err) {
          console.error(err);
        });
      }

      //custom dirs
      for (var dirName in dirs.custom) {
        if (!dirs.custom.hasOwnProperty(dirName))
          continue;

        var dirInfo = dirs.custom[dirName];
        var injectorDir = new appData.Injector(dirInfo, appData, taskData);
        injectorDir.run('watch', undefined, { id: dirName, dirInfo: dirInfo });

        if (!injectorDir.isCanceled) {
          ((dirInfo) => {
            let fn = function() {
              return tasks.customDirs.run({ isWatch: true, dirInfos: [dirInfo] });
            }
            fn.displayName = 'custom-dirs [' + dirName + ']';
            gulp.watch(dirInfo.from, fn).on('error', function(err) {
              //console.error(err);
            });
          })(dirInfo);
        }
      }

      return new Promise((resolve, reject) => {
        tasks.browserSync.run({ blockOpen: config.main.isRestart }).then(() => {
          resolve();
        });
      });
    }
  }
}