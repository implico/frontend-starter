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
dirs.src.styles.sprites = dirs.src.styles.main + 'sprites/';

dirs.src.fonts = dirs.src.main + 'fonts/';

dirs.src.js.main = dirs.src.main + 'js/';
dirs.src.js.vendor = dirs.src.js.main + 'vendor/';
dirs.src.js.mainGlob = [dirs.src.js.main + '**/*.js', '!{' + dirs.src.js.vendor + ',' + dirs.src.js.vendor + '**}'];

dirs.src.img = dirs.src.main + 'img/';

dirs.src.views.main = dirs.src.main + 'views/';
dirs.src.views.layouts = dirs.src.views.main + 'layouts/';
dirs.src.views.scripts = dirs.src.views.main + 'scripts/';


//dist dirs
dirs.dist.main = dirs.app + 'dist/';

dirs.dist.styles = dirs.dist.main + 'css/';
dirs.dist.fonts = dirs.dist.styles + 'fonts/';
dirs.dist.js = dirs.dist.main + 'js/';
dirs.dist.img = dirs.dist.main + 'img/';
dirs.dist.views = dirs.dist.main;




/* CONFIG */

var config = {

  styles: {

    common: {
      sourcemaps: true,

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
      minify: false,
      concatAppVendor: true   //if true, app.js and vendor.js are concatenated into app.js
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
      twig: {
        base: dirs.src.views.layouts
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
      progessive: true,
      interlaced: true
    }
  },

  browserSync: {
    options: {
      host: 'localhost',
      port: 80,
      reloadOnRestart: true,
      server: {
        baseDir: dirs.dist.main
      }
    }
  }
}



module.exports = {
  config: config,
  dirs: dirs
}