/**
  Frontend-starter

  @author Bartosz Sak
  
  https://github.com/implico/frontend-starter
  
  The MIT License (MIT)
  
  
  *******************
  Tasks configuration file

*/

const fs          = require('fs'),
      runSequence = require('run-sequence');


module.exports = function(appData) {

  'use strict';

  //future: var { dirs, config, app, tasks, taskReg, gulp, browserSync, Injector } = appData;
  var dirs = appData.dirs,
      config = appData.config,
      app = appData.app,
      tasks = appData.tasks,
      gulp = appData.gulp,
      browserSync = appData.browserSync,
      Injector = appData.Injector;

  //task registry
  var taskReg = {
    'default': {
      deps: ['watch'],
      blockQuitOnFinish: true
    },

    'start': {
      deps: ['build', 'watch'],
      blockQuitOnFinish: true
    },

    'watch': {
      fn() {
        return tasks.watch.run();
      },
      blockQuitOnFinish: true
    },

    'build': {
      deps: ['clean', 'views', 'fonts', 'sprites', ['images', 'styles', 'js', 'custom-dirs']]
    },

    'styles': {
      fn() {
        return tasks.styles.run({});
      }
    },

    'fonts': {
      fn() {
        return tasks.fonts.run({});
      }
    },

    'sprites': {
      fn() {
        var promises = [];

        config.sprites.items.forEach(function(itemInfo) {
          promises.push(tasks.sprites.run({ itemInfo: itemInfo }));
        });

        return Promise.all(promises);
      }
    },

    'js:app': {
      fn() {
        var promises = [];

        var comps = tasks.js.getComps().getContent();
        for (var compId in comps) {
          if (!comps.hasOwnProperty(compId))
            continue;
          var comp = comps[compId];

          promises.push(tasks.js.run({ compId: compId, isApp: true, taskNameBegin: '', taskNameEnd: ''}));
        }

        return Promise.all(promises);
      }
    },

    'js:vendor': {
      fn() {
        var promises = [];

        var comps = tasks.js.getComps().getContent();
        for (var compId in comps) {
          if (!comps.hasOwnProperty(compId))
            continue;

          promises.push(tasks.js.run({ compId: compId, isApp: false, taskNameBegin: compId, taskNameEnd: '' }));
        }

        return Promise.all(promises);
      }
    },

    'js': {
      deps: ['js:vendor', 'js:app']
    },

    'images': {
      fn() {
        return tasks.images.run({});
      }
    },

    'views': {
      fn() {
        return tasks.views.run({});
      }
    },

    'custom-dirs': {
      fn() {
        return tasks.customDirs.run({});
      }
    },

    'lint': {
      fn() {
        return tasks.lint.run({});
      }
    },

    'browser-sync': {
      fn() {
        return tasks.browserSync.run({});
      }
    },

    'clean': {
      fn() {
        return tasks.clean.run({});
      }
    }
  }

  //change the appData object
  for (let taskName in taskReg) {
    if (taskReg.hasOwnProperty(taskName)) {
      appData.taskReg[taskName] = taskReg[taskName];
    }
  }

  //custom tasks file
  var noCustomFile = false;
  try {
    fs.accessSync(dirs.app + dirs.customConfig.tasksFile, fs.R_OK);
  }
  catch (ex) {
    noCustomFile = true;
  }
  if (!noCustomFile) {
    require(dirs.app + dirs.customConfig.tasksFile)(appData);
  }


  //register tasks in gulp
  for (let taskName in appData.taskReg) {
    if (!appData.taskReg.hasOwnProperty(taskName))
      continue;
    let taskData = appData.taskReg[taskName],
        deps = taskData.deps;

    if (deps) {
      if (!(deps instanceof Array))
        deps = [deps];

      gulp.task(taskName, function(cb) {
        runSequence.apply(runSequence, deps.concat([() => {
          let promise;
          if (taskData.fn) {
            promise = taskData.fn();
          }
          else {
            promise = Promise.resolve();
          }
          promise.then(() => {
            cb();
            if (!taskData.blockQuitOnFinish) {
              app.quitIfInvoked(taskName);
            }
          });

          return promise;
        }]));
      });
    }
    else {
      gulp.task(taskName, () => {
        let promise;
        if (taskData.fn) {
          promise = taskData.fn();
        }
        else {
          promise = Promise.resolve();
        }

        promise.then(() => {
          if (!taskData.blockQuitOnFinish) {
            setTimeout(() => {
              app.quitIfInvoked(taskName);
            }, 0);
          }
        });
        return promise;
      });
    }
  }
}