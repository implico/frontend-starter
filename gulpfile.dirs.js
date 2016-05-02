/**
  Frontend-starter

  @author Bartosz Sak, Archas
  
  https://github.com/implico/frontend-starter
  
  The MIT License (MIT)
  
  
  *******************
  Directory structure definitions file

*/

var path = require('path'),
    fs   = require('fs');


module.exports = function(appDir) {

  var dirs = {

    root: '',
    cache: '',

    tasks: '',

    app: '',
    bower: '',

    customConfig: {
      dirsFile: '',
      configFile: ''
    },

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

  dirs.root = __dirname + '/';

  //custom config files
  dirs.customConfig.dirsFile = 'frs.dirs.custom.js';
  dirs.customConfig.configFile = 'frs.config.custom.js';

  dirs.tasks = './tasks/';

  dirs.app = appDir;

  dirs.cache = dirs.app + '.cache/';
  dirs.bower = dirs.app + 'bower_components/';  //change also .bowerrc

  dirs.src.main = dirs.app + 'src/';

  //custom src dir - check if exists
try {
    fs.accessSync(dirs.app + dirs.customConfig.dirsFile, fs.R_OK);
  }
  catch (ex) {
    try {
      fs.accessSync(dirs.app + 'fs.dirs.custom.js', fs.R_OK);
      console.error('Frontend-starter error: PLEASE RENAME fs.dirs.custom.js to ' + dirs.customConfig.dirsFile + ' and fs.config.custom.js to ' + dirs.customConfig.configFile);
    }
    catch (err) {
      console.error('Frontend-starter error: no custom dir definitions file present (' + dirs.customConfig.dirsFile + ') - check if running in project directory.');
    }
    process.exit(1);
  }

  //custom src dir - require
  require(dirs.app + dirs.customConfig.dirsFile)(dirs, 'src');


  dirs.src.styles.main = dirs.src.main + 'styles/';
  dirs.src.styles.sprites = dirs.src.styles.main + 'sprites/';

  dirs.src.fonts = dirs.src.main + 'fonts/';

  dirs.src.js.main = dirs.src.main + 'js/';
  dirs.src.js.vendor = dirs.src.js.main + 'vendor/';
  dirs.src.js.app = dirs.src.js.main;

  dirs.src.img = dirs.src.main + 'img/';

  dirs.src.views.main = dirs.src.main + 'views/'; //set to a falsy value to drop views support
  dirs.src.views.layouts = dirs.src.views.main + 'layouts/';
  dirs.src.views.scripts = dirs.src.views.main + 'scripts/';


  //dist dirs
  dirs.dist.main = dirs.app + 'dist/';

  //custom dist dir
  require(dirs.app + dirs.customConfig.dirsFile)(dirs, 'dist');


  dirs.dist.styles = dirs.dist.main + 'css/';
  dirs.dist.fonts = dirs.dist.styles + 'fonts/';
  dirs.dist.js = dirs.dist.main + 'js/';
  dirs.dist.img = dirs.dist.main + 'img/';
  dirs.dist.views = dirs.dist.main;


  //additional custom dirs to watch and (optionally) copy
  dirs.custom = {
  //Example:
  //  your_dir_id: {
  //    dev: true,    //set true if use also for dev tasks
  //    clean: true,  //deletes the directory on clean task
  //    from: dirs.src.main + 'custom/**/*',
  //    to: dirs.dist.main + 'custom/'  //set to null to just watch the dir without copying (e.g. external backend views)
  //  }
  };


  //custom dir modifications/definitions - optional
  require(dirs.app + dirs.customConfig.dirsFile)(dirs, 'all');


  return dirs;
}
