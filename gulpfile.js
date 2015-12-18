/**
  API

  @author Archas, Bartosz Sak

  gulp
    default task, equals to gulp dev

  gulp clean
    cleans dist dir

  gulp dev
    run dev app with browsersync

  gulp prod
    prepare clean project and compile optimized production app without browsersync
*/



/* VARS */
var configMod    = require('./gulpfile.config'),

    autoprefixer = require('autoprefixer'),
    del          = require('del'),
    extend       = require('extend'),
    mainBowerFiles = require('main-bower-files'),
    merge2       = require('merge2'),
    runSequence  = require('run-sequence'),

    gulp         = require('gulp'),
    addsrc       = require('gulp-add-src'),
    batch        = require('gulp-batch'),
    browserSync  = require('browser-sync'),
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
    uglify       = require('gulp-uglify'),
    twig         = require('gulp-twig'),
    watch        = require('gulp-watch');


/*
    Main config, dirs
*/
var dirs = configMod.dirs,
    config = configMod.config;
    



/* MAIN TASKS */
gulp.task('default', ['dev']);

gulp.task('dev', function() {

  runSequence('clean', 'browser-sync', ['images', 'styles:dev', 'js:dev', 'views:dev']);

  //styles
  watch([dirs.vendor + '**/*.scss', dirs.vendor + '**/*.css', dirs.src.styles + '**/*.scss', dirs.src.styles + '**/*.css'], batch(function (events, done) {
    gulp.start('styles:dev', done);
  }));

  //fonts
  watch([dirs.src.fonts + '**/*'], batch(function (events, done) {
    gulp.start('fonts', done);
  }));

  //js - app    
  watch(dirs.src.js.mainGlob, batch(function (events, done) {
    gulp.start('js:dev:main', done);
  }));

  //js - vendor
  watch([dirs.vendor + '**/*.js', dirs.src.js.vendor + '**/*.js'], batch(function (events, done) {
    gulp.start('js:dev', done);
  }));
  
  //images
  watch([dirs.src.img + '**/*'], batch(function (events, done) {
    gulp.start('images', done);
  })).on('unlink', function(path) {
    //TODO: handle images removal in dist dir
  });

  //views
  watch([dirs.src.views.main + '**/*'], batch(function (events, done) {
    gulp.start('views:dev', done);
  }));

});

gulp.task('prod', function() {
  runSequence('clean', ['images', 'styles:prod', 'js:prod', 'views:prod']/*, 'browser-sync', function() { setTimeout(function() { browserSync.exit(); process.exit(); }, 4000); }*/);
});





var tasks = {
  styles: function(isDev) {

    var configStyles = extend(true, config.styles.common, config.styles[isDev ? 'dev': 'prod']);
    configStyles.sass.sourcemap = configStyles.sourcemaps;

    var ret = gulp.src(dirs.src.styles + '*.scss')
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
        .pipe(sourcemaps.write({ includeContent: false }));
    }

    ret = ret
      .pipe(concat('style.css'))
      .pipe(gulp.dest(dirs.dist.styles));

    return ret;
  },

  js: function(isMain, isDev) {
    var ret,
        configJs = extend(true, config.js.common, config.js[isDev ? 'dev': 'prod']);

    //get files
    if (isMain) {
      ret = gulp.src(dirs.src.js.mainGlob, { base: '.' });
    }
    else {
      var files = mainBowerFiles();
      files.push(dirs.src.js.vendor + '**/*.js');
      ret = gulp.src(files, { base: '.' });
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
      .pipe(concat(isMain ? 'app.js' : 'vendor.js', { newLine:'\n;' }));

    if (configJs.sourcemaps) {
      //write sourcemaps
      ret = ret
       .pipe(sourcemaps.write({ includeContent: true }))
    }

    if (configJs.minify) {
      //minify
      ret = ret
       .pipe(uglify());
    }

    if (isMain) {
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
  return gulp.src([dirs.src.img + '**/*', '!' + dirs.src.img + '**/*.tmp'])
    .pipe(changed(dirs.dist.img))
    .pipe(imagemin({ optimizationLevel: 0, progessive: true, interlaced: true }))
    .pipe(gulp.dest(dirs.dist.img));
});



gulp.task('views:dev', function() {
  return tasks.views(true)
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('views:prod', function() {
  return tasks.views(false);
});




/* --------------- UTILS --------------- */

/* CLEAN PUBLIC FOLDERS */
gulp.task('clean', function(cb) {

  var p = [
    del([dirs.dist.styles + '*', dirs.dist.js + '*', dirs.dist.img + '**/*', dirs.dist.views + '*.*'], { force: false }, function (err, paths) {
        console.log('Deleted files/folders:\n', paths.join('\n'));
    }),

    del(dirs.sassCache)
  ];

  return Promise.all(p);
});


/* BROWSER SYNC */
gulp.task('browser-sync', function() {
  browserSync({
    //proxy: 'localhost:63383',
    host: 'localhost',
    port: 80,
    open: 'external',
    //startPath: '/uk/',
    reloadOnRestart: true,
    server: {
      baseDir: dirs.dist.main
    }
  });
});
