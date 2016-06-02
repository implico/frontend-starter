/**
  Frontend-starter

  @author Bartosz Sak, Archas
  
  https://github.com/implico/frontend-starter
  
  The MIT License (MIT)
  
  
  *******************
  API

  gulp
    default task, equals to gulp watch

  gulp clean
    cleans dist dir

  gulp start
    runs build and watch

  gulp build
    cleans and compiles/builds the app (with -p: optimized for production)

  gulp watch
    runs watch with Browsersync

  options:
  -p production mode
  -r restart mode (blocked opening new browserSync window)

*/

'use strict';

var path = require('path');


//gett app root dir
var appDir;
if (!process.env.FRS_BASE_DIR) {
  console.log('Frontend-starter: FRS_BASE_DIR env variable not set - module called directly from the command line.');
  // process.exit();
  appDir = path.normalize(__dirname + '/../');
}
else {
  appDir = path.normalize(process.env.FRS_BASE_DIR + '/');
}
console.log('Frontend-starter: Project base dir set to ' + appDir);


/* VARS */
var dirs         = require('./gulpfile.dirs')(appDir),
    config       = require('./gulpfile.config')(dirs),
    Injector     = require(dirs.lib.main + 'injector'),

    browserSync  = require('browser-sync'),
    merge        = require('merge-stream'),
    runSequence  = require('run-sequence'),

    gulp         = require('gulp'),
    debug        = require('gulp-debug');


//terminate Browsersync when the main process sends closing string (or the data is not a string)
process.stdin.on('data', function(data) {
  if ((!data.indexOf) || (data.indexOf('_FRS_CLOSE_') >= 0)) {
    browserSync.exit();
    process.exit();
  }
});


//core tasks container
var tasks = {};

//tasks registry
var taskReg = {};


var app = {

  invokedTask: 'default',

  init: function() {
    this.setInvokedTask();
  },

  setInvokedTask: function() {
    var args = process.argv.slice(2),
        task;
    args.some((arg) => {
      if (arg.charAt(0) != '-') {
        task = arg;
        return true;
      }
    });

    if (task) {
      this.invokedTask = task;
    }
  },

  quitIfInvoked: function(taskName, cb) {
    if (cb) {
      cb();
    }
    if (this.invokedTask == taskName) {
      process.exit();
    }
  },

  streamToPromise: function(stream) {
    if (!(stream instanceof Promise)) {
      return new Promise((resolve, reject) => {
        stream.on('finish', resolve);
      });
    }
    return stream;
  },

  //aux: reloads Browsersync and calls the callback
  reload: function(cb) {
    var _this = this;
    return function() {
      browserSync.reload();
      if (cb) {
        cb();
      }
    }
  },

  //taskReg utils
  taskReg: {

    addDep(taskName, targetTaskName, relatedDepName, isBefore) {
      if (taskReg[targetTaskName]) {
        taskReg[targetTaskName].deps = this.addDepArray(taskReg[targetTaskName].deps, taskName, relatedDepName, isBefore);
      }
      else {
        console.err('Frontend-starter error: task to add dependency not found (' + targetTaskName + ')');
        exit(1);
      }
    },

    //removes task from target task deps
    //targetTaskNames: string (single task), array or true for all tasks
    removeDep(taskName, targetTaskNames) {
      var _this = this;

      if (targetTaskNames === true) {
        targetTaskNames = [];
        for (var i in taskReg) {
          if (taskReg.hasOwnProperty(i)) {
            targetTaskNames.push(i);
          }
        }
      }
      else if (!(targetTaskNames instanceof Array)) {
        targetTaskNames = [targetTaskNames];
      }

      targetTaskNames.forEach((targetTaskName) => {
        var deps = taskReg[targetTaskName].deps;
        if (deps instanceof Array) {
          taskReg[targetTaskName].deps = deps = _this.removeDepArray(taskName, deps);
          deps.forEach((dep, index) => {
            deps[index] = _this.removeDepArray(taskName, dep);
          });
        }
      });
    },

    removeTask: function(taskName) {
      if (taskReg[taskName]) {
        delete taskReg[taskName];
        this.removeDep(taskName, true);
        if (['styles', 'fonts', 'sprites', 'js', 'images', 'views', 'lint'].indexOf(taskName) >= 0) {
          if (config.watch.inject[taskName] === true) {
            config.watch.inject[taskName] = false;
          }
          if (config.watch.dev && config.watch.dev.inject && config.watch.dev.inject[taskName] === true) {
            config.watch.dev.inject[taskName] = false;
          }
          if (config.watch.prod && config.watch.prod.inject && config.watch.prod.inject[taskName] === true) {
            config.watch.prod.inject[taskName] = false;
          }
        }
      }
      else {
        console.err('Frontend-starter error: task to remove not found (' + taskName + ')');
        exit(1);
      }
    },

    //helper for removeDep()
    removeDepArray(taskName, array) {
      if (array instanceof Array) {
        var index = array.indexOf(taskName);
        if (index >= 0) {
          delete array[index];
          array = array.filter((dep) => {
            return typeof dep !== 'undefined';
          });
        }
      }
      return array;
    },

    //helper for addDep()
    addDepArray(deps, taskName, relatedDepName, isBefore, startIndex) {
      var _this = this;
          //depsCopy = deps.slice(0);
      startIndex = startIndex || 0;

      deps.every((dep, index) => {
        if (index >= startIndex) {

          //add at the beginning
          if (relatedDepName === true) {
            deps.splice(0, 0, taskName);
            return false;
          }
          //add at the end
          else if (relatedDepName === false) {
            if (index == (deps.length - 1)) {
              deps.splice(index + 1, 0, taskName);
              return false;
            }
          }
          else if (dep instanceof Array) {
            deps[index] = _this.addDepArray(deps[index], taskName, relatedDepName, isBefore);
          }
          else if (dep == relatedDepName) {
            deps.splice(index + (isBefore ? 0 : 1), 0, taskName);
            deps = _this.addDepArray(deps, taskName, relatedDepName, isBefore, index + 2);
            return false;
          }
          return true;
        }
      });
      return deps;
    }
  }
}

app.init();



//autoload core tasks
var tasksList = ['watch', 'js', 'styles', 'fonts', 'sprites', 'images', 'views', 'customDirs', 'browserSync', 'clean'];
var appData = { dirs: dirs, config: config, app: app, tasks: tasks, gulp: gulp, browserSync: browserSync, Injector: Injector };
tasksList.forEach((t) => {
  require(dirs.lib.tasks + t + '.js')(appData);
});


//task registry
taskReg = {
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
    // fn() {
    //   setTimeout(function() {
    //     browserSync.reload();
    //   }, 1000);

    //   return Promise.resolve();
    // },
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

// app.taskReg.removeTask('js');
// app.taskReg.addDep('nowaDep', 'build', 'js', true);
// console.log(taskReg.build.deps);
// process.exit();

//register tasks
for (let taskName in taskReg) {
  if (!taskReg.hasOwnProperty(taskName))
    continue;
  let taskData = taskReg[taskName],
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
          app.quitIfInvoked(taskName);
        }
      });
      return promise;
    });
  }
}

/* MAIN TASKS */
// gulp.task('default', ['watch']);


// gulp.task('start', function(cb) {
//   runSequence('build', 'watch', cb);
// });

// gulp.task('watch', function(cb) {
//   tasks.watch.run({ cb: cb });
// });

// gulp.task('build', function(cb) {
//   runSequence('clean', 'views', 'fonts', 'sprites', ['images', 'styles', 'js', 'custom-dirs'], function() {
//     //just tu ensure all assets are ready
//     setTimeout(function() {
//       app.quitIfInvoked('build', cb);
//       browserSync.reload();
//     }, 1000);
//   });
// });



/* STYLES */
// gulp.task('styles', function() {
//   return tasks.styles.run({});
// });

// gulp.task('fonts', function() {
//   return tasks.fonts.run({});
// });

// gulp.task('sprites', function() {
//   var promises = [];

//   config.sprites.items.forEach(function(itemInfo) {
//     promises.push(tasks.sprites.run({ itemInfo: itemInfo }));
//   });

//   return Promise.all(promises);
// });


// /* JS SCRIPTS */
// gulp.task('js:app', function() {
//   var promises = [];

//   var comps = tasks.js.getComps().getContent();
//   for (var compId in comps) {
//     if (!comps.hasOwnProperty(compId))
//       continue;
//     var comp = comps[compId];

//     promises.push(tasks.js.run({ compId: compId, isApp: true, taskNameBegin: '', taskNameEnd: ''}));
//   }

//   return Promise.all(promises);
// });

// gulp.task('js:vendor', function() {
//   var promises = [];

//   var comps = tasks.js.getComps().getContent();
//   for (var compId in comps) {
//     if (!comps.hasOwnProperty(compId))
//       continue;

//     promises.push(tasks.js.run({ compId: compId, isApp: false, taskNameBegin: compId, taskNameEnd: '' }));
//   }

//   return Promise.all(promises);
// });

// gulp.task('js', function(cb) {
//   return runSequence('js:vendor', 'js:app', cb);
// });


/* IMAGES */
// gulp.task('images', function() {
//   return tasks.images.run({});
// });



/* VIEWS */
/*gulp.task('views', function() {
  // if (dirs.src.views) {
    return tasks.views.run({});
  // }
  // else {
  //   return Promise.resolve();
  // }
});
*/


/* CUSTOM DIRS */
/*gulp.task('custom-dirs', function(cb) {
  return tasks.customDirs.run({});
});
*/


/* CLEAN DIST FOLDERS */
/*gulp.task('clean', function(cb) {
  //var wasLocked = app.quit.wasLocked();
  tasks.clean.run({}).then(function() {
    app.quitIfInvoked('clean', cb);
    //app.quit.finalize(wasLocked, cb);
  })
});
*/

/* BROWSER SYNC */
// gulp.task('browser-sync', function() {
//   return tasks.browserSync.run({});
// });
