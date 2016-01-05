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



/* MAIN TASKS */
gulp.task('default', ['dev']);

gulp.task('dev', function(cb) {

  runSequence('clean', 'fonts', 'sprites', ['images', 'styles:dev', 'js:dev', 'views:dev'], 'browser-sync', cb);

  //styles
  watch([dirs.vendor + '**/*.scss', dirs.vendor + '**/*.css', dirs.src.styles.main + '**/*.scss', dirs.src.styles.main + '**/*.css'], batch(function (events, done) {
    gulp.start('styles:dev', done);
  }));

  //fonts
  watch([dirs.src.fonts + '**/*'], batch(function (events, done) {
    gulp.start('fonts', done);
  }));

  //sprites
  config.sprites.items.forEach(function(itemInfo) {
    watch([itemInfo.imgSource + '**/*.*', '!' + itemInfo.imgSource + '**/*.tmp'], batch(function (events, done) {
      tasks.sprites(itemInfo, done);
    }));
  });


  //js - app
  watch(dirs.src.js.appGlob, batch(function (events, done) {
    gulp.start('js:dev:main', done);
  }));

  //js - vendor
  watch([dirs.vendor + '**/*.js', dirs.src.js.vendor + '**/*.js'], batch(function (events, done) {
    gulp.start('js:dev', done);
  }));
  
  //images
  watch(imagesDirs, batch(function (events, done) {
    gulp.start('images', done);
  })).on('unlink', function(path) {
    //TODO: handle images removal in dist dir
  });

  //views
  watch([dirs.src.views.main + '**/*'], batch(function (events, done) {
    gulp.start('views:dev', done);
  }));

});

gulp.task('prod', function(cb) {
  runSequence('clean', 'fonts', 'sprites', ['images', 'styles:prod', 'js:prod', 'views:prod'], cb/*, 'browser-sync', function() { setTimeout(function() { browserSync.exit(); process.exit(); }, 4000); }*/);
});

gulp.task('prod:preview', ['prod'], function(cb) {
  runSequence('browser-sync', cb);
});





var tasks = {
  styles: function(isDev) {

    var configStyles = extend(true, config.styles.common, config.styles[isDev ? 'dev': 'prod']);
    configStyles.sass.sourcemap = configStyles.sourcemaps;

    var ret = gulp.src(dirs.src.styles.main + '*.scss')
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

  sprites: function(itemInfo, done) {

    if (done)
      console.log('Starting \'sprites\'...');

    var spriteData = gulp.src([itemInfo.imgSource + '**/*', '!' + itemInfo.imgSource + '**/*.tmp']).pipe(spritesmith(itemInfo.options));

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
      ret = gulp.src(dirs.src.js.appGlob, { base: '.' });
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
      .pipe(concat(isApp ? 'app.js' : 'vendor.js', { newLine:'\n;' }));

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

  var delFiles = del.sync([dirs.dist.styles + '**/*', dirs.src.styles.sprites + '**/*', dirs.dist.js + '**/*', dirs.dist.img + '**/*', dirs.dist.views + '*.*'], { force: true });
  del.sync(dirs.sassCache);

  console.log('Deleted files/folders:\n', delFiles.join('\n'));

  return Promise.resolve();

});


/* BROWSER SYNC */
gulp.task('browser-sync', function() {
  browserSync(config.browserSync.options);
});
