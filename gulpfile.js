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
    extend       = require('extend'),
    gulp         = require('gulp'),
    plumber      = require('gulp-plumber'),
    rename       = require('gulp-rename'),
    batch        = require('gulp-batch'),
    concat       = require('gulp-concat'),
    changed      = require('gulp-changed'),
    jshint       = require('gulp-jshint'),
    uglify       = require('gulp-uglify'),
    imagemin     = require('gulp-imagemin'),
    minifyCss    = require('gulp-minify-css'),
    compass      = require('gulp-compass'),
    addsrc       = require('gulp-add-src'),
    browserSync  = require('browser-sync'),
    postcss      = require('gulp-postcss'),
    sourcemaps   = require('gulp-sourcemaps'),
    twig         = require('gulp-twig'),
    watch        = require('gulp-watch'),
    runSequence  = require('run-sequence'),
    mainBowerFiles = require('main-bower-files'),
    autoprefixer = require('autoprefixer'),
    merge2       = require('merge2'),
    bowerMain    = require('bower-main'),
    del          = require('del');


/*
    Main config, dirs
*/
var dirs = configMod.dirs,
    config = configMod.config;
    



/* MAIN TASKS */
gulp.task('default', ['dev']);

gulp.task('dev', function() {

  runSequence('clean', ['images', 'styles:dev', 'js:dev', 'views:dev', 'browser-sync']);

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
  })).on('unlink', path => {
    //TODO: handle images removal in dist dir
  });

  //views
  watch([dirs.src.views.main + '**/*'], batch(function (events, done) {
    gulp.start('views:dev', done);
  }));

});

gulp.task('prod', function() {
  runSequence('clean', ['images', 'styles:prod', 'js:prod', 'views:prod']);
});





var tasks = {
  styles: function(isDev) {

    var compassOptions = extend(true, config.sass.common, config.sass[isDev ? 'dev': 'prod']);

    var ret = gulp.src(dirs.src.styles + '*.scss')
      .pipe(plumber({
        errorHandler: function (error) {
          console.log(error.message);
          this.emit('end');
        }
      }))
      .pipe(compass(compassOptions))
      .pipe(postcss([ autoprefixer({ browsers: config.autoprefixer.browsers }) ]))
      .pipe(concat('style.css'))
      .pipe(gulp.dest(dirs.dist.styles));

    return ret;
  },

  js: function(isMain, isDev) {
    var ret;

    //get files
    if (isMain) {
      ret = gulp.src(dirs.src.js.mainGlob);
    }
    else {
      ret = gulp.src(mainBowerFiles()).pipe(addsrc(dirs.src.js.vendor + '**/*.js'));
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
    else {
      //init sourcemaps for prod
      ret = ret
        .pipe(sourcemaps.init({ loadMaps: false }));
    }

    //conacat files
    ret = ret
      .pipe(concat(isMain ? 'app.js' : 'vendor.js', { newLine:'\n;' }));

    if (!isDev) {
      //sourcemaps & minify for prod
      ret = ret
       .pipe(sourcemaps.write({ includeContent: false }))
       .pipe(uglify());
    }

    if (isMain) {
      //when main app, prepend vendor.js
      ret = ret
        .pipe(addsrc.prepend(dirs.dist.js + 'vendor.js'))
        .pipe(concat('app.js', { newLine:'\n;' }));
    }

    //save file
    ret = ret
      .pipe(gulp.dest(dirs.dist.js));


    return ret;
  },

  views: function(isDev) {
    var twigOptions = extend(true, config.twig.common, config.twig[isDev ? 'dev': 'prod']);

    return gulp.src(dirs.src.views.scripts + '**/*')
      .pipe(twig(twigOptions))
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
  return gulp.src(dirs.src.img + '**/*')
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
