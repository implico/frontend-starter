/**
  Frontend-starter

  @author Bartosz Sak
  
  https://github.com/implico/frontend-starter
  
  The MIT License (MIT)
  
  
  *******************
  Tasks configuration file

*/

const fs          = require('fs');
      //runSequence = require('run-sequence');


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
    'watch': {
      fn() {
        return tasks.watch.run();
      },
      blockQuitOnFinish: true
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
    },

    'default': {
      deps: ['watch'],
      blockQuitOnFinish: true
    },

    'build': {
      deps: ['clean', 'views', 'fonts', 'sprites', ['images', 'styles', 'js', 'custom-dirs']]
    },

    'start': {
      deps: ['build', 'watch'],
      blockQuitOnFinish: true
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

    deps = deps || [];
    if (taskData.fn) {
      if (!taskData.blockQuitOnFinish) {
        deps.push(() => {
          return taskData.fn().then(() => {
            setTimeout(() => {
              app.quitIfInvoked(taskName);
            }, 0);
          });
        });
      }
      else {
        deps.push(taskData.fn);
      }
    }

    if (deps.length) {
      let gulpParams = [];
          //curSeries = null;
      for (let depIndex = 0; depIndex < deps.length; depIndex++) {
        let curDep = deps[depIndex];
        // if (curSeries && ((curDep instanceof Array) || (depIndex == (deps.length - 1)))) {
        //   gulpParams.push(gulp.parallel.apply(gulp, curSeries));
        //   curSeries = null;
        // }
        if ((typeof curDep == 'string') || (typeof curDep == 'function')) {
          // curSeries = curSeries || [];
          gulpParams.push(curDep);
        }
        else if (curDep instanceof Array) {
          gulpParams.push(gulp.parallel.apply(gulp, curDep));
        }
      }

      if (!taskData.fn) {
        let finalizeFn = function () {
          if (!taskData.blockQuitOnFinish) {
            setTimeout(() => {
              app.quitIfInvoked(taskName);
            }, 0);
          }

          return Promise.resolve();
        }
        finalizeFn.displayName = 'finalize ' + taskName;
        gulpParams.push(finalizeFn);
      }

      if ((gulpParams.length == 1) && (typeof gulpParams[0] == 'function')) {
        //only one function
        gulp.task(taskName, gulpParams[0]);
      }
      else {
        gulp.task(taskName, gulp.series.apply(gulp, gulpParams));
      }
    }
  }
}