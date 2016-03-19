module.exports = function(dirs, config, tasks) {

	var gulp       	 = require('gulp'),
	    addsrc       = require('gulp-add-src'),
	    extend       = require('extend'),
	    filter       = require('gulp-filter'),
	    jshint       = require('gulp-jshint'),
	    plumber      = require('gulp-plumber'),
	    sourcemaps   = require('gulp-sourcemaps'),
	    concat       = require('gulp-concat'),
	    uglify       = require('gulp-uglify');


	var Comps = function(compsData) {
		this.compsData = compsData;
		this.compsDataString = JSON.stringify(this.compsData);

		
		//create content
		this.content = {};

		var wasVendorCache = false;	//only one comp can have vendor cache
		for (var id in this.compsData) {
			if (!this.compsData.hasOwnProperty(id))
				continue;
			if (this.compsData[id].vendorCache) {
				if (wasVendorCache)
					throw new Exception('FS: Error in config.js.comps definition for ' + id + '. Property vendorCache can be set only for one entry!');
				wasVendorCache = true;
			}
			this.content[id] = new Comp(this, id, this.compsData[id]);
			//console.log(this.content[id].typeGlobs);
		}

		// for (var compId in this.content) {
		// 	if (!this.content.hasOwnProperty(compId))
		// 		continue;
		// 	this.content[compId].applyExcludeIn();
		// }
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
		this.typeGlobs = {};

		this.setGlob('vendor', dirs.vendor);
		this.setGlob('vendorApp', dirs.src.js.vendor);
		this.setGlob('app', dirs.src.js.app);
	}

	Comp.prototype.getId = function() {
		return this.id;
	}

	Comp.prototype.getExcludeIn = function() {
		return this.data.excludeIn;
	}

	Comp.prototype.setGlob = function(type, baseDir) {
		var curId = this.getId(),
				destType = type == 'vendorApp' ? 'vendor' : type;

		var typeGlob = this.data[type] ? this.data[type] : [];

		if (!(typeGlob instanceof Array))
			typeGlob = [typeGlob];

		if (typeGlob.length) {

			for (var i in typeGlob) {
				if (!typeGlob.hasOwnProperty(i) || !typeGlob[i])
					continue;

				//add default glob prefix for vendor
				if ((type == 'vendor') && (typeGlob[i].indexOf('/') < 0)) {
					typeGlob[i] = '**/' + typeGlob[i];
				}

        typeGlob[i] = baseDir + typeGlob[i];
			}
		}

		this.typeGlobs[destType] = this.typeGlobs[destType] ? this.typeGlobs[destType].concat(typeGlob) : typeGlob;

	}

	Comp.prototype.getGlob = function(type, dependencies) {
		var typeGlob = this.typeGlobs[type] ? this.typeGlobs[type].slice(0) : [];
		
		if (dependencies) {
			this.applyExcludeIn(type, typeGlob, dependencies);
			if (type == 'vendor') {
				this.applyExcludeIn('vendorApp', typeGlob, dependencies);
			}
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

				//console.log('spr: ', id, 'w', curId, skipCompIds);
			if (excludeIn && ((excludeIn === true) || (excludeIn === curId) || (excludeIn.indexOf(curId) >= 0)) && (skipCompIds.indexOf(id) < 0)) {
				otherGlob = otherComp.getGlob(type);
				otherGlob.forEach(function(negatePattern) {
					typeGlob.push('!' + negatePattern);
				});
			}
		}
	}

	Comp.prototype.prependDir = function(glob, dir) {
    var ret = [];
    if (glob && (glob instanceof Array)) {
      glob.forEach(function(d) {
        ret.push(dir + d);
      });
    }
    return ret;
  }



  var Packages = function(comps, packagesData) {
 		this.packagesData = packagesData;
 		this.comps = comps;

		//create content
		this.content = {};
		for (var id in this.packagesData) {
			if (!this.packagesData.hasOwnProperty(id))
				continue;
			this.content[id] = new Package(this, id, this.packagesData[id]);
			console.log(id, this.content[id].typeGlobs);
		}
  }

  Packages.prototype.getContent = function() {
  	return this.content;
  }

  Packages.prototype.getComps = function() {
  	return this.comps;
  }


	var Package = function(packages, id, data) {
		this.id = id;
		this.packages = packages;
		this.data = data;
		this.typeGlobs = {};

		this.setGlob('vendor');
		this.setGlob('app');
	}

	Package.prototype.getId = function() {
		return this.id;
	}

	Package.prototype.setGlob = function(type) {
		this.typeGlobs[type] = [];
		var dependencies = this.data.dependencies;

		if (dependencies instanceof Array) {
			//console.log('dep w:', this.getId(), dependencies);
			var _this = this;
			dependencies.forEach(function(compId) {
				_this.typeGlobs[type] = _this.typeGlobs[type].concat(_this.packages.getComps().getContent(compId).getGlob(type, dependencies));
			});
		}
	}

	Package.prototype.getGlob = function(type) {
		return this.typeGlobs[type] ? this.typeGlobs[type] : [];
	}





	var comps,
			packages;


  tasks.js = function(isApp, isDev) {
    var ret,
        configJs = extend(true, config.js.common, config.js[isDev ? 'dev': 'prod']);

	  if (!comps || comps.compareData(configJs.comps)) {
	  	comps = new Comps(configJs.comps);
	  	packages = new Packages(comps, configJs.packages);
	  }

	  process.exit();

    //get files
    var src;
    if (isApp) {
      src = this.priorityPrependDir(configJs.priority.app, dirs.src.js.appDir)
              .concat(dirs.src.js.app);
    }
    else {
      src = this.priorityPrependDir(configJs.priority.vendor.beforeBower, dirs.src.js.vendorDir)
              .concat(mainBowerFiles(configJs.mainBowerFiles))
              .concat(this.priorityPrependDir(configJs.priority.vendor.afterBower, dirs.src.js.vendorDir))
              .concat(dirs.src.js.vendor);
    }
    ret = gulp.src(src, { base: dirs.src.main });

    if (!isApp) {
      ret = ret.pipe(filter(function(file) {
        return multimatch(file.path.replace('../', ''), configJs.vendorFilter).length;
      }));
    }

    //plumber
    ret = ret
      .pipe(plumber({
        errorHandler: function (error) {
          console.log(error.message);
          this.emit('end');
        }
      }));

    if (isDev && isApp && configJs.jsHint.enable) {
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

    if (isApp && configJs.concatVendorApp) {
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
  }




	/*tasks.js = function(isApp, isDev) {


	  var ret,
	      configJs = extend(true, config.js.common, config.js[isDev ? 'dev': 'prod']);

	  if (!comps || comps.compareData(configJs.comps)) {
	  	comps = new Comps(configJs.comps);
	  	packages = new Packages(comps, configJs.packages);
	  }

	  //temp
	  process.exit();

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
	}*/

}