module.exports = function(appData) {

  var 
      gulp         = require('gulp'),
      changed      = require('gulp-changed'),
      imagemin     = require('gulp-imagemin'),
      plumber      = require('gulp-plumber'),
      extend       = require('extend');


  appData.tasks.images = {
    run: function(taskData) {
      taskData = taskData || { isDev: true };
      if (!appData.dirs.src.img)
        return Promise.resolve();
      
      var imgGlob = [appData.dirs.src.img + '**/*'];
      appData.config.sprites.items.forEach(function(spriteDir) {
        imgGlob.push('!' + spriteDir.imgSource);
        imgGlob.push('!' + spriteDir.imgSource + '**/*');
      });

      var injector = new appData.Injector('images', appData, taskData);
      //backward-compatibility fallback
      injector.taskConfig.optimize = this.getOptimizeOpts(injector);

      if (injector.cancelTask)
        return injector.cancelTask;

      var stream = injector.run('init');

      if (!stream) {
        stream = gulp.src(imgGlob)
          .pipe(plumber());
      }

      stream = injector.run('changed', stream);
      if (!injector.isCanceled('changed')) {
        stream = stream
          .pipe(changed(appData.dirs.dist.img));
      }

      if (!taskData.isDev && !injector.isCanceled('optimize')) {
        stream = injector.run('optimize', stream);
        if (!injector.isCanceled('optimize')) {
          stream = stream
            .pipe(imagemin(appData.config.images.imagemin));
        }
      }

      stream = injector.run('dest', stream);
      if (!injector.isCanceled('dest')) {
        stream = stream
          .pipe(gulp.dest(appData.dirs.dist.img));
      }

      stream = injector.run('finish', stream);

      return stream;
    },

    getOptimizeOpts(injector, isDev) {
      if (!injector) {
        injector = new appData.Injector('images', appData, { isDev: isDev });
      }
      //fallback
      if (appData.config.images.imagemin.optimizationLevel) {
        console.log('Frontend-starter warning (deprecated): please change reference in ' + appData.dirs.customConfig.configFile + ' from config.images.imagemin to config.images.optimize');
      }
      return extend(true, injector.taskConfig.optimize, appData.config.images.imagemin);
    }
  }
}