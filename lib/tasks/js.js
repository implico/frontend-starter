module.exports = function(appData) {

  var dirs = appData.dirs,
      config = appData.config;

  var gulp         = require('gulp'),
      addsrc       = require('gulp-add-src'),
      debug        = require('gulp-debug'),
      extend       = require('extend'),
      filter       = require('gulp-filter'),
      jshint       = require('gulp-jshint'),
      mainBowerFiles = require('main-bower-files'),
      multimatch   = require('multimatch'),
      path         = require('path'),
      plumber      = require('gulp-plumber'),
      sourcemaps   = require('gulp-sourcemaps'),
      concat       = require('gulp-concat'),
      uglify       = require('gulp-uglify');


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

        var comp = this.content[compId];

        switch (step) {
          //set globs (without dependencies)
          case 'setGlob':
            comp.setGlob('bower', dirs.bower);
            comp.setGlob('vendor', dirs.src.js.vendor);
            comp.setGlob('app', dirs.src.js.app);
            break;

          //include dependencies in globs (after having base globs for all comps)
          case 'setDependencies':
            comp.setDependencies('bower');
            comp.setDependencies('vendor');
            comp.setDependencies('app');
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

    //get priority glob for type
    var priorityGlob;
    if (type != 'bower') {
      priorityGlob = (this.data.priority && this.data.priority[type]) ? this.data.priority[type] : [];
      if (!(priorityGlob instanceof Array))
        priorityGlob = [priorityGlob];
    }

    //get main glob for type
    var typeGlob = this.data[type] ? this.data[type] : [];
    if (!(typeGlob instanceof Array))
      typeGlob = [typeGlob];

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
    dependencies.forEach((depCompId) => {
      var depComp = _this.comps.getContent(depCompId),
          depCompGlob = depComp.getGlob(type, false, true);

      _this.typeGlobs[type] = _this.typeGlobs[type].concat(depCompGlob);
      if (depComp.getData('watch') !== false) {
        _this.typeGlobsWatch[type] = _this.typeGlobsWatch[type].concat(depCompGlob);
      }
    });

    //apply other comps exclude in (if not in dependencies)
    if (_this.typeGlobs[type].length) {
      var otherComps = this.comps.getContent(null, curId);
      for (var id in otherComps) {
        var otherComp = otherComps[id],
            excludeIn = otherComp.getExcludeIn();

        if (excludeIn && ((excludeIn === true) || (excludeIn === curId) || ((excludeIn instanceof Array) && (excludeIn.indexOf(curId) >= 0)))
           && (dependencies.indexOf(id) < 0)) {
          otherGlob = otherComp.getGlob(type, false, true);
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
        otherGlob = otherComp.getGlob(type);
        otherGlob.forEach(function(patternToNegate) {
          typeGlob.push('!' + patternToNegate);
        });
      }
    }
  }


  appData.tasks.js = {
    data: {
      dev: {
        config: null,
        comps: null
      },
      prod: {
        config: null,
        comps: null
      }
    },

    run: function(taskData) {
      taskData = taskData || {
        compId: '',
        isApp: true,
        isDev: true,
        taskNameBegin: null,
        taskNameEnd: null,
        cb: null
      }
      var ret,
          configJs = this.getConfig(taskData.isDev);
      var comp = this.getComps(taskData.isDev, taskData.compId);

      //set output filenames
      var filename = comp.getData('filename'),
          filenameVendor = comp.getData('filenameVendor');
      if (filename === false) {
        //just auxiliary comp, leaving
        if (taskData.cb)
          taskData.cb(appData.tasks);
        return Promise.resolve();
      }
      if (!filename)
        filename = taskData.compId;
      var hasDot = filename.indexOf('.') >= 0;
      if (!filenameVendor)
        filenameVendor = filename + '.vendor';

      if (!hasDot) {
        filename += '.js';
        filenameVendor += '.js';
      }

      //log task begin
      if (taskData.taskNameBegin) {
        console.log('Starting ' + taskData.taskNameBegin + '...');
      }
      if (taskData.taskNameEnd === true) {
        taskData.taskNameEnd = taskData.taskNameBegin;
      }

      var vendorDir = configJs.concatVendorApp ? dirs.cache : dirs.dist.js;

      //get files
      if (taskData.isApp) {
        ret = gulp.src(comp.getGlob('app'), { base: dirs.src.main });
      }
      else {
        var bowerFilter = comp.getGlob('bower');
        ret = gulp.src(mainBowerFiles(configJs.mainBowerFiles), { base: dirs.src.main })
          .pipe(filter(function(file) {
            return multimatch(path.normalize(file.path), bowerFilter).length;
          }))
          .pipe(addsrc.append(comp.getGlob('vendor'), { base: dirs.src.main }));
      }

      //plumber
      ret = ret
        .pipe(plumber({
          errorHandler: function (error) {
            console.log(error.message);
            this.emit('end');
          }
        }));

      if (taskData.isDev && taskData.isApp && configJs.jsHint.enable) {
        //jshint for dev
        ret = ret
          .pipe(jshint(configJs.jsHint.options))
          .pipe(jshint.reporter(configJs.jsHint.reporter));
      }

      if (configJs.sourceMaps) {
        //init source maps
        ret = ret
          .pipe(sourcemaps.init({ loadMaps: false }));
      }

      //concat files
      ret = ret
        .pipe(concat(taskData.isApp ? filename : filenameVendor, { newLine:'\n;' }));

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

      if (taskData.isApp && configJs.concatVendorApp) {
        //when main app, prepend vendor.js
        ret = ret
          .pipe(addsrc.prepend(vendorDir + filenameVendor));

        if (configJs.sourceMaps) {
          ret = ret
            .pipe(sourcemaps.init({ loadMaps: true }));
        }

        ret = ret
          .pipe(concat(filename, { newLine:'\n;' }));

        if (configJs.sourceMaps) {
          ret = ret
            .pipe(sourcemaps.write({ includeContent: false }));
        }
      }

      //save the file
      ret = ret
        .pipe(gulp.dest(taskData.isApp ? dirs.dist.js : vendorDir));

      if (taskData.isApp) {
        ret = ret
          .pipe(appData.app.browserSync.stream());
      }

      ret.on('finish', () => {
        if (taskData.taskNameEnd)
          console.log('Finished ' + taskData.taskNameEnd + '.');
        if (taskData.cb)
          taskData.cb(appData.tasks);
      });

      return ret;
    },

    getConfig: function(isDev) {
      var offset = isDev ? 'dev' : 'prod';
      if (!this.data[offset].config) {
        this.data[offset].config = extend(true, config.js.common, config.js[offset])
      }
      return this.data[offset].config;
    },

    getComps: function(isDev, compId) {
      var offset = isDev ? 'dev' : 'prod',
          configJs = this.getConfig(isDev);

      if (!this.data[offset].comps) {
        this.data[offset].comps = new Comps(configJs.comps);
      }
      var comps = this.data[offset].comps;

      return compId ? comps.getContent(compId) : comps;
    }
  }
}