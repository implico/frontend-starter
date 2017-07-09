'use strict';

module.exports = function(appData) {

  const gulp         = appData.gulp;

  appData.tasks.watch = {
    run: function(taskParams) {
      taskParams = taskParams || {}

      var _this = this,
          dirs = appData.dirs,
          config = appData.config,
          app = appData.app,
          tasks = appData.tasks,
          gulp = appData.gulp;

      var injector = new appData.Injector('watch', appData, taskParams);

      injector.run('init');

      //styles
      let stylesGlob = injector.run('styles', [dirs.bower + '**/*.scss', dirs.bower + '**/*.css', dirs.src.styles + '**/*.scss', dirs.src.styles + '**/*.css']);
      if (!injector.isCanceled) {
        // if (!stylesGlob) {
        //   //exclude sprite stylesheets
        //   stylesGlob.push('!' + dirs.dist.sprites.styles);
        // }

        gulp.watch(stylesGlob, injector.taskConfig.options, _this.getTaskFn('styles', () => {
          return tasks.styles.run({ isWatch: true });
        })).on('error', function(err) {
          //console.error(err);
        });
      }

      //fonts
      let fontsGlob = injector.run('fonts', [dirs.src.fonts + '**/*']);
      if (!injector.isCanceled) {
        gulp.watch(fontsGlob, injector.taskConfig.options, _this.getTaskFn('fonts', () => {
          return tasks.fonts.run({ isWatch: true });
        })).on('error', function(err) {
          //console.error(err);
        });
      }

      //sprites
      injector.run('sprites');
      if (!injector.isCanceled) {
        config.sprites.items.forEach(function(itemInfo) {
          gulp.watch(itemInfo.src, injector.taskConfig.options, _this.getTaskFn('sprites', () => {
            return tasks.sprites.run({ isWatch: true, itemInfos: [itemInfo] });
          })).on('error', function(err) {
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
              var globApp = comp.getGlob(comp.getData('webpack') ? 'webpack' : 'app', true);
              if (globApp.length) {
                gulp.watch(globApp, injector.taskConfig.options, _this.getTaskFn('js:app', () => {
                  return tasks.js.run({ isWatch: true, compId: curCompId, isApp: true });  //, taskNameBegin: 'js:app (' + curCompId + ')', taskNameEnd: true
                })).on('error', function(err) {
                  //console.error(err);
                });
              }
            }

            //js: vendor
            injector.run('jsVendor', undefined, { compId: compId, comp: comp });
            if (!injector.isCanceled && !comp.getData('webpack')) {
              //console.log('Watching vendor', curCompId, comp.getGlob('bower', true).concat(comp.getGlob('vendor', true)));
              var globVendor = comp.getGlob('bower', true).concat(comp.getGlob('vendor', true));
              if (globVendor.length) {
                gulp.watch(globVendor, injector.taskConfig.options, _this.getTaskFn('js:vendor', () => {
                  return new Promise((resolve, reject) => {
                    tasks.js.run({ isWatch: true, compId: curCompId, isApp: false, taskNameBegin: 'js (' + curCompId + ')', taskNameEnd: false }).then(() => {
                      tasks.js.run({ isWatch: true, compId: curCompId, isApp: true, taskNameBegin: false, taskNameEnd: 'js (' + curCompId + ')'}).then(resolve);
                    });
                  });
                })).on('error', function(err) {
                  //console.error(err);
                });
              }
            }
          })();
        }
      }
      
      //images
      let imagesGlob = injector.run('images', [dirs.src.images]);
      if (!injector.isCanceled) {

        gulp.watch(imagesGlob, injector.taskConfig.options, _this.getTaskFn('images', (cb) => {
          //timeout for temp files to be erased
          setTimeout(() => {
            appData.tasks.images.run({ isWatch: true }).then(() => {
              cb();
            });
          }, 500);
        })).on('error', function(err) {
          //console.error(err);
        });
      }

      //views
      var viewsGlob = injector.run('views', [dirs.src.views + '**/*']);
      if (!injector.isCanceled) {
        gulp.watch(viewsGlob, injector.taskConfig.options, _this.getTaskFn('views', () => {
          return tasks.views.run({ isWatch: true });
        })).on('error', function(err) {
          console.error(err);
        });
      }

      //custom dirs
      config.customDirs.items.forEach(function(dirInfo) {
        var injectorDir = new appData.Injector(dirInfo, appData, taskParams);
        injectorDir.run('watch', undefined, { dirInfo });

        if (!injectorDir.isCanceled) {
          gulp.watch(dirInfo.src, injector.taskConfig.options, _this.getTaskFn('custom-dirs' + (typeof dirInfo.name !== 'undefined' ? (' [' + dirInfo.name + ']') : '') , () => {
            return tasks.customDirs.run({ isWatch: true, itemInfos: [dirInfo] });
          })).on('error', function(err) {
            //console.error(err);
          });
        }
      });

      return new Promise((resolve, reject) => {
        tasks.browserSync.run({ blockOpen: config.main.isRestart }).then(() => {
          resolve();
        });
      });
    },

    //return task function wrapped in checking global watch blocking (e.g. while key shortcut build is in progress)
    getTaskFn(name, fn) {
      let f = function(cb) {
        return global.frsBlockWatch ? Promise.resolve() : fn(cb);
      }
      f.displayName = name;
      return f;
    }
  }
}
