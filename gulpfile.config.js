/**
  Frontend-starter

  @author Bartosz Sak, Archas
  
  https://github.com/implico/frontend-starter
  
  The MIT License (MIT)
  
  
  *******************
  Configuration file

*/

module.exports = function(dirs) {

  var fs   = require('fs');


  var config = {

    styles: {

      common: {
        sourceMaps: true,
        sourceMapsRoot: '/src/styles/',

        autoprefixer: {
          browsers: ['> 1%', 'last 3 versions', 'IE 8']
        },

        sass: {
        }
      },

      dev: {

        sass: {
          outputStyle: 'expanded'
        }
      },

      prod: {

        sourceMaps: false,

        sass: {
          outputStyle: 'compressed'
        }
      }
    },

    sprites: {

      items: [
        //you can add more items (dirs), simply add an element
        {
          imgSource: dirs.src.img + 'sprites/',
          imgDest: dirs.dist.img,
          //options passed to the plugin
          options: {
            imgName: 'sprites.png',
            imgPath: '../img/sprites.png',
            cssName: '_sprites.scss',
            cssSpritesheetName: 'spritesheet',
            cssVarMap: function (sprite) {
              sprite.name = /*'sprite_' + */sprite.name;
            }
          }
        }
      ],

      inject: {
        cancelTask: false,
        cancel: [],

        init: null,
        imgSrc: null,
        imgOptimize: null,
        imgDest: null,
        cssSrc: null,
        cssDest: null,
        finish: null
      },

      dev: {
        inject: {
          imgOptimize: false
        }
      },

      prod: {
      }
    },

    js: {
      sourceMaps: true,
      sourceMapsRoot: '/src/',
      minify: false,
      concatVendorApp: true,    //if true, app.js and vendor.js are merged into app.js
      bowerFilter: ['**/*.js'],

      comps: {
        main: {
          filename: 'app',      //set to false to not produce any output file (for sub-comps); if not set, defaults to comp id
                                //.js extension added automatically unless the name contains a dot
          //filenameVendor: 'vendor',//if concatVendorApp is false, specifies the vendor filename

          bower: ['**/*.js'],   //set only name of the package
          vendor: ['**/*.js'],  //path relative to the appropriate directory
          app: ['**/*.js'],     //path relative to the appropriate directory

          //set prioritized paths
          priority: {
            vendor: [],
            app: []
          },

          //set other comp ids to include
          dependencies: [],

          //set comps to exclude all loaded scripts in other comps, e.g.
          //excludeIn: ['comp1', 'comp2'] //excluded in selected comps
          //excludeIn: true   //excluded in all other comps
          //excludeIn: false  //no exclusion
          excludeIn: false,

          watch: true  //not needed, watch blocked only if false
        },

        html5shiv: {
          bower: ['html5shiv'],
          excludeIn: true,
          watch: false
        }
      },

      mainBowerFiles: {
        paths: {
          bowerDirectory: dirs.bower,
          bowerrc: dirs.app + '.bowerrc',
          bowerJson: dirs.app + 'bower.json'
        },
        overrides: {}
      },
      
      jsHint: {
        enable: false,
        options: {},
        reporter: 'default'
      },

      inject: {
        cancelTask: false,
        cancel: [],

        //receive stream and an object { comp, ...} (see the source injectorData for more)
        src: null,
        sourceMapsInit: null,
        concat: null,
        sourceMapsWrite: null,
        minify: null,
        concatVendorApp: null,
        dest: null,
        reload: null,
        finish: null
      },

      dev: {
      },

      prod: {
        sourceMaps: false,
        minify: true,

        jsHint: {
          enable: false
        }
      },

      //compatibility fallback, to be removed
      common: {
        comps: {
          main: {
            priority: {
              vendor: [],
              app: []
            }
          },
          html5shiv: {}
        }
      }
    },

    images: {
      optimize: {
        optimizationLevel: 3,
        progressive: true,
        interlaced: true
      },

      inject: {
        cancelTask: false,
        cancel: [],

        src: null,
        changed: null,
        optimize: null,
        dest: null,
        finish: null
      },

      dev: {
        inject: {
          optimize: false
        }
      },

      prod: {

      },

      //compatibility fallback
      imagemin: {}
    },

    views: {

      common: {
        useSwig: true,
        swig: {
          defaults: { cache: false },
          setup: function(swig) {
            swig.setDefaults({
              //set base dir
              loader: swig.loaders.fs(dirs.src.views.layouts)
            });
          },
          //variable context (data) passed to all templates
          data: {}
        }
      },

      dev: {
        swig: {

        }
      },

      prod: {
        swig: {

        }
      }
    },

    customDirs: {
      inject: {
        cancelTask: false,
        cancel: [],

        init: null, //receives the object of custom directory definitions
        finish: null  //receives an object: { streams, dirInfos } (array of streams, custom directory definitions)
      }
    },

    browserSync: {
      options: {
        //tip: set host to "[project-name].localhost" and set "open" to "external"
        host: 'localhost',
        open: 'local',
        port: 80,
        reloadOnRestart: true,
        server: {
          baseDir: dirs.dist.main
        }
      },

      inject: {
        cancelTask: false,
        cancel: [],
        init: null  //overrides default browserSync run, must return a promise or stream
      },

      dev: {
      },

      //only for prod:preview task
      prod: {
      },

      //compatibility fallback
      common: {
        options: {}
      }
    },

    clean: {

      inject: {
        cancelTask: false,
        cancel: [],

        //receive current glob array (incremental, containing previously added patterns) passed at the end to delete function
        cache: null,
        styles: null,
        sprites: null,
        fonts: null,
        js: null,
        images: null,
        views: null,
        custom: null,
        del: null,
        finish: null
      }
    }
  }

  //custom config file
  var noCustomFile = false;
  try {
    fs.accessSync(dirs.app + dirs.customConfig.configFile, fs.R_OK);
  }
  catch (ex) {
    noCustomFile = true;
    console.error('Frontend-starter warning: no custom config definitions file present (' + dirs.customConfig.configFile + ').');
  }

  //custom config file - require
  if (!noCustomFile) {
    require(dirs.app + dirs.customConfig.configFile)(config, dirs);
  }

  return config;
}
