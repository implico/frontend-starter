/**
  Frontend-starter API

  @author Bartosz Sak, Archas

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



/* VARS */
var configMod    = require('./gulpfile.config'),

    autoprefixer = require('autoprefixer'),
    browserSync  = require('browser-sync'),
    buffer       = require('vinyl-buffer'),
    del          = require('del'),
    extend       = require('extend'),
    mainBowerFiles = require('main-bower-files'),
    merge        = require('merge-stream'),
    runSequence  = require('run-sequence'),

    gulp         = require('gulp'),
    addsrc       = require('gulp-add-src'),
    debug        = require('gulp-debug'),
    batch        = require('gulp-batch'),
    changed      = require('gulp-changed'),
    compass      = require('gulp-compass'),
    concat       = require('gulp-concat'),
    imagemin     = require('gulp-imagemin'),
    jshint       = require('gulp-jshint'),
    minifyCss    = require('gulp-minify-css'),
    plumber      = require('gulp-plumber'),
    postcss      = require('gulp-postcss'),
    rename       = require('gulp-rename'),
    sourcemaps   = require('gulp-sourcemaps'),
    spritesmith  = require('gulp.spritesmith'),
    uglify       = require('gulp-uglify'),
    twig         = require('gulp-twig'),
    watch        = require('gulp-watch');



/*
    Main config, dirs
*/
var dirs = configMod.dirs,
    config = configMod.config;

//image dirs    
var imagesDirs = [dirs.src.img + '**/*', '!' + dirs.src.img + '**/*.tmp'];
//exclude sprite dirs
config.sprites.items.forEach(function(itemInfo) {
  imagesDirs.push('!' + itemInfo.imgSource);
  imagesDirs.push('!' + itemInfo.imgSource + '**');
});


//adds config glob
function addConfigGlob(glob) {
  if (!(glob instanceof Array)) {
    glob = [glob];
  }
  return glob.concat(config.global.globAdd);
}



/* MAIN TASKS */
gulp.task('default', ['dev:watch']);


gulp.task('dev', function(cb) {
  runSequence('dev:build', 'dev:watch', cb);
});

gulp.task('dev:watch', function(cb) {

  runSequence('browser-sync:dev', cb);

  //styles
  watch(addConfigGlob([dirs.vendor + '**/*.scss', dirs.vendor + '**/*.css', dirs.src.styles.main + '**/*.scss', dirs.src.styles.main + '**/*.css']), batch(function (events, done) {
    gulp.start('styles:dev', done);
  }));

  //fonts
  watch([dirs.src.fonts + '**/*'], batch(function (events, done) {
    gulp.start('fonts', done);
  }));

  //sprites
  config.sprites.items.forEach(function(itemInfo) {
    watch(addConfigGlob([itemInfo.imgSource + '**/*.*', '!' + itemInfo.imgSource + '**/*.tmp']), batch(function (events, done) {
      tasks.sprites(itemInfo, done);
    }));
  });


  //js - app
  watch(addConfigGlob(dirs.src.js.appGlob), batch(function (events, done) {
    gulp.start('js:dev:main', done);
  }));

  //js - vendor
  watch(addConfigGlob([dirs.vendor + '**/*.js', dirs.src.js.vendor + '**/*.js']), batch(function (events, done) {
    gulp.start('js:dev', done);
  }));
  
  //images
  watch(addConfigGlob(imagesDirs), batch(function (events, done) {
    gulp.start('images', done);
  })).on('unlink', function(path) {
    //TODO: handle images removal in dist dir
  });

  //views
  watch([dirs.src.views.main + '**/*'], batch(function (events, done) {
    gulp.start('views:dev', done);
  }));

  //custom dirs
  dirs.custom.forEach(function(dirInfo) {
    if (dirInfo.dev) {
      watch(dirInfo.from, batch(function (events, done) {
        tasks.customDirs([dirInfo], true, done);
      }));
    }
  });

});

gulp.task('dev:build', function(cb) {
  runSequence('clean', 'fonts', 'sprites', ['images', 'styles:dev', 'js:dev', 'views:dev', 'custom-dirs:dev'], cb);
});

gulp.task('prod', function(cb) {
  runSequence('clean', 'fonts', 'sprites', ['images', 'styles:prod', 'js:prod', 'views:prod', 'custom-dirs:prod'], cb);
});

gulp.task('prod:preview', ['prod'], function(cb) {
  runSequence('browser-sync:prod');
});





var tasks = {
  styles: function(isDev) {

    var configStyles = extend(true, config.styles.common, config.styles[isDev ? 'dev': 'prod']);
    configStyles.sass.sourcemap = configStyles.sourcemaps;

    var ret = gulp.src(addConfigGlob(dirs.src.styles.main + '*.scss'))
      .pipe(plumber({
        errorHandler: function (error) {
          console.log(error.message);
          this.emit('end');
        }
      }))
      .pipe(compass(configStyles.sass));

    if (configStyles.sourcemaps) {
      ret = ret
        .pipe(sourcemaps.init({ loadMaps: true }));
    }

    ret = ret
      .pipe(postcss([ autoprefixer({ browsers: configStyles.autoprefixer.browsers }) ]));

    if (configStyles.sourcemaps) {
      ret = ret
        .pipe(sourcemaps.write({ includeContent: false, sourceRoot: configStyles.sourcemapsRoot }));
    }

    ret = ret
      .pipe(gulp.dest(dirs.dist.styles));

    return ret;
  },

  sprites: function(itemInfo, done) {

    if (done)
      console.log('Starting \'sprites\'...');

    var spriteData = gulp.src(addConfigGlob(itemInfo.imgSource + '**/*')).pipe(spritesmith(itemInfo.options));

    var imgStream = spriteData.img
      .pipe(buffer())
      .pipe(imagemin(config.images.imagemin))
      .pipe(gulp.dest(itemInfo.imgDest));

    var cssStream = spriteData.css
        .pipe(gulp.dest(dirs.src.styles.sprites));

    return merge(imgStream, cssStream).on('finish', function() {
      if (done) {
        done();
        console.log('Finished \'sprites\'');
      }
      browserSync.reload();
    });

  },

  js: function(isApp, isDev) {
    var ret,
        configJs = extend(true, config.js.common, config.js[isDev ? 'dev': 'prod']);

    //get files
    if (isApp) {
      ret = gulp.src(addConfigGlob(dirs.src.js.appGlob), { base: dirs.src.main });
    }
    else {
      var files = mainBowerFiles();
      files.push(dirs.src.js.vendor + '**/*.js');
      ret = gulp.src(addConfigGlob(files), { base: dirs.src.main });
    }

    //plumber
    ret = ret
      .pipe(plumber({
        errorHandler: function (error) {
          console.log(error.message);
          this.emit('end');
        }
      }));

    if (isDev) {
      //jshint for dev
      ret = ret
        .pipe(jshint())
    }

    if (configJs.sourcemaps) {
      //init sourcemaps
      ret = ret
        .pipe(sourcemaps.init({ loadMaps: false }));
    }

    //concat files
    ret = ret
      .pipe(concat(isApp ? 'app.js' : 'vendor.js', { newLine:'\n;' }));

    if (configJs.sourcemaps) {
      //write sourcemaps
      ret = ret
       .pipe(sourcemaps.write({ includeContent: false, sourceRoot: configJs.sourcemapsRoot }))
    }

    if (configJs.minify) {
      //minify
      ret = ret
       .pipe(uglify());
    }

    if (isApp && configJs.concatAppVendor) {
      //when main app, prepend vendor.js
      ret = ret
        .pipe(addsrc.prepend(dirs.dist.js + 'vendor.js'));

      if (configJs.sourcemaps) {
        ret = ret
          .pipe(sourcemaps.init({ loadMaps: true }));
      }

      ret = ret
        .pipe(concat('app.js', { newLine:'\n;' }));

      if (configJs.sourcemaps) {
        ret = ret
          .pipe(sourcemaps.write({ includeContent: false }));
      }
    }

    //save the file
    ret = ret
      .pipe(gulp.dest(dirs.dist.js));


    return ret;
  },

  views: function(isDev) {
    var configViews = extend(true, config.views.common, config.views[isDev ? 'dev': 'prod']);

    return gulp.src(dirs.src.views.scripts + '**/*')
      .pipe(twig(configViews.twig))
      .pipe(gulp.dest(dirs.dist.views));
  },

  customDirs: function(dirInfos, isDev, done) {

    var streams = [];

    if (done)
      console.log('Starting \'custom dirs\'...');

    dirInfos.forEach(function(dirInfo) {
      if (!isDev || dirInfo.dev) {
        console.log('jest');
        var stream = gulp.src(dirInfo.from)
          .pipe(changed(dirInfo.from))
          .pipe(gulp.dest(dirInfo.to));

        streams.push(stream);
      }
    });

    if (streams.length) {
      return merge.apply(null, streams).on('finish', function() {
        if (done) {
          done();
          console.log('Finished \'custom dirs\'');
        }
      });
    }
    else {
      return Promise.resolve();
    }
  },

  browserSync: function(isDev) {

    var configBS = extend(true, config.browserSync.common, config.browserSync[isDev ? 'dev': 'prod']);

    if (configBS.enable) {

      var cb;

      if (configBS.exitTimeout) {
        cb = function() {
          setTimeout(function() {
            process.exit();
          }, configBS.exitTimeout);
        }
      }

      var pars = [configBS.options];
      if (cb) {
        pars.push(cb);
      }

      browserSync.apply(null, pars);
    }
  }
}



/* STYLES */
gulp.task('styles:dev', function() {
  return tasks.styles(true)
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('styles:prod', function() {
  return tasks.styles(false);
});

gulp.task('fonts', function() {

  return gulp.src(dirs.src.fonts + '**/*')
    .pipe(changed(dirs.dist.fonts))
    .pipe(gulp.dest(dirs.dist.fonts));
});

gulp.task('sprites', function() {
  var ret = null;

  config.sprites.items.forEach(function(itemInfo) {
    ret = tasks.sprites(itemInfo);
  });

  return ret;
});



/* JS SCRIPTS */
gulp.task('js:dev:main', function() {
  return tasks.js(true, true)
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('js:dev:vendor', function() {
  return tasks.js(false, true)
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('js:dev', function() {
  runSequence('js:dev:vendor', 'js:dev:main');
});

gulp.task('js:prod', function() {

  var ret = tasks.js(false, false);

  ret.on('end', function() {
    tasks.js(true, false).on('end', function() {
      del(dirs.dist.js + 'vendor.js');
    });
  });

  return ret;

});



/* IMAGES */
gulp.task('images', function() {

  return gulp.src(imagesDirs)
    .pipe(changed(dirs.dist.img))
    //.pipe(debug())
    .pipe(imagemin(config.images.imagemin))
    .pipe(gulp.dest(dirs.dist.img));
});



/* VIEWS */
gulp.task('views:dev', function() {
  return tasks.views(true)
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('views:prod', function() {
  return tasks.views(false);
});



/* CUSTOM DIRS */
gulp.task('custom-dirs:dev', function() {
  return tasks.customDirs(dirs.custom, true);
});

gulp.task('custom-dirs:prod', function() {
  return tasks.customDirs(dirs.custom, false);
});



/* CLEAN PUBLIC FOLDERS */
gulp.task('clean', function(cb) {

  
  /*var dblStar = '**';
  var delDirs = [dirs.dist.styles + dblStar + '/*', dirs.src.styles.sprites + dblStar + '/*', dirs.dist.js + dblStar + '/*', dirs.dist.img + dblStar + '/*', dirs.dist.views + '*.*'];
  dirs.custom.forEach(function(dirInfo) {
    delDirs.push(dirInfo.to + dblStar + '/*');
  });

  var delFiles = del.sync(delDirs, { force: true });*/
  del.sync(dirs.dist.main);

  del.sync(dirs.sassCache);

  //console.log('Deleted files/folders:\n', delFiles.join('\n'));

  return Promise.resolve();

});



/* BROWSER SYNC */
gulp.task('browser-sync:dev', function() {
  tasks.browserSync(true);
});

gulp.task('browser-sync:prod', function() {
  tasks.browserSync(false);
});
