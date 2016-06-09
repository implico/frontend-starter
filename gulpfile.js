/**
  Frontend-starter

  @author Bartosz Sak
  
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
    cleans and builds the app (with -p: optimized for production)

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

  //dummy workaround for not accepting empty globs by gulp.src
  sanitizeGlob(glob) {
    if ((glob instanceof Array) && (glob.length === 0)) {
      glob = ['_835e99fa880c36c1828e55361d228fab/*']; //non-existing dir
    }
    return glob;
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
        console.error('Frontend-starter error: task to remove not found (' + taskName + ')');
        process.exit(1);
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
var tasksList = ['watch', 'js', 'styles', 'fonts', 'sprites', 'images', 'views', 'customDirs', 'lint', 'browserSync', 'clean'];
var appData = { dirs, config, app, tasks, taskReg, gulp, browserSync, Injector };
tasksList.forEach((t) => {
  require(dirs.lib.tasks + t + '.js')(appData);
});

require('./gulpfile.tasks.js')(appData);
