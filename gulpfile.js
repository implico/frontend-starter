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
if (!process.env.FS_BASE_DIR) {
  console.error('Error: fs_base env variable not set. This module should not be called directly from the command line.');
  process.exit();
}
var appDir = process.env.FS_BASE_DIR + '/';


/* VARS */
var dirs         = require('./gulpfile.dirs')(appDir),
    config       = require('./gulpfile.config')(dirs),

    autoprefixer = require('autoprefixer'),
    browserSync  = require('browser-sync'),
    buffer       = require('vinyl-buffer'),
    del          = require('del'),
    extend       = require('extend'),
    fs           = require('fs');
    mainBowerFiles = require('main-bower-files'),
    merge        = require('merge-stream'),
    path         = require('path');
    runSequence  = require('run-sequence'),

    gulp         = require('gulp'),
    addsrc       = require('gulp-add-src'),
    debug        = require('gulp-debug'),
    batch        = require('gulp-batch'),
    changed      = require('gulp-changed'),
    concat       = require('gulp-concat'),
    filter       = require('gulp-filter'),
    imagemin     = require('gulp-imagemin'),
    jshint       = require('gulp-jshint'),
    minifyCss    = require('gulp-minify-css'),
    plumber      = require('gulp-plumber'),
    postcss      = require('gulp-postcss'),
    rename       = require('gulp-rename'),
    sass         = require('gulp-sass'),
    sourcemaps   = require('gulp-sourcemaps'),
    spritesmith  = require('gulp.spritesmith'),
    uglify       = require('gulp-uglify'),
    swig         = require('gulp-swig'),
    watch        = require('gulp-watch');




var APP = {
    
  init: function() {
    this.dirs.init();
  },
  
  dirs: {
    init: function() {
      this.img();
    },
    
    img: function() {
      //exclude sprite dirs
      config.sprites.items.forEach(function(itemInfo) {
        dirs.src.img.push('!' + itemInfo.imgSource + '{,/**}');
      });
    },
    
    js: {
      
      //prepends appropiate dir to globs defined in config JS priority
      priorityPrependDir: function(glob, dir) {
        var ret = [];
        if (glob && (glob instanceof Array)) {
          glob.forEach(function(d) {
            ret.push(dir + d);
          });
        }
        return ret;
      }
    }
  }
}





/* MAIN TASKS */
gulp.task('default', ['dev:watch']);


gulp.task('dev', function(cb) {
  runSequence('dev:build', 'dev:watch', cb);
});

gulp.task('dev:watch', function(cb) {

  runSequence('browser-sync:dev', function() {
    cb();
  });

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
      tasks.sprites(itemInfo, done);
    })).on('error', function(err) {
      //console.error(err);
    });
  });

  //js - app
  watch(dirs.src.js.app, batch(function (events, done) {
    gulp.start('js:dev:main', done);
  })).on('error', function(err) {
    //console.error(err);
  });

  //js - vendor
  watch([dirs.vendor + '**/*.js'].concat(dirs.src.js.vendor), batch(function (events, done) {
    gulp.start('js:dev', done);
  })).on('error', function(err) {
    //console.error(err);
  });
  
  //images
  watch(dirs.src.img + '**/*', batch(function (events, done) {
    gulp.start('images', done);
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
        tasks.customDirs([dirInfo], true, done);
      })).on('error', function(err) {
        //console.error(err);
      });
    }
  }
});

gulp.task('dev:build', function(cb) {
  runSequence('clean', 'views:dev', 'fonts', 'sprites', ['images', 'styles:dev', 'js:dev', 'custom-dirs:dev'], function() {
    //just tu ensure all assets are ready
    setTimeout(function() {
      browserSync.reload();
    }, 1000);

    cb();
  });
});

gulp.task('prod', function(cb) {
  runSequence('clean', 'views:prod', 'fonts', 'sprites', ['images', 'styles:prod', 'js:prod', 'custom-dirs:prod'], function() {
    //just tu ensure all assets are ready
    setTimeout(function() {
      browserSync.reload();
    }, 1000);

    cb();
  });
});

gulp.task('prod:preview', ['prod'], function(cb) {
  runSequence('browser-sync:prod');
});




var tasks = {

  inProgress: false,

  styles: function(isDev) {

    var configStyles = extend(true, config.styles.common, config.styles[isDev ? 'dev': 'prod']);
    //configStyles.sass.sourceMap = configStyles.sourceMaps;
    //configStyles.sass.sourceMapRoot = configStyles.sourceMapsRoot;
    //configStyles.sass.sourceMapEmbed = configStyles.sourceMaps;

    var ret = gulp.src(dirs.src.styles.main + '*.scss')
      .pipe(plumber({
        errorHandler: function (error) {
          console.log(error.message);
          this.emit('end');
        }
      }))

    if (configStyles.sourceMaps) {
      ret = ret
        .pipe(sourcemaps.init());
    }

    var ret = ret
          .pipe(sass(configStyles.sass).on('error', sass.logError));

    ret = ret
      .pipe(postcss([ autoprefixer({ browsers: configStyles.autoprefixer.browsers }) ]));

    if (configStyles.sourceMaps) {
      ret = ret
        .pipe(sourcemaps.write({ sourceRoot: configStyles.sourceMapsRoot }));
    }

    ret = ret
      .pipe(gulp.dest(dirs.dist.styles));

    return ret;
  },

  sprites: function(itemInfo, done) {

    if (done)
      console.log('Starting \'sprites\'...');

    var spriteData = gulp.src(itemInfo.imgSource + '**/*').pipe(spritesmith(itemInfo.options));

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
    var src;
    if (isApp) {
      src = APP.dirs.js.priorityPrependDir(configJs.priority.app, dirs.src.js.appDir)
              .concat(dirs.src.js.app);
    }
    else {
      src = APP.dirs.js.priorityPrependDir(configJs.priority.vendor.beforeBower, dirs.src.js.vendorDir)
              .concat(mainBowerFiles(configJs.mainBowerFiles))
              .concat(APP.dirs.js.priorityPrependDir(configJs.priority.vendor.afterBower, dirs.src.js.vendorDir))
              .concat(dirs.src.js.vendor);
    }
    ret = gulp.src(src, { base: dirs.src.main });

    //apply vendor filter glob
    if (!isApp) {
      ret = ret
        .pipe(filter(configJs.vendorFilter));
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

    if (configJs.sourceMaps) {
      //init source maps
      ret = ret
        .pipe(sourcemaps.init({ loadMaps: false }));
    }

    //concat files
    ret = ret
      .pipe(concat(isApp ? 'app.js' : 'vendor.js', { newLine:'\n;' }));

    if (configJs.sourceMaps) {
      //write source maps
      ret = ret
       .pipe(sourcemaps.write({ includeContent: false, sourceRoot: configJs.sourceMapsRoot }))
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

      if (configJs.sourceMaps) {
        ret = ret
          .pipe(sourcemaps.init({ loadMaps: true }));
      }

      ret = ret
        .pipe(concat('app.js', { newLine:'\n;' }));

      if (configJs.sourceMaps) {
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

    var ret = gulp.src(dirs.src.views.scripts + '**/*');

    if (configViews.useSwig) {
      ret = ret.pipe(swig(configViews.swig));
    }
    else {
      ret = ret.pipe(changed(dirs.dist.views));
    }
    ret = ret.pipe(gulp.dest(dirs.dist.views));

    return ret;
  },

  customDirs: function(dirInfos, isDev, done) {

    var streams = [];

    if (done)
      console.log('Starting \'custom dirs\'...');

    for (var dirName in dirInfos) {
      if (!dirInfos.hasOwnProperty(dirName))
        continue;

      var dirInfo = dirInfos[dirName];

      if ((!isDev || dirInfo.dev) && (isDev || dirInfo.prod) && (dirInfo.to !== null)) {
        var stream = gulp.src(dirInfo.from)
          .pipe(changed(dirInfo.to))
          .pipe(gulp.dest(dirInfo.to));

        streams.push(stream);
      }
    };

    if (streams.length) {
      return merge.apply(null, streams).on('finish', function() {
        if (done) {
          done();
          console.log('Finished \'custom dirs\'');
        }
      });
    }
    else {
      if (done) {
        done();
        console.log('Finished \'custom dirs\'');
      }
      return Promise.resolve();
    }
  },

  browserSync: function(isDev) {

    var configBS = extend(true, config.browserSync.common, config.browserSync[isDev ? 'dev': 'prod']);

    if (configBS.enable) {


      return new Promise(function(resolve, reject) {
        browserSync.init(configBS.options, function() {
          resolve();
        });
      });
    }
  },

  clean: {
    init: function() {
      var delDirs = [];
      delDirs['dist'] = [];
      delDirs['styles'] = this.getConfigDirGlob(dirs.dist.styles, config.clean.styles);
      delDirs['sprites'] = [];
      delDirs['fonts'] = this.getConfigDirGlob(dirs.dist.fonts, config.clean.fonts);
      delDirs['js'] = this.getConfigDirGlob(dirs.dist.js, config.clean.js);
      delDirs['img'] = this.getConfigDirGlob(dirs.dist.img, config.clean.img);
      delDirs['views'] = this.getConfigDirGlob(dirs.dist.views, config.clean.views, '*.*');
      delDirs['custom'] = [];

      //add dist dir
      if (config.clean.dist) {
        delDirs['dist'] = [dirs.dist.main];
      }

      //add sprites src styles
      if (config.clean.sprites) {
        config.sprites.items.forEach(function(spriteInfo){
          var filename = spriteInfo.options.cssName;
          if (filename) {
            delDirs['sprites'].push(dirs.src.styles.sprites + filename);
          }
        });
      }

      //add views subdirs
      if (delDirs['views'].length && fs.existsSync(dirs.dist.views)) {
        delDirs['views'] = delDirs['views'].concat(fs.readdirSync(dirs.src.views.scripts).filter(function(file) {
          return fs.statSync(path.join(dirs.src.views.scripts, file)).isDirectory();
        }).map(function(dir) {
          return path.join(dirs.dist.views, dir);// + '/' + '**/*';
        }));
      }

      //add custom dirs
      if (config.clean.custom) {
        for (var dirName in dirs.custom) {
          if (!dirs.custom.hasOwnProperty(dirName))
            continue;
          var dirInfo = dirs.custom[dirName];

          if (dirInfo.clean) {
            delDirs['custom'].push(dirInfo.to);
          }
        }
      }

      var delDirsGlob = [];
      
      for (dirKey in delDirs) {
        if (delDirs.hasOwnProperty(dirKey)) {
          delDirsGlob = delDirsGlob.concat(delDirs[dirKey]);
        }
      };

      var delFiles = del.sync(delDirsGlob, { force: true });
      //del.sync(dirs.dist.main);

      if (delFiles.length) {
        console.log('Deleted files/folders:\n', delFiles.join('\n'));
      }
      else {
        console.log('No files deleted.');
      }

      return Promise.resolve();
    },

    getConfigDirGlob: function(baseDir, configDir, suffix) {
      ret = [];
      if (configDir) {
        if (configDir === true)
          configDir = [baseDir + (suffix ? suffix : '')];

        if (configDir instanceof Array) {
          ret = configDir;
        }
        else {
          console.warn('Error: config.clean dir value expected to be an array.', baseDir, configDir);
        }
      }
      
      return ret;
    }
  }
}



/* STYLES */
gulp.task('styles:dev', function() {
  return tasks.styles(true)
    .pipe(browserSync.stream());
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
    .pipe(browserSync.stream());
});

gulp.task('js:dev:vendor', function() {
  return tasks.js(false, true)
    .pipe(browserSync.stream());
});

gulp.task('js:dev', function() {
  runSequence('js:dev:vendor', 'js:dev:main');
});

gulp.task('js:prod', function() {

  var ret = tasks.js(false, false);

  ret.on('end', function() {
    tasks.js(true, false).on('end', function() {
      del(dirs.dist.js + 'vendor.js', { force: true });
    });
  });

  return ret;

});



/* IMAGES */
gulp.task('images', function() {

  var imgGlob = [dirs.src.img + '**/*'];
  config.sprites.items.forEach(function(spriteDir) {
    imgGlob.push('!' + spriteDir.imgSource);
    imgGlob.push('!' + spriteDir.imgSource + '**/*');
  });

  return gulp.src(imgGlob)
    .pipe(plumber())
    .pipe(changed(dirs.dist.img))
    //.pipe(debug())
    .pipe(imagemin(config.images.imagemin))
    .pipe(gulp.dest(dirs.dist.img));
});



/* VIEWS */
gulp.task('views:dev', function() {
  if (dirs.src.views.main) {
    return tasks.views(true)
      .pipe(browserSync.stream());
  }
  else {
    return Promise.resolve();
  }
});

gulp.task('views:prod', function() {
  if (dirs.src.views.main) {
    return tasks.views(false);
  }
  else {
    return Promise.resolve();
  }
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
  return tasks.clean.init();
});



/* BROWSER SYNC */
gulp.task('browser-sync:dev', function() {
  return tasks.browserSync(true);
});

gulp.task('browser-sync:prod', function() {
  return tasks.browserSync(false);
});
