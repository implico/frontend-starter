/**
  Frontend-starter

  @author Bartosz Sak, Archas
  
  https://github.com/implico/frontend-starter
  
  The MIT License (MIT)
  
  
  *******************
  Directory structure definitions file

*/

var path = require('path');


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
dirs.vendor = './bower_components/';  //change also .bowerrc
dirs.sassCache = './.sass-cache/';

dirs.app = './app/';

//custom app dir (optional)
try {
  require('./gulpfile.app.custom.js')(dirs);
}
catch (ex) {}


dirs.src.main = dirs.app + 'src/';

//custom src dir
try {
  require(dirs.app + 'gulpfile.dirs.custom.js')(dirs, 'src');
}
catch (ex) {}


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

//custom dist dir
try {
  require(dirs.app + 'gulpfile.dirs.custom.js')(dirs, 'dist');
}
catch (ex) {}


dirs.dist.styles = dirs.dist.main + 'css/';
dirs.dist.fonts = dirs.dist.styles + 'fonts/';
dirs.dist.js = dirs.dist.main + 'js/';
dirs.dist.img = dirs.dist.main + 'img/';
dirs.dist.views = dirs.dist.main;


//additional custom dirs to watch and (optionally) copy
dirs.custom = {
  //html5shiv: excluded in bower.json, copying manually (not necessarry in the app.js result file, included conditionally)
  html5shiv: {
    dev: true,
    prod: true,
    clean: false,
    from: [dirs.vendor + 'html5shiv/dist/html5shiv.min.js'],
    to: dirs.dist.js
  }
  
//Example:
//  your_dir_name: {
//    dev: true,    //set true if use also for dev tasks
//    clean: true,  //deletes the directory on clean task
//    from: dirs.src.main + 'custom/**/*',
//    to: dirs.dist.main + 'custom/'  //set to null to just watch the dir without copying (e.g. external backend views)
//  }
};


//custom dir modifications/definitions - optional
try {
  require(dirs.app + 'gulpfile.dirs.custom.js')(dirs, 'all');
}
catch (ex) {}


module.exports = dirs;
