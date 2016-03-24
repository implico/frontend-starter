module.exports = function(dirs, config, tasks) {

	var gulp       	 = require('gulp'),
	    addsrc       = require('gulp-add-src'),
	    debug        = require('gulp-debug'),
	    extend       = require('extend'),
	    filter       = require('gulp-filter'),
	    jshint       = require('gulp-jshint'),
	    mainBowerFiles = require('main-bower-files'),
	    multimatch   = require('multimatch'),
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

		this.setGlob('bower', dirs.bower);
		this.setGlob('vendor', dirs.src.js.vendor);
		this.setGlob('app', dirs.src.js.app);
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

		var typeGlob = this.data[type] ? this.data[type] : [];

		if (!(typeGlob instanceof Array))
			typeGlob = [typeGlob];

		if (typeGlob.length) {

			for (var i in typeGlob) {
				if (!typeGlob.hasOwnProperty(i) || !typeGlob[i])
					continue;

				//bower - no full path prepending (filtered)
				if (type == 'bower') {
					//add default glob prefix for bower
					if (typeGlob[i].indexOf('/') < 0) {
						typeGlob[i] = '**/' + typeGlob[i] + '/**/*';
					}
				}
				else {
					//prepend dir path
        	typeGlob[i] = baseDir + typeGlob[i];
        }
			}
		}

		this.typeGlobs[type] = typeGlob;	//this.typeGlobs[destType] ? this.typeGlobs[destType].concat(typeGlob) :
	}

	Comp.prototype.getGlob = function(type, dependencies) {
		var typeGlob = this.typeGlobs[type] ? this.typeGlobs[type].slice(0) : [];
		
		if (dependencies) {
			this.applyExcludeIn(type, typeGlob, dependencies);
		}

		return typeGlob;
	}

	Comp.prototype.applyExcludeIn = function(type, typeGlob, skipCompIds) {

		//nothing to negate
		if (!typeGlob.length)
			return;

		var curId = this.getId();

		//exclude vendor dir for app
		if (type == 'app') {
			typeGlob.push('!' + dirs.src.js.vendor);
		}

		var otherComps = this.comps.getContent(null, curId);

		for (var id in otherComps) {
			var otherComp = otherComps[id],
					excludeIn = otherComp.getExcludeIn();

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
			//console.log(id, this.content[id].typeGlobs);
		}
  }

  Packages.prototype.getContent = function(id) {
  	return id ? this.content[id] : this.content;
  }

  Packages.prototype.getComps = function() {
  	return this.comps;
  }


	var Package = function(packages, id, data) {
		this.id = id;
		this.packages = packages;
		this.data = data;
		this.typeGlobs = {};
		this.typeGlobsWatch = {};

		this.setGlob('bower');
		this.setGlob('vendor');
		this.setGlob('app');
	}

	Package.prototype.getId = function() {
		return this.id;
	}

	Package.prototype.getData = function(key) {
		return this.data[key];
	}

	Package.prototype.setGlob = function(type) {
		this.typeGlobs[type] = [];
		this.typeGlobsWatch[type] = [];
		var dependencies = this.data.dependencies;

		if (dependencies instanceof Array) {
			var _this = this;
			dependencies.forEach(function(compId) {
				var comp = _this.packages.getComps().getContent(compId),
						compGlob = comp.getGlob(type, dependencies);

				_this.typeGlobs[type] = _this.typeGlobs[type].concat(compGlob);
				if (comp.getData('watch') !== false) {
					_this.typeGlobsWatch[type] = _this.typeGlobsWatch[type].concat(compGlob);
				}
			});
			if ((type == 'app') && (this.typeGlobs[type].length)) {
				var negateVendor = '!' + dirs.src.js.vendor + '**/*';
				this.typeGlobs[type].push(negateVendor);
				this.typeGlobsWatch[type].push(negateVendor);
			}
		}
	}

	Package.prototype.getGlob = function(type, prependDir, watch) {
		var ret;
		if (watch) {
			ret = this.typeGlobsWatch[type] ? this.typeGlobsWatch[type] : [];
		}
		else {
			ret = this.typeGlobs[type] ? this.typeGlobs[type] : [];
		}

		if (prependDir && (type == 'bower') && ret.length) {
			var globs = ret.slice(0);
			ret = [];
			globs.forEach((g, i) => {
				ret.push(dirs.bower + g);
			});
		}
		return ret;
	}





  tasks.js = {
  	data: {
  		dev: {
  			config: null,
  			comps: null,
  			packages: null
  		},
  		prod: {
  			config: null,
  			comps: null,
  			packages: null
  		}
  	},

  	run: function(packageId, isApp, isDev, taskNameBegin, taskNameEnd, cb) {
  		if (taskNameBegin) {
  			console.log('Starting ' + taskNameBegin + '...');
  		}
  		if (taskNameEnd === true) {
  			taskNameEnd = taskNameBegin;
  		}
	    var ret,
	        configJs = this.getConfig(isDev);
	    var package = this.getPackages(isDev, packageId);

	    //set output filenames
	    var filename = package.getData('filename'),
	    		filenameVendor = package.getData('filenameVendor');
	    if (!filename)
	    	filename = packageId;
	    if (!filenameVendor)
	    	filenameVendor = filename + '.vendor';
	    filename += '.js';
	    filenameVendor += '.js';

	    var vendorDir = configJs.concatVendorApp ? dirs.cache : dirs.dist.js;

	    //get files
	    if (isApp) {
		    ret = gulp.src(package.getGlob('app'), { base: dirs.src.main });
	    }
	    else {
	    	var bowerFilter = package.getGlob('bower');
		    ret = gulp.src(mainBowerFiles(configJs.mainBowerFiles), { base: dirs.src.main })
		    	.pipe(filter(function(file) {
	        	return multimatch(file.path.replace('../', ''), bowerFilter).length;
	      	}))
	      	.pipe(addsrc.append(package.getGlob('vendor'), { base: dirs.src.main }));
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
	      .pipe(concat(isApp ? filename : filenameVendor, { newLine:'\n;' }));

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
	      .pipe(gulp.dest(isApp ? dirs.dist.js : vendorDir));

	    ret.on('finish', () => {
	    	if (taskNameEnd)
        	console.log('Finished ' + taskNameEnd + '.');
        if (cb)
          cb(tasks);
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

	  getPackages: function(isDev, packageId) {
	  	var offset = isDev ? 'dev' : 'prod',
	  			configJs = this.getConfig(isDev);

		  if (!this.data[offset].comps) {
		  	var comps = this.data[offset].comps = new Comps(configJs.comps);
		  	this.data[offset].packages = new Packages(comps, configJs.packages);
		  }
		  var packages = this.data[offset].packages;

	  	return packageId ? packages.getContent(packageId) : packages;
	  }
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