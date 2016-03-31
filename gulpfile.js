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



//gett app root dir
var appDir;
if (!process.env.FS_BASE_DIR) {
  console.log('Warning: FS_BASE_DIR env variable not set. This module should not be called directly from the command line.');
  // process.exit();
  appDir = __dirname + '/';
}
else {
  appDir = process.env.FS_BASE_DIR + '/';
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
  watch([dirs.vendor + '**/*.scss', dirs.vendor + '**/*.css', dirs.src.styles.main + '**/*.scss', dirs.src.styles.main + '**/*.css'], batch(function (events, done) {
    gulp.start('styles:dev', done);
  })).on('error', function(err) {
    //console.error(err);
  });

  //fonts
  watch(dirs.src.fonts + '**/*', batch(function (events, done) {
    gulp.start('fonts', done);
  })).on('error', function(err) {
    //console.error(err);
  });

  //sprites
  config.sprites.items.forEach(function(itemInfo) {
    watch(itemInfo.imgSource + '**/*.*', batch(function (events, done) {
      tasks.sprites.run(true, itemInfo, done);
    })).on('error', function(err) {
      //console.error(err);
    });
  });


  var packages = tasks.js.getPackages(true).getContent();
  for (var packageId in packages) {
    if (!packages.hasOwnProperty(packageId))
      continue;
    var pkg = packages[packageId];
    
    //js - app
    (() => {
      var curPackageId = packageId;
      //console.log('Watching app', packageId, pkg.getGlob('app'));
      var globApp = pkg.getGlob('app', true);
      if (globApp.length) {
        watch(globApp, batch(function (events, done) {
          tasks.js.run(curPackageId, true, true, 'js:dev:main (' + curPackageId + ')', true, (tasks) => {
            browserSync.reload();
            done()
          });
        })).on('error', function(err) {
          console.error(err);
        });
      }

      //console.log('Watching vendor', curPackageId, pkg.getGlob('bower').concat(pkg.getGlob('vendor')));
      //js - vendor
      var globVendor = pkg.getGlob('bower', true).concat(pkg.getGlob('vendor', true));
      if (globVendor.length) {
        watch(globVendor, batch(function (events, done) {
          tasks.js.run(curPackageId, false, true, 'js:dev (' + curPackageId + ')', false, (tasks) => {
            tasks.js.run(curPackageId, true, true, false, 'js:dev (' + curPackageId + ')', (tasks) => {
              browserSync.reload();
              done()
            });
          });
        })).on('error', function(err) {
          //console.error(err);
        });
      }
    })();
  }
  
  //images
  watch(dirs.src.img + '**/*', batch(function (events, done) {
    gulp.start('images:dev', done);
  })).on('unlink', function(path) {
    //TODO: handle images removal in dist dir
  }).on('error', function(err) {
    //console.error(err);
  });

  //views
  if (dirs.src.views.main) {
    watch([dirs.src.views.main + '**/*'], batch(function (events, done) {
      gulp.start('views:dev', done);
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
        tasks.customDirs.run([dirInfo], true, done);
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
    //just tu ensure all assets are ready
    setTimeout(function() {
      if (config.system.isInvokedFromTerminal) {
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
    //just tu ensure all assets are ready
    setTimeout(function() {
      if (config.system.isInvokedFromTerminal) {
        process.exit();
      }
      else {
        browserSync.reload();
      }
    }, 1000);

    cb();
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
  require(dirs.tasks + t + '.task.js')(dirs, config, app, tasks);
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
gulp.task('js:dev:main', function() {
  var promises = [];

  var packages = tasks.js.getPackages(true).getContent();
  for (var packageId in packages) {
    if (!packages.hasOwnProperty(packageId))
      continue;
    var pkg = packages[packageId];

    promises.push(new Promise((resolve, reject) => {
      tasks.js.run(packageId, true, true, '', '', (tasks) => {
        browserSync.reload();
        resolve();
      });
    }));
  }

  return Promise.all(promises);
});

gulp.task('js:dev:vendor', function() {
  var promises = [];

  var packages = tasks.js.getPackages(true).getContent();
  for (var packageId in packages) {
    if (!packages.hasOwnProperty(packageId))
      continue;
    var pkg = packages[packageId];

    promises.push(new Promise((resolve, reject) => {
      tasks.js.run(packageId, false, true, packageId, '', (tasks) => {
        browserSync.reload();
        resolve();
      });
    }));
  }

  return Promise.all(promises);
});

gulp.task('js:dev', function() {
  return runSequence('js:dev:vendor', 'js:dev:main');
});

gulp.task('js:prod', function() {

  var promises = [];

  var packages = tasks.js.getPackages(false).getContent();
  for (var packageId in packages) {
    if (!packages.hasOwnProperty(packageId))
      continue;
    var pkg = packages[packageId];

    promises.push(new Promise((resolve, reject) => {
      var curPackageId = packageId;
      tasks.js.run(curPackageId, false, false, '', '', (tasks) => {
        tasks.js.run(curPackageId, true, false, '', '', (tasks) => {
          resolve();
        });
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
    return tasks.views.run(true)
      .pipe(browserSync.stream());
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
gulp.task('custom-dirs:dev', function() {
  return tasks.customDirs.run(dirs.custom, true);
});

gulp.task('custom-dirs:prod', function() {
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
