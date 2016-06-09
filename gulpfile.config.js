/**
  Frontend-starter

  @author Bartosz Sak
  
  https://github.com/implico/frontend-starter
  
  The MIT License (MIT)
  
  
  *******************
  Configuration file

*/

module.exports = function(dirs) {

  var fs        = require('fs'),
      minimist  = require('minimist');


  var config = {

    main: {
      isDev: null,
      isRestart: null
    },

    styles: {

      sourceMaps: true,
      sourceMapsRoot: '/src/styles/',

      autoprefixer: {
        browsers: ['> 1%', 'last 3 versions', 'IE >= 9']
      },

      sass: {
      },

      cssnano: {
        safe: true
      },

      inject: {
        src: true,    //function must return: a stream (if cancels) or a glob array passed to the src
        sourceMapsInit: true,
        sassGlob: true,
        sass: true,
        autoprefixer: true,
        optimizeMediaQueries: true, //group-css-media-queries
        optimize: true,             //cssnano
        sourceMapsWrite: true,
        dest: true,
        finish: true,
        reload: true
      },

      dev: {
        sass: {
          outputStyle: 'expanded'
        },

        inject: {
          optimizeMediaQueries: false,
          optimize: false
        }
      },

      prod: {
        sourceMaps: false,
      },

      //compatibility fallback, to be removed
      common: {}
    },


    fonts: {

      inject: {
        src: true,    //function must return: a stream (if cancels) or a glob array passed to the src
        limit: true,  //gulp-changed plugin
        dest: true,
        finish: true,
        reload: true
      },

      dev: {
      },
      
      prod: {
      }
    },


    sprites: {

      items: [
        //you can add more items (dirs), simply add an element
        {
          imgSource: dirs.src.images + 'sprites/',
          imgDest: dirs.dist.images,
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
        init: true,
        imgSrc: true,
        imgOptimize: true,
        imgDest: true,
        cssSrc: true,
        cssDest: true,
        finish: true,
        reload: true
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
      concatVendorApp: true,    //if true, app.js and vendor.js are merged into app.js
      babel: {
        app: true,
        vendor: false,
        options: {
          presets: ['es2015'],
          plugins: []
        }
      },

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
      
      inject: {
        //receive stream and an object { comp, ...} (see the source injectorData for more)
        src: true,
        lint: false,
        lintFailAfterError: true,
        sourceMapsInit: true,
        babel: true,
        concat: true,
        sourceMapsWrite: true,
        minify: true,
        concatVendorApp: true,
        dest: true,
        finish: true,
        reload: true
      },

      dev: {
        inject: {
          minify: false
        }
      },

      prod: {
        sourceMaps: false,

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
      imagemin: {
        optimizationLevel: 3,
        progressive: true,
        interlaced: true
      },

      inject: {
        src: true,      //function must return: a stream (if cancels) or a glob array passed to the src
        limit: true,    //gulp-changed plugin
        optimize: true,
        dest: true,
        finish: true,
        reload: true
      },

      dev: {
        inject: {
          optimize: false
        }
      },

      prod: {

      },

      //compatibility fallback
      optimize: {}
    },


    views: {

      htmlmin: {
        collapseWhitespace: true
      },

      inject: {
        src: true,      //function must return: a stream (if cancels) or a glob array passed to the src
        limit: true,    //gulp-changed plugin
        optimize: true, //htmlmin
        dest: true,
        finish: true,
        reload: true
      },

      dev: {
        inject: {
          optimize: false
        }
      },

      prod: {
      },

      //compatibility fallback, to be removed
      common: {}
    },


    customDirs: {
      inject: {
        init: true,    //receives the object of custom directory definitions
        finish: true,  //receives an object: { streams, dirInfos } (array of streams, custom directory definitions)
        reload: true
      },
      dev: {
      },
      prod: {
      }
    },

    lint: {

      options: {
        extends: 'eslint:recommended',
        parserOptions: {
          ecmaVersion: 6
        },
        envs: ['browser', 'jquery'],
        globals: {
          //allowed global variables
        },
        rules: {
          //your ESLint rules here
        }
      },
      formatParams: [], //parameters passed to format function
      formatOnce: true, //use eslint.format() vs eslint.formatEach()

      inject: {
        src: true,
        lint: true,
        format: true,
        finish: true
      },

      dev: {
        options: {
          rules: {
            'no-console': 0
          }
        }
      },

      prod: {

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
        init: true  //overrides default browserSync run, must return a promise or stream
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
        //functions receive current glob array (incremental, containing previously added patterns) passed at the end to the del function
        init: true,
        cache: true,
        styles: true,
        sprites: true,
        fonts: true,
        js: true,
        images: true,
        views: true,
        custom: true,
        del: true,
        finish: true
      },

      dev: {
      },

      prod: {
        inject: {
          cache: false
        }
      }
    },

    watch: {
      inject: {
        init: true,
        styles: true,
        fonts: true,
        sprites: true,
        js: true,
        jsApp: true,
        jsVendor: true,
        images: true,
        views: true,
        finish: true
      },

      dev: {
      },

      prod: {
      }
    }
  }

  //parse cli args
  var optsConfig = {
    string: ['env'],
    boolean: ['prod', 'restart'],
    alias: {
      prod: 'p',
      restart: 'r'
    },
    default: {
      prod: process.env.NODE_ENV === 'production'
    }
  }
  var opts = minimist(process.argv.slice(2), optsConfig);
  config.main.isDev = !opts.prod && opts.env !== 'production';
  config.main.isRestart = opts.restart;

  //custom config file
  var noCustomFile = false;
  try {
    fs.accessSync(dirs.app + dirs.customConfig.configFile, fs.R_OK);
  }
  catch (ex) {
    noCustomFile = true;
    console.error('Frontend-starter warning: no custom config definitions file present (' + dirs.customConfig.configFile + ')');
  }

  //custom config file - require
  if (!noCustomFile) {
    require(dirs.app + dirs.customConfig.configFile)(config, dirs);
  }

  //compatibility falback
  if (config.clean.views === false) {
    //config.clean.inject.views = false;
    console.error('Frontend-starter error (deprecated): please rename "config.clean.views = false;" into "config.clean.inject.views = false;" in your ' + dirs.customConfig.configFile + ' file');
    process.exit(1);
  }

  return config;
}