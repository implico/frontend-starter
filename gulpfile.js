/**
  Frontend-starter

  @author Bartosz Sak, Archas
  
  https://github.com/implico/frontend-starter
  
  The MIT License (MIT)
  
  
  *******************
  API

  gulp
    default task, equals to gulp dev:watch

  gulp clean
    cleans dist dir

  gulp dev
    runs dev:build and dev:watch

  gulp dev:build
    cleans and compiles/builds dev version

  gulp dev:watch
    runs dev watch with browsersync

  gulp prod
    prepare clean project and compile/build optimized production app without browsersync

  gulp prod:preview
    same as prod, additionally launches browsersync

*/
 var path = require('path');


//gett app root dir
var appDir;
if (!process.env.FS_BASE_DIR) {
  console.log('Frontend-starter warning: FS_BASE_DIR env variable not set. This module should not be called directly from the command line.');
  // process.exit();
  appDir = path.normalize(__dirname + '/../');
}
else {
  appDir = path.normalize(process.env.FS_BASE_DIR + '/');
}
console.log('Frontend-starter: Project root dir set to ' + appDir);


/* VARS */
var dirs         = require('./gulpfile.dirs')(appDir),
    config       = require('./gulpfile.config')(dirs),

    browserSync  = require('browser-sync'),
    merge        = require('merge-stream'),
    runSequence  = require('run-sequence'),

    gulp         = require('gulp'),
    debug        = require('gulp-debug'),
    batch        = require('gulp-batch'),
    watch        = require('gulp-watch');


//terminate Browsersync when the main process sends closing string (or the data is not a string)
process.stdin.on('data', function(data) {
  if ((!data.indexOf) || (data.indexOf('FS_CLOSE') >= 0)) {
    browserSync.exit();
    process.exit();
  }
});



var app = {

  browserSync: null,
    
  init: function() {
    this.browserSync = browserSync;
  },

  reload: function(cb) {
    var _this = this;
    return function() {
      _this.browserSync.reload();
      if (cb)
        cb();
    }
  }
}

app.init();



/* MAIN TASKS */
gulp.task('default', ['dev:watch']);


gulp.task('dev', function(cb) {
  runSequence('dev:build', 'dev:watch', cb);
});

gulp.task('dev:watch', function(cb) {

  //styles
  if (dirs.src.styles.main) {
    watch([dirs.vendor + '**/*.scss', dirs.vendor + '**/*.css', dirs.src.styles.main + '**/*.scss', dirs.src.styles.main + '**/*.css'], batch(function (events, done) {
      gulp.start('styles:dev', done);
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
      tasks.sprites.run(true, itemInfo, app.reload(done));
    })).on('error', function(err) {
      //console.error(err);
    });
  });


  var comps = tasks.js.getComps(true).getContent();
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
          tasks.js.run(curCompId, true, true, 'js:dev:app (' + curCompId + ')', true, done);
        })).on('error', function(err) {
          //console.error(err);
        });
      }

      //console.log('Watching vendor', curCompId, comp.getGlob('bower', true).concat(comp.getGlob('vendor', true)));
      //js - vendor
      var globVendor = comp.getGlob('bower', true).concat(comp.getGlob('vendor', true));
      if (globVendor.length) {
        watch(globVendor, batch(function (events, done) {
          tasks.js.run(curCompId, false, true, 'js:dev (' + curCompId + ')', false, (tasks) => {
            tasks.js.run(curCompId, true, true, false, 'js:dev (' + curCompId + ')', done);
          });
        })).on('error', function(err) {
          //console.error(err);
        });
      }
    })();
  }
  
  //images
  if (dirs.src.img) {
    watch(dirs.src.img + '**/*', batch(function (events, done) {
      gulp.start('images:dev', app.reload(done));
    })).on('unlink', function(path) {
      //TODO: handle images removal in dist dir
    }).on('error', function(err) {
      //console.error(err);
    });
  }

  //views
  if (dirs.src.views.main) {
    watch([dirs.src.views.main + '**/*'], batch(function (events, done) {
      gulp.start('views:dev', app.reload(done));
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
      watch(dirInfo.from, batch(function (events, done) {
        tasks.customDirs.run([dirInfo], true, app.reload(done));
      })).on('error', function(err) {
        //console.error(err);
      });
    }
  }

  tasks.browserSync.run(true, process.argv && (process.argv.indexOf('-r') >= 0)).then(() => {
    cb();
  });
});

gulp.task('dev:build', function(cb) {
  runSequence('clean:dev', 'views:dev', 'fonts', 'sprites:dev', ['images:dev', 'styles:dev', 'js:dev', 'custom-dirs:dev'], function() {
    if (config.system.isInvokedByAction) {
      cb();
    }
    //just tu ensure all assets are ready
    setTimeout(function() {
      if (config.system.isInvokedByAction) {
        process.exit();
      }
      else {
        browserSync.reload();
        cb();
      }
    }, 1000);
  });
});

gulp.task('prod', function(cb) {
  runSequence('clean:prod', 'views:prod', 'fonts', 'sprites:prod', ['images:prod', 'styles:prod', 'js:prod', 'custom-dirs:prod'], function() {
    if (config.system.isInvokedByAction) {
      cb();
    }
    //just tu ensure all assets are ready
    setTimeout(function() {
      if (config.system.isInvokedByAction) {
        process.exit();
      }
      else {
        browserSync.reload();
        cb();
      }
    }, 1000);
  });
});

gulp.task('prod:preview', ['prod'], function(cb) {
  runSequence('browser-sync:prod');
});



//tasks container
var tasks = {}

//autoload tasks
var tasksList = ['js', 'styles', 'fonts', 'sprites', 'images', 'views', 'customDirs', 'browserSync', 'clean'];
tasksList.forEach((t) => {
  require(dirs.tasks + t + '.js')(dirs, config, app, tasks);
})



/* STYLES */
gulp.task('styles:dev', function() {
  return tasks.styles.run(true)
    .pipe(browserSync.stream());
});

gulp.task('styles:prod', function() {
  return tasks.styles.run(false);
});

gulp.task('fonts', function() {
  return tasks.fonts.run();
});

gulp.task('sprites:dev', function() {
  var ret = [];

  config.sprites.items.forEach(function(itemInfo) {
    ret.push(tasks.sprites.run(true, itemInfo));
  });

  return merge.apply(null, ret);
});

gulp.task('sprites:prod', function() {
  var ret = [];

  config.sprites.items.forEach(function(itemInfo) {
    ret.push(tasks.sprites.run(false, itemInfo));
  });

  return merge.apply(null, ret);
});



/* JS SCRIPTS */
gulp.task('js:dev:app', function() {
  var promises = [];

  var comps = tasks.js.getComps(true).getContent();
  for (var compId in comps) {
    if (!comps.hasOwnProperty(compId))
      continue;
    var comp = comps[compId];

    promises.push(new Promise((resolve, reject) => {
      tasks.js.run(compId, true, true, '', '', resolve);
    }));
  }

  return Promise.all(promises);
});

gulp.task('js:dev:vendor', function() {
  var promises = [];

  var comps = tasks.js.getComps(true).getContent();
  for (var compId in comps) {
    if (!comps.hasOwnProperty(compId))
      continue;

    promises.push(new Promise((resolve, reject) => {
      tasks.js.run(compId, false, true, compId, '', resolve);
    }));
  }

  return Promise.all(promises);
});

gulp.task('js:dev', function(cb) {
  return runSequence('js:dev:vendor', 'js:dev:app', cb);
});

gulp.task('js:prod', function() {

  var promises = [];

  var comps = tasks.js.getComps(false).getContent();
  for (var compId in comps) {
    if (!comps.hasOwnProperty(compId))
      continue;

    promises.push(new Promise((resolve, reject) => {
      var curCompId = compId;
      tasks.js.run(curCompId, false, false, '', '', (tasks) => {
        tasks.js.run(curCompId, true, false, '', '', resolve);
      });
    }));
  }

  return Promise.all(promises);
});



/* IMAGES */
gulp.task('images:dev', function() {
  return tasks.images.run(true);
});

gulp.task('images:prod', function() {
  return tasks.images.run(false);
});



/* VIEWS */
gulp.task('views:dev', function() {
  if (dirs.src.views.main) {
    return tasks.views.run(true);
  }
  else {
    return Promise.resolve();
  }
});

gulp.task('views:prod', function() {
  if (dirs.src.views.main) {
    return tasks.views.run(false);
  }
  else {
    return Promise.resolve();
  }
});



/* CUSTOM DIRS */
gulp.task('custom-dirs:dev', function(cb) {
  return tasks.customDirs.run(dirs.custom, true);
});

gulp.task('custom-dirs:prod', function(cb) {
  return tasks.customDirs.run(dirs.custom, false);
});



/* CLEAN PUBLIC FOLDERS */
gulp.task('clean', ['clean:dev'], function(cb) {
  cb();
});

gulp.task('clean:dev', function(cb) {
  return tasks.clean.run(true);
});

gulp.task('clean:prod', function(cb) {
  return tasks.clean.run();
});



/* BROWSER SYNC */
gulp.task('browser-sync:dev', function() {
  return tasks.browserSync.run(true);
});

gulp.task('browser-sync:prod', function() {
  return tasks.browserSync.run(false);
});
