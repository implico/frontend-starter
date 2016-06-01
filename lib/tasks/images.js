module.exports = function(appData) {

  var 
      gulp         = appData.gulp,
      changed      = require('gulp-changed'),
      imagemin     = require('gulp-imagemin'),
      plumber      = require('gulp-plumber'),
      extend       = require('extend');


  appData.tasks.images = {
    run: function(taskData) {
      taskData = taskData || {};

      // if (!appData.dirs.src.images)
      //   return Promise.resolve();
      
      var imgGlob = [appData.dirs.src.images + '**/*'];
      appData.config.sprites.items.forEach(function(spriteDir) {
        imgGlob.push('!' + spriteDir.imgSource);
        imgGlob.push('!' + spriteDir.imgSource + '**/*');
      });

      var injector = new appData.Injector('images', appData, taskData);
      //backward-compatibility fallback
      injector.taskConfig.optimize = this.getOptimizeOpts(injector);

      var stream = injector.run('src');

      if (!injector.isCanceled) {
        stream = gulp.src(stream ? stream : imgGlob)
          .pipe(plumber());
      }

      stream = injector.run('limit', stream);
      if (!injector.isCanceled) {
        stream = stream.pipe(changed(appData.dirs.dist.images));
      }

      if (!injector.isCanceled) {
        stream = injector.run('optimize', stream);
        if (!injector.isCanceled) {
          stream = stream.pipe(imagemin(injector.taskConfig.optimize));
        }
      }

      stream = injector.run('dest', stream);
      if (!injector.isCanceled) {
        stream = stream.pipe(gulp.dest(appData.dirs.dist.images));
      }

      stream = injector.run('finish', stream);

      return appData.app.streamToPromise(stream);
    },

    getOptimizeOpts(injector) {
      if (!injector) {
        injector = new appData.Injector('images', appData);
      }
      //fallback
      if (appData.config.images.imagemin.optimizationLevel) {
        console.log('Frontend-starter warning (deprecated): please change reference in ' + appData.dirs.customConfig.configFile + ' from config.images.imagemin to config.images.optimize');
      }
      return extend(true, injector.taskConfig.optimize, appData.config.images.imagemin);
    }
  }
}