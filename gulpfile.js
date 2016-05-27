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

  gulp build [-p]
    cleans and compiles/builds the app (with -p: optimized for production)

  gulp watch
    runs watch with Browsersync

*/
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
    debug        = require('gulp-debug'),
    batch        = require('gulp-batch'),
    watch        = require('gulp-watch');


//terminate Browsersync when the main process sends closing string (or the data is not a string)
process.stdin.on('data', function(data) {
  if ((!data.indexOf) || (data.indexOf('_FRS_CLOSE_') >= 0)) {
    browserSync.exit();
    process.exit();
  }
});



var app = {

  browserSync: null,
    
  init: function() {
    this.browserSync = browserSync;
  },

  //aux: reloads Browsersync and calls the callback
  reload: function(cb) {
    var _this = this;
    return function() {
      _this.browserSync.reload();
      if (cb)
        cb();
    }
  },

  //used for main tasks to quit after it's done, unless a higher level task locked it
  quit: {
    isLocked: null,

    //returns true if quitting was locked by a higher level task
    wasLocked: function() {
      var ret = this.isLocked !== null;
      if (!ret)
        this.isLocked = true;
      return ret;
    },

    //exits if a task was not locked before
    finalize: function(wasLocked, cb) {
      if (cb)
        cb();
      if (!wasLocked)
        process.exit();
    }
  }
}

app.init();



/* MAIN TASKS */
gulp.task('default', ['watch']);


gulp.task('start', function(cb) {
  app.quit.wasLocked();
  runSequence('build', 'watch', cb);
});

gulp.task('watch', function(cb) {
  app.quit.wasLocked();
  //styles
  if (dirs.src.styles.main) {
    //exclude sprite stylesheets
    var watchGlob = [dirs.vendor + '**/*.scss', dirs.vendor + '**/*.css', dirs.src.styles.main + '**/*.scss', dirs.src.styles.main + '**/*.css'];
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
      tasks.sprites.run({ itemInfo: itemInfo, cb: app.reload(done) });
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
          tasks.js.run({ compId: curCompId, isApp: true, taskNameBegin: 'js:app (' + curCompId + ')', taskNameEnd: true, cb: done });
        })).on('error', function(err) {
          //console.error(err);
        });
      }

      //console.log('Watching vendor', curCompId, comp.getGlob('bower', true).concat(comp.getGlob('vendor', true)));
      //js - vendor
      var globVendor = comp.getGlob('bower', true).concat(comp.getGlob('vendor', true));
      if (globVendor.length) {
        watch(globVendor, batch(function (events, done) {
          tasks.js.run({ compId: curCompId, isApp: false, taskNameBegin: 'js (' + curCompId + ')', taskNameEnd: false, cb: (tasks) => {
            tasks.js.run({ compId: curCompId, isApp: true, taskNameBegin: false, taskNameEnd: 'js (' + curCompId + ')', cb: done });
          } });
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
      //console.error(err);
    });
  }

  //custom dirs
  for (var dirName in dirs.custom) {
    if (!dirs.custom.hasOwnProperty(dirName))
      continue;

    var dirInfo = dirs.custom[dirName];

    if (dirInfo.dev) {
      ((dirInfo) => {
        watch(dirInfo.from, batch(function (events, done) {
          tasks.customDirs.run({ dirInfos: [dirInfo], cb: app.reload(done) });
        })).on('error', function(err) {
          //console.error(err);
        });
      })(dirInfo);
    }
  }

  tasks.browserSync.run({ blockOpen: config.main.isRestart }).then(() => {
    cb();
  });
});

gulp.task('build', function(cb) {
  var wasLocked = app.quit.wasLocked();
  runSequence('clean', 'views', 'fonts', 'sprites', ['images', 'styles', 'js', 'custom-dirs'], function() {
    //just tu ensure all assets are ready
    setTimeout(function() {
      app.quit.finalize(wasLocked, cb);
      browserSync.reload();
    }, 1000);
  });
});



//tasks container
var tasks = {}

//autoload tasks
var tasksList = ['js', 'styles', 'fonts', 'sprites', 'images', 'views', 'customDirs', 'browserSync', 'clean'];
tasksList.forEach((t) => {
  require(dirs.lib.tasks + t + '.js')({ dirs: dirs, config: config, app: app, tasks: tasks, Injector: Injector });
})



/* STYLES */
gulp.task('styles', function() {
  return tasks.styles.run({})
    .pipe(browserSync.stream());
});

gulp.task('fonts', function() {
  return tasks.fonts.run({});
});

gulp.task('sprites', function() {
  var ret = [];

  config.sprites.items.forEach(function(itemInfo) {
    ret.push(tasks.sprites.run({ itemInfo: itemInfo, cb: null }));
  });

  return merge.apply(null, ret);
});


/* JS SCRIPTS */
gulp.task('js:app', function() {
  var promises = [];

  var comps = tasks.js.getComps().getContent();
  for (var compId in comps) {
    if (!comps.hasOwnProperty(compId))
      continue;
    var comp = comps[compId];

    promises.push(new Promise((resolve, reject) => {
      tasks.js.run({ compId: compId, isApp: true, taskNameBegin: '', taskNameEnd: '', cb: resolve });
    }));
  }

  return Promise.all(promises);
});

gulp.task('js:vendor', function() {
  var promises = [];

  var comps = tasks.js.getComps().getContent();
  for (var compId in comps) {
    if (!comps.hasOwnProperty(compId))
      continue;

    promises.push(new Promise((resolve, reject) => {
      tasks.js.run({ compId: compId, isApp: false, taskNameBegin: compId, taskNameEnd: '', cb: resolve });
    }));
  }

  return Promise.all(promises);
});

gulp.task('js', function(cb) {
  return runSequence('js:vendor', 'js:app', cb);
});


/* IMAGES */
gulp.task('images', function() {
  return tasks.images.run({});
});



/* VIEWS */
gulp.task('views', function() {
  if (dirs.src.views) {
    return tasks.views.run({});
  }
  else {
    return Promise.resolve();
  }
});



/* CUSTOM DIRS */
gulp.task('custom-dirs', function(cb) {
  return tasks.customDirs.run({});
});



/* CLEAN DIST FOLDERS */
gulp.task('clean', function(cb) {
  var wasLocked = app.quit.wasLocked();
  tasks.clean.run({}).then(function() {
    app.quit.finalize(wasLocked, cb);
  })
});


/* BROWSER SYNC */
gulp.task('browser-sync', function() {
  return tasks.browserSync.run({});
});
