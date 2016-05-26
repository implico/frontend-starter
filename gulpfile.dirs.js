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

    app: '',
    bower: '',

    lib: {
      main: '',
      tasks: ''
    },

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
      images: '',
      views: '',
    },

    dist: {
      main: '',
      styles: '',
      fonts: '',
      js: '',
      images: '',
      views: ''
    }
  }

  dirs.root = __dirname + '/';
  dirs.rootModules = dirs.root + 'node_modules/';

  //custom config files
  dirs.customConfig.dirsFile = 'frs.dirs.custom.js';
  dirs.customConfig.configFile = 'frs.config.custom.js';

  dirs.app = appDir;

  dirs.lib.main = dirs.root + 'lib/';
  dirs.lib.tasks = dirs.lib.main + 'tasks/';

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

  dirs.src.images = dirs.src.main + 'img/';
  //compatibility fallback, to be removed
  dirs.src.img = dirs.src.images;

  dirs.src.views = dirs.src.main + 'views/';


  //dist dirs
  dirs.dist.main = dirs.app + 'dist/';

  //custom dist dir
  require(dirs.app + dirs.customConfig.dirsFile)(dirs, 'dist');


  dirs.dist.styles = dirs.dist.main + 'css/';
  dirs.dist.fonts = dirs.dist.styles + 'fonts/';
  dirs.dist.js = dirs.dist.main + 'js/';
  dirs.dist.images = dirs.dist.main + 'img/';
  //compatibility fallback, to be removed
  dirs.dist.img = dirs.dist.images;

  dirs.dist.views = dirs.dist.main;


  //additional custom dirs to watch and (optionally) copy
  dirs.custom = {

    // //Example:
    // my_dir: {
    //   from: dirs.src.main + 'custom/**/*',
    //   to: dirs.dist.main + 'custom/'  //set to null to just watch the dir without copying (e.g. external backend views)

    //   inject: {
    //     //main task, receives stream and { id: dirName, dirInfo: dirInfo } as a second parameter
    //     src: null,   //function must return: a stream (if canceled) or a glob array passed to the src
    //     limit: null, //gulp-changed plugin
    //     dest: null,

    //     //clean task, receives current glob to delete (see the clean task injector docs) and { id, dirInfo } with id and definition as a second
    //     //not needed to disable if "to" is null
    //     clean: null
    //   }
    // }

  };


  //custom dir modifications/definitions - optional
  require(dirs.app + dirs.customConfig.dirsFile)(dirs, 'all');


  return dirs;
}
