'use strict';

module.exports = function(appData) {

  var dirs = appData.dirs,
      config = appData.config;

  const gulp         = appData.gulp,
        addsrc       = require('gulp-add-src'),
        babel        = require('gulp-babel'),
        extend       = require('extend'),
        filter       = require('gulp-filter'),
        mainBowerFiles = require('main-bower-files'),
        multimatch   = require('multimatch'),
        named        = require('vinyl-named'),
        path         = require('path'),
        plumber      = require('gulp-plumber'),
        sourcemaps   = require('gulp-sourcemaps'),
        concat       = require('gulp-concat'),
        uglify       = require('gulp-uglify'),
        webpack      = require('webpack-stream');


  appData.tasks.js = {
    comps: {
      dev: null,
      prod: null
    },

    run: function(taskParams) {
      taskParams = taskParams || {
        isWatch: false,
        compId: '',
        isApp: true
      }

      var injector = new appData.Injector('js', appData, taskParams);

      // this.patchPresets(injector.taskConfig.babel.options);

      var comp = this.getComps(taskParams.compId, injector.taskConfig);
      var isWebpack = comp.getData('webpack');


      //set output filenames (or entry files for webpack)
      let filename = comp.getData('filename');
      let filenameVendor = comp.getData('filenameVendor');
      if ((filename === null) || (filename === false)) {
        //just auxiliary comp, leaving
        return Promise.resolve();
      }

      var vendorDir = injector.taskConfig.concatVendorApp ? dirs.cache : dirs.dist.js;

      var injectorData = { comp, filename, filenameVendor, vendorDir };
      injector.taskData = injectorData;

      var stream = injector.run('src', null);
      if (injector.isTaskCanceled(stream)) {
        return Promise.resolve();
      }

      //get files
      if (!injector.isCanceled) {
        if (isWebpack) {
          stream = gulp.src(appData.app.taskUtils.sanitizeGlob(stream ? stream : filename))
            .pipe(named());
        }
        else {
          if (taskParams.isApp) {
            stream = gulp.src(appData.app.taskUtils.sanitizeGlob(stream ? stream : comp.getGlob('app')), { base: dirs.src.main });
          }
          else {
            var bowerFilter = comp.getGlob('bower');
            stream = gulp.src(stream ? stream : mainBowerFiles(injector.taskConfig.mainBowerFiles), { base: dirs.src.main })
              .pipe(filter(function(file) {
                return multimatch(path.normalize(file.path), bowerFilter).length;
              }))
              .pipe(addsrc.append(comp.getGlob('vendor'), { base: dirs.src.main }));
          }
        }

        //plumber - disabled for lint stopping on error
        // stream = stream.pipe(plumber({
        //   errorHandler: function (error) {
        //     //console.log(error.message);
        //     this.emit('end');
        //   }
        // }));
      }

      if (taskParams.isApp) {
        stream = injector.run('lint', stream);
        if (!injector.isCanceled) {
          stream = appData.tasks.lint.perform(stream, null, injectorData, injector);
        }
      }

      //webpack
      if (isWebpack) {
        stream = injector.run('webpack', stream);
        if (!injector.isCanceled) {
          let webpackOpts = injector.taskConfig.webpack;
          if (injector.taskConfig.sourceMaps) {
            webpackOpts.devtool = 'inline-source-map';
          }
          stream = stream.pipe(webpack(webpackOpts));
        }
      }

      //init source maps
      if (injector.taskConfig.sourceMaps) {
        stream = injector.run('sourceMapsInit', stream);
        if (!injector.isCanceled) {
          stream = stream.pipe(sourcemaps.init({ loadMaps: isWebpack }));
        }
      }

      if (!isWebpack) {
        var babelConfig = injector.taskConfig.babel;
        if ((taskParams.isApp && babelConfig.app) || (!taskParams.isApp && babelConfig.vendor)) {
          stream = injector.run('babel', stream);
          if (!injector.isCanceled) {
            stream = stream.pipe(babel(babelConfig.options));
          }
        }
      }

      //concat files
      if (!isWebpack) {
        stream = injector.run('concat', stream);
        if (!injector.isCanceled) {
          stream = stream.pipe(concat(taskParams.isApp ? filename : filenameVendor, { newLine:'\n;' }));
        }
      }

      //write source maps
      if (injector.taskConfig.sourceMaps) {
        stream = injector.run('sourceMapsWrite', stream);
        if (!injector.isCanceled) {
          stream = stream.pipe(sourcemaps.write({ includeContent: false, sourceRoot: injector.taskConfig.sourceMapsRoot/*, mapSources: sourcePath => injector.taskConfig.sourceMapsRoot + sourcePath*/ }));
        }
      }

      //minify
      stream = injector.run('minify', stream);
      if (!injector.isCanceled) {
        stream = stream.pipe(uglify());
      }

      //when main app, prepend vendor.js
      if (!isWebpack) {
        if (taskParams.isApp && injector.taskConfig.concatVendorApp) {
          stream = injector.run('concatVendorApp', stream);
          if (!injector.isCanceled) {
            stream = stream.pipe(addsrc.prepend(vendorDir + filenameVendor));

            if (injector.taskConfig.sourceMaps) {
              stream = stream.pipe(sourcemaps.init({ loadMaps: true }));
            }

            stream = stream.pipe(concat(filename, { newLine:'\n;' }));

            if (injector.taskConfig.sourceMaps) {
              stream = stream.pipe(sourcemaps.write({ includeContent: false }));
            }
          }
        }
      }

      //save the file
      stream = injector.run('dest', stream);
      if (!injector.isCanceled) {
        stream = stream.pipe(gulp.dest(taskParams.isApp ? dirs.dist.js : vendorDir));
      }

      //browser reload
      stream = injector.run('reload', stream);
      if (!injector.isCanceled) {
        if (taskParams.isApp && taskParams.isWatch) {
          stream = stream.pipe(appData.browserSync.stream());
        }
      }

      stream = injector.run('finish', stream);

      var promise = appData.app.taskUtils.streamToPromise(stream);

      return promise;
    },

    //fix Babel preset issue searching preset module from JS dir by converting preset to explicit plugins and removing it
    /*    
    patchPresets(babelOptions) {
      return;
      let presets = ['es2015', 'es2015-without-strict'];
      this.presetPlugins = this.presetPlugins || {};
      presets.forEach((preset) => {
        if (!(babelOptions.presets instanceof Array)) {
          return;
        }
        let presetIndex = babelOptions.presets.indexOf(preset);
        if (presetIndex >= 0) {
          delete babelOptions.presets[presetIndex];
          babelOptions.presets = babelOptions.presets.filter(function(v) { return typeof v !== 'undefined'; });
          if (!babelOptions.presets.length) {
            delete babelOptions.presets;
          }

          if (!this.presetPlugins[preset]) {
            this.presetPlugins[preset] = [[function() { console.log('nie ma mnie') } ]]//require('babel-preset-' + preset).plugins;
          }
          babelOptions.plugins = babelOptions.plugins || [];
          babelOptions.plugins = babelOptions.plugins.concat(this.presetPlugins[preset]);
        }
      })
    },
    */

    getComps: function(compId, configJs, isDev) {
      if (typeof isDev === 'undefined') {
        isDev = appData.config.main.isDev;
      }
      var offset = isDev ? 'dev' : 'prod';

      if (!configJs) {
        var injector = new appData.Injector('js', appData);
        configJs = injector.taskConfig;
      }

      if (!this.comps[offset]) {
        this.comps[offset] = new Comps(configJs.comps);
      }
      var comps = this.comps[offset];

      return compId ? comps.getContent(compId) : comps;
    }
  }

  /*
   *  Prepare JS comps lib
   */

  var Comps = function(compsData) {
    this.compsData = compsData;
    this.compsDataString = JSON.stringify(this.compsData);


    //create content
    this.content = {};

    for (var id in this.compsData) {
      if (!this.compsData.hasOwnProperty(id))
        continue;
      this.content[id] = new Comp(this, id, this.compsData[id]);
    }

    ['setGlob', 'setDependencies', 'setFinal'].forEach((step) => {
      for (var compId in this.content) {
        if (!this.content.hasOwnProperty(compId))
          continue;

        let comp = this.content[compId];

        switch (step) {
          //set globs (without dependencies)
          case 'setGlob':
            comp.setGlob('bower', dirs.bower);
            comp.setGlob('vendor', dirs.src.js.vendor);
            comp.setGlob('app', dirs.src.js.app);
            comp.setGlob('webpack', dirs.src.js.app);
            break;

          //include dependencies in globs (after having base globs for all comps)
          case 'setDependencies':
            comp.setDependencies('bower');
            comp.setDependencies('vendor');
            comp.setDependencies('app');
            comp.setDependencies('webpack');
            break;

          //finalize
          case 'setFinal':
            comp.setFinal();
            break;
        }
      }
    });
  }

  Comps.prototype.getContent = function(includeId, excludeId) {
    var ret = {};
    for (var id in this.content) {
      if (!this.content.hasOwnProperty(id) || (includeId && (id != includeId)) || (excludeId && (id == excludeId)))
        continue;
      if (includeId)
        return this.content[id];

      ret[id] = this.content[id];
    }

    return ret;
  }

  Comps.prototype.compareData = function(otherData) {
    return JSON.stringify(otherData) == this.compsDataString;
  }



  var Comp = function(comps, id, data) {
    this.id = id;
    this.comps = comps;
    this.data = data;
    this.typeGlobsOwn = {};
    this.typeGlobsWatch = {};
    this.typeGlobs = {};

    let filename = this.getData('filename');
    let filenameVendor = this.getData('filenameVendor');
    if ((filename !== null) && (filename !== false)) {
      if (!filename) {
        filename = this.id;
      }
      if (!filenameVendor) {
        filenameVendor = filename + '.vendor';
      }
      filename = this.appendFileExt(filename, 'js');
      filenameVendor = this.appendFileExt(filenameVendor, 'js');
      
      // prepend path to entries
      if (this.getData('webpack')) {
        if (!Array.isArray(filename)) {
          filename = [filename];
        }
        filename.forEach((f, i) => {
          filename[i] = dirs.src.js.main + f;
        });
      }

      this.data.filename = filename;
      this.data.filenameVendor = filenameVendor;
    }
  }

  Comp.prototype.getId = function() {
    return this.id;
  }

  Comp.prototype.getData = function(key) {
    return this.data[key];
  }

  Comp.prototype.getExcludeIn = function() {
    return this.data.excludeIn;
  }

  Comp.prototype.setGlob = function(type, baseDir) {
    var curId = this.getId();

    this.typeGlobsOwn[type] = [];
    this.typeGlobsWatch[type] = [];
    this.typeGlobs[type] = [];

    if (this.getData('webpack') && (type != 'webpack')) {
      return;
    }

    //get priority glob for type
    var priorityGlob;
    if ((type != 'bower') && (type != 'webpack')) {
      priorityGlob = (this.data.priority && this.data.priority[type]) ? this.data.priority[type] : [];
      if (!(priorityGlob instanceof Array))
        priorityGlob = [priorityGlob];
    }

    //get main glob for type
    var typeGlob = this.data[type] ? this.data[type] : [];
    if (!(typeGlob instanceof Array)) {
      typeGlob = [typeGlob];
    }

    //prepend priority glob
    if (priorityGlob) {
      typeGlob = priorityGlob.concat(typeGlob);
    }

    //modify glob (bower)/prepend dir
    if (typeGlob.length) {

      for (var i in typeGlob) {
        if (!typeGlob.hasOwnProperty(i) || !typeGlob[i])
          continue;

        //bower - add default glob suffix
        if (type == 'bower') {
          if (typeGlob[i].indexOf('/') < 0) {
            typeGlob[i] = typeGlob[i] + '/**/*';
          }
        }
        //prepend dir path
        typeGlob[i] = baseDir + typeGlob[i];
      }
    }

    if (this.getData('webpack')) {
      typeGlob = typeGlob.concat(this.getData('filename'));
    }

    this.typeGlobsOwn[type] = typeGlob;
    if (this.getData('watch') !== false) {
      this.typeGlobsWatch[type] = typeGlob.slice(0);
    }
  }

  Comp.prototype.setDependencies = function(type) {
    var curId = this.getId();

    var dependencies = this.data.dependencies;
    if (!dependencies) {
      dependencies = [];
    }
    else if (!(dependencies instanceof Array)) {
      dependencies = [dependencies];
    }

    var _this = this;
    _this.typeGlobs[type] = _this.typeGlobsOwn[type].slice(0);

    //add dependencies globs
    if (!this.getData('webpack')) {
      dependencies.forEach((depCompId) => {
        var depComp = _this.comps.getContent(depCompId),
            depCompGlob = depComp.getGlob(type, false, true);

        _this.typeGlobs[type] = _this.typeGlobs[type].concat(depCompGlob);
        if (depComp.getData('watch') !== false) {
          _this.typeGlobsWatch[type] = _this.typeGlobsWatch[type].concat(depCompGlob);
        }
      });
    }

    //apply other comps exclude in (if not in dependencies)
    if (_this.typeGlobs[type].length) {
      var otherComps = this.comps.getContent(null, curId);
      for (var id in otherComps) {
        var otherComp = otherComps[id],
            excludeIn = otherComp.getExcludeIn();

        if (excludeIn && ((excludeIn === true) || (excludeIn === curId) || ((excludeIn instanceof Array) && (excludeIn.indexOf(curId) >= 0)))
           && (dependencies.indexOf(id) < 0)) {
          var otherGlob = otherComp.getGlob(type, false, true);
          otherGlob.forEach(function(patternToNegate) {
            var negatedPattern = '!' + patternToNegate;
            _this.typeGlobs[type].push(negatedPattern);
            if (_this.typeGlobsWatch[type].length) {
              _this.typeGlobsWatch[type].push(negatedPattern);
            }
          });
        }
      }
    }
  }

  Comp.prototype.setFinal = function() {
    if (this.typeGlobs['app'].length) {
      var negateVendor = '!' + dirs.src.js.vendor + '{,**/*}';
      this.typeGlobs['app'].push(negateVendor);
      if (this.typeGlobsWatch['app'].length) {
        this.typeGlobsWatch['app'].push(negateVendor);
      }
    }
    //console.log(this.id, this.typeGlobs);
  }

  Comp.prototype.getGlob = function(type, watch, own) {
    var typeGlob;

    if (watch) {
      typeGlob = this.typeGlobsWatch[type] ? this.typeGlobsWatch[type] : [];
    }
    else if (own) {
      typeGlob = this.typeGlobsOwn[type] ? this.typeGlobsOwn[type] : [];
    }
    else {
      typeGlob = this.typeGlobs[type] ? this.typeGlobs[type] : [];
    }

    return typeGlob;
  }

  Comp.prototype.applyExcludeIn = function(type, typeGlob, skipCompIds) {

    //nothing to negate
    if (!typeGlob.length)
      return;

    var curId = this.getId();

    var otherComps = this.comps.getContent(null, curId);

    for (var id in otherComps) {
      var otherComp = otherComps[id],
          excludeIn = otherComp.getExcludeIn();

      if (excludeIn && ((excludeIn === true) || (excludeIn === curId) || ((excludeIn instanceof Array) && (excludeIn.indexOf(curId) >= 0))) && (skipCompIds.indexOf(id) < 0)) {
        var otherGlob = otherComp.getGlob(type);
        otherGlob.forEach(function(patternToNegate) {
          typeGlob.push('!' + patternToNegate);
        });
      }
    }
  }

  Comp.prototype.appendFileExt = function(filename, ext) {
    let wasArray = true;
    if (!filename) {
      return filename;
    }
    if (!Array.isArray(filename)) {
      filename = [filename];
      wasArray = false;
    }
    filename.forEach((f, i) => {
      if (f.indexOf('.') < 0) {
        filename[i] += '.' + ext;
      }
    });
    return wasArray ? filename : filename[0];
  }
}
