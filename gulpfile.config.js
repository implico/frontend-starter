/**
  Frontend-starter

  @author Bartosz Sak, Archas
  
  https://github.com/implico/frontend-starter
  
  The MIT License (MIT)
  
  
  *******************
  Configuration file

*/


var path = require('path');

/* DIRS */

var dirs = {

  vendor: '',
  sassCache: '',

  src: {
    main: '',
    styles: {
      main: '',
      sprites: ''
    },
    fonts: '',

    js:  {
      main: '',
      vendor: ''
    },
    img: '',
    views: {
      main: '',
      layouts: '',
      scripts: ''
    },
  },

  dist: {
    main: '',
    styles: '',
    fonts: '',
    js: '',
    img: '',
    views: ''
  }
}


//src dirs
dirs.vendor = './vendor/';  //change also .bowerrc
dirs.sassCache = './.sass-cache/';

dirs.app = './app/';

dirs.src.main = dirs.app + 'src/';


dirs.src.styles.main = dirs.src.main + 'styles/';
dirs.src.styles.sprites = dirs.src.styles.main + '_partials/';

dirs.src.fonts = dirs.src.main + 'fonts/';

dirs.src.js.main = dirs.src.main + 'js/';
dirs.src.js.vendorDir = dirs.src.js.main + 'vendor/';
dirs.src.js.appDir = dirs.src.js.main;
//for JS, globs are used
dirs.src.js.vendor = [dirs.src.js.vendorDir + '**/*.js'];
dirs.src.js.app = [dirs.src.js.appDir + '**/*.js', '!' + dirs.src.js.vendorDir + '{,/**}'];

dirs.src.img = dirs.src.main + 'img/';

dirs.src.views.main = dirs.src.main + 'views/'; //set to a falsy value to drop views support
dirs.src.views.layouts = dirs.src.views.main + 'layouts/';
dirs.src.views.scripts = dirs.src.views.main + 'scripts/';


//dist dirs
dirs.dist.main = dirs.app + 'dist/';

dirs.dist.styles = dirs.dist.main + 'css/';
dirs.dist.fonts = dirs.dist.styles + 'fonts/';
dirs.dist.js = dirs.dist.main + 'js/';
dirs.dist.img = dirs.dist.main + 'img/';
dirs.dist.views = dirs.dist.main;


//additional custom dirs to watch and (optionally) copy
dirs.custom = [
  {
    //html5shiv: excluded in bower.json, copying manually (not necessarry in the app.js result file, included conditionally)
    dev: true,
    from: dirs.vendor + 'html5shiv/dist/html5shiv.min.js',
    to: dirs.dist.js
  }
  
  //Example:
//  {
//    dev: true,    //set true if use also for dev tasks
//    clean: true,  //deletes the directory on clean task
//    from: dirs.src.main + 'custom/**/*',
//    to: dirs.dist.main + 'custom/'  //set to null to just watch the dir without copying (e.g. external backend views)
//  }
  
];



/* CONFIG */

var config = {

  global: {
    globAdd: ['!./**/(*.tmp|*.crdownload)']  //applied to src globs: js, img, sprites
  },

  styles: {

    common: {
      sourcemaps: true,
      sourcemapsRoot: '/src/',

      autoprefixer: {
        browsers: ['> 1%', 'last 3 versions', 'IE 8']
      },

      sass: {
        //configFile: './config.rb',
        project: path.join(__dirname, '.'),
        css: dirs.dist.styles,
        sass: dirs.src.styles.main,
        image: dirs.src.img,
        font: dirs.dist.fonts
      }
    },

    dev: {

      sass: {
        style: 'expanded'
      }
    },

    prod: {

      sourcemaps: false,

      sass: {
        style: 'compressed'
      }
    }
  },

  sprites: {

    items: [
      //you can add more items (dirs), simply add an element
      {
        imgSource: dirs.src.img + 'sprites/',
        imgDest: dirs.dist.img,
        //additional options passed to the plugin
        options: {
          imgName: 'sprites.png',
          imgPath: '../img/sprites.png',
          cssName: '_sprites.scss',
        }
      }
    ]
  },

  js: {
    common: {
      sourcemaps: true,
      sourcemapsRoot: '/src/',
      minify: false,
      concatAppVendor: true,   //if true, app.js and vendor.js are merged into app.js
      
      //add script filenames/globs (relative to the appropriate dirs) to be loaded first
      priority: {
        vendor: {
          beforeBower: [],  //before bower components load
          afterBower: [],   //before dirs.src.js.vendor load (you usually need this one)
        },
        app: ['core.js']
      }
    },

    dev: {
    },

    prod: {
      sourcemaps: false,
      minify: true
    }
  },

  views: {

    common: {
      useTwig: true,
      twig: {
        base: dirs.src.views.layouts,
        data: {}
      }
    },

    dev: {
      twig: {

      }
    },

    prod: {
      twig: {

      }
    }
  },

  images: {
    imagemin: {
      optimizationLevel: 0,
      progressive: true,
      interlaced: true
    }
  },

  browserSync: {
    common: {
      enable: true,
      exitTimeout: 0, //time to pass to exit app after initializing Browsersync (optionally for prod preview)

      options: {
        //tip: set to [project-name].localhost and uncomment the "open: external" option
        host: 'localhost',
        //open: 'external',
        port: 80,
        reloadOnRestart: true,
        server: {
          baseDir: dirs.dist.main
        }
      }
    },

    dev: {

    },

    prod: {
      exitTimeout: 0
    }
  },

  clean: {
    //set to true for default config dir value, false to block deletion
    //or pass any glob pattern as an array (e.g. "styles: [dirs.dist.styles + 'style.css']" to delete only this one file)
    dist: true,
    styles: true,
    sprites: true,    //only true/false; set to false to block deletion of any generated by spritesmith SASS file in the src directory
    fonts: true,
    js: true,
    img: true,
    views: true,
    custom: true      //only true/false; set to false to block deletion of any custom dir
  }
}



module.exports = {
  config: config,
  dirs: dirs
}