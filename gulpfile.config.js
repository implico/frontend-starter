/**
  Frontend-starter

  @author Bartosz Sak
  
  https://github.com/implico/frontend-starter
  
  The MIT License (MIT)
  
  
  *******************
  Configuration file

*/

'use strict';

module.exports = function(dirs, appData) {

  var fs = require('fs'),
      path = require('path'),
      minimist = require('minimist');


  var config = {

    main: {
      isDev: null,
      isRestart: null
    },

    styles: {

      sourceMaps: false,
      sourceMapsRoot: '/src/styles/',

      // automatically resolve Bower/npm package by name, set to false to disable
      moduleImporter: {
        basedir: dirs.app
      },

      autoprefixer: {
        browsers: ['> 1%', 'last 3 versions', 'IE >= 11']
      },

      sass: {
      },

      cssnano: {
        safe: true
        // mergeIdents: false,
        // discardUnused: false
      },

      inject: {
        src: true,    //function must return: a stream (if cancels) or a glob array passed to the src
        sourceMapsInit: true,
        sassGlob: true,
        sass: true,
        autoprefixer: true,
        optimizeMediaQueries: false, //group-css-media-queries, disabled by default as unsafe
        optimize: true,             //cssnano
        sourceMapsWrite: true,
        dest: true,
        finish: true,
        reload: true
      },

      dev: {
        sourceMaps: true,
        sass: {
          outputStyle: 'expanded'
        },

        inject: {
          //autoprefixer: false,
          optimizeMediaQueries: false,
          optimize: false
        }
      },

      prod: {
      }
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

      auto: true,   //sprite items for directories not defined as an item will be automatically created with default parameters

      items: [
        //you can add more items (dirs), simply add an element
        {
          name: 'sprites',
          varPrepend: '',
          src: dirs.src.sprites + '*.*',  //all files in the sprites dir, excluding subdirs
          options: {
            algorithm: 'diagonal'
          }

          //all options - example of auto generation for name="name"
          //any option that was not set will be auto generated
          /*
          name: 'name',                                     //sprite base name, the only required parameter
          src: dirs.src.sprites + 'name/**' + '/*.*',       //source dir (concat used just to avoid comment ending)
          dest: dirs.dist.sprites.main,                     //dest dir, set to null to ignore
          varPrepend: 'name-',                              //prepended before SASS sprite variable name

          //Spritesmith options
          options: {
            imgName: 'name.png',                    //output sprite image name
            imgPath: '../img/name.png',             //path to the output image relative to the CSS file
            cssName: '_name.scss',                  //name of the output SASS file created in the styles dir
            cssSpritesheetName: 'spritesheet-name', //stylesheet is a SASS map containing info about all sprite images
            cssVarMap: function (sprite) {
              sprite.name = 'name-' + sprite.name;  //sprite variable builder
            }
          }
          */
        }
      ],

      inject: {
        init: true,         //receives itemInfos (sprite items definitions)
        src: true,          //this.taskData = { itemInfo } (current sprite item info)
        imgLimit: true,
        imgOptimize: true,
        imgDest: true,
        cssDest: true,
        finish: true,       //receives 2 arguments: output streams (array) and itemInfos (sprite items definitions)
        reload: true        //receives itemInfos (custom directory item definitions)
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
      sourceMaps: false,
      sourceMapsRoot: '/src/',
      concatVendorApp: true,    //if true, app.js and vendor.js are merged into app.js
      babel: {
        app: true,
        vendor: false,
        options: {
          presets: require.resolve('babel-preset-es2015-without-strict'),
          plugins: []
        }
      },

      webpack: {
        resolve: {
          modules: [
            path.join(path.normalize(dirs.app), 'node_modules')
          ],
          extensions: ['.js', '.json', '.jsx']
        },
        module: {
          rules: [
            {
              test: /\.(js|jsx)$/,
              exclude: /(node_modules|bower_components)/,
              use: {
                loader: require.resolve('babel-loader'),
                options: {
                  presets: [
                    [require.resolve('babel-preset-env'), {
                      'targets': {
                        'browsers': ['last 3 versions', 'safari >= 7', 'IE >= 11']
                      }
                    }]
                  ]
                }
              }
            }
          ]
        }
      },

      comps: {
        main: {
          filename: 'app',      //set to false to not produce any output file (for sub-comps); if not set, defaults to comp id
                                //.js extension added automatically unless the name contains a dot
                                //for webpack: enter a filename or glob, e.g. ['app', 'app2'] (.js extension appended automatically if dot not found)
          //filenameVendor: 'vendor',//if concatVendorApp is false, specifies the vendor filename

          bower: ['**/*.js'],   //set only name of the package
          vendor: ['**/*.js'],  //path relative to the appropriate directory
          app: ['**/*.js'],     //path relative to the appropriate directory
          webpack: false,       //disabled by default
          // webpack: ['app/**/*.js'],  //example webpack use, disables bower, vendor and app props

          //set prioritized paths (does not apply for webpack)
          priority: {
            vendor: [],
            app: []
          },

          //set other comp ids to include (does not apply for webpack)
          dependencies: [],

          //set comps to exclude all loaded scripts in other comps, e.g.
          //excludeIn: ['comp1', 'comp2'] //excluded in selected comps
          //excludeIn: true   //excluded in all other comps
          //excludeIn: false  //no exclusion
          //does not apply for webpack
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
        lint: false,              //run linter
        lintFailAfterError: true, //if true and lint is not canceled, fails the build if errored
        sourceMapsInit: true,
        webpack: true,            //applies only if webpack is enabled
        babel: true,              //ignored if webpack is enabled
        concat: true,             //ignored if webpack is enabled
        sourceMapsWrite: true,
        minify: true,
        concatVendorApp: true,    //on prepending vendor before app code, applies only if webpack is not enabled
        dest: true,
        finish: true,
        reload: true
      },

      dev: {
        sourceMaps: true,
        inject: {
          minify: false   //disable minify for dev
        }
      },

      prod: {
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

      }
    },


    views: {

      htmlmin: {
        collapseWhitespace: true,
        removeComments: true
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
      }
    },


    customDirs: {

      //additional custom dirs to watch and (optionally) copy
      items: [

        // //Example:
        // {
        //   name: '',  //optional, displayed in the console during watch
        //   src: dirs.src.main + 'custom/**/*',
        //   srcDot: false,   //whether to include files starting with a dot
        //   dest: dirs.dist.main + 'custom/'  //set to null to just watch the dir without copying (e.g. external backend views)

        //   inject: {
        //     //main task, receives stream and { dirInfo } as a second parameter
        //     src: true,   //function must return: a stream (if cancels) or a glob array passed to the src
        //     limit: true, //gulp-changed plugin
        //     dest: true,

        //     //watch task, receives undefined and { dirInfo } with id and definition as a second parameter
        //     watch: true,

        //     //clean task, receives current glob to delete (see the clean task injector docs) and { id, dirInfo } with id and definition as a second parameter
        //     //not needed to disable if "dest" is null
        //     clean: true
        //   }
        // }

      ],

      inject: {
        init: true,    //receives itemInfos (custom directory item definitions)
        finish: true,  //receives 2 arguments: output streams (array) and itemInfos (custom directory item definitions)
        reload: true   //receives itemInfos (custom directory item definitions)
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
          ecmaVersion: 6,
          sourceType: 'script', //set to 'module' for ES2015 imports
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
      }
    },

    clean: {

      inject: {
        //functions receive current glob array (incremental, containing previously added patterns) passed at the end to the del function
        init: true,
        cache: true,
        styles: true,
        spritesStyles: true,
        spritesImages: true,
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
      options: {},
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
    },

    custom: {
      //any custom config
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
    require(dirs.app + dirs.customConfig.configFile)(config, dirs, appData);
  }

  return config;
}
