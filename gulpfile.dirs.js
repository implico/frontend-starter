/**
  Frontend-starter

  @author Bartosz Sak
  
  https://github.com/implico/frontend-starter
  
  The MIT License (MIT)
  
  
  *******************
  Directory structure definitions file

*/

'use strict';

var path = require('path'),
    fs   = require('fs');


module.exports = function(appDir) {

  var dirs = {

    root: '',
    cache: '',

    app: '',
    bower: '',
    vendor: '',

    lib: {
      main: '',
      tasks: ''
    },

    customConfig: {
      dirsFile: '',
      configFile: '',
      tasksFile: ''
    },

    src: {
      main: '',
      styles: '',
      fonts: '',
      sprites: {
        main: '',
        styles: ''
      },

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
  dirs.customConfig.dirsFile = 'frs.dirs.js';
  dirs.customConfig.configFile = 'frs.config.js';
  dirs.customConfig.tasksFile = 'frs.tasks.js';

  dirs.app = appDir;

  dirs.lib.main = dirs.root + 'lib/';
  dirs.lib.tasks = dirs.lib.main + 'tasks/';

  dirs.cache = dirs.app + '.cache/';
  dirs.bower = dirs.app + 'bower_components/';  //change also .bowerrc
  dirs.vendor = dirs.app + 'vendor/';

  //main src/dist dirs
  dirs.src.main = dirs.app + 'src/';
  dirs.dist.main = dirs.app + 'dist/';

  //custom main src/dist dirs - check if exists
  try {
    fs.accessSync(dirs.app + dirs.customConfig.dirsFile, fs.R_OK);
  }
  catch (ex) {
    console.error('Frontend-starter error: no custom dir definitions file present (' + dirs.customConfig.dirsFile + ') - check if running in project directory.');
    process.exit(1);
  }

  //custom main src/dist dirs - require
  require(dirs.app + dirs.customConfig.dirsFile)(dirs, 'main');


  //src subdirs
  dirs.src.styles = dirs.src.main + 'styles/';

  dirs.src.fonts = dirs.src.main + 'fonts/';

  dirs.src.sprites.main = dirs.src.main + 'sprites/';
  dirs.src.sprites.styles = dirs.src.styles + 'sprites/';

  dirs.src.js.main = dirs.src.main + 'js/';
  dirs.src.js.vendor = dirs.vendor + 'js/';
  dirs.src.js.app = dirs.src.js.main;

  dirs.src.images = dirs.src.main + 'img/';

  dirs.src.views = dirs.src.main + 'views/';


  //dist subdirs
  dirs.dist.styles = dirs.dist.main + 'css/';
  dirs.dist.fonts = dirs.dist.styles + 'fonts/';
  dirs.dist.js = dirs.dist.main + 'js/';
  dirs.dist.images = dirs.dist.main + 'img/';
  dirs.dist.sprites = dirs.dist.images;

  dirs.dist.views = dirs.dist.main;


  //custom src/dist subdir modifications
  require(dirs.app + dirs.customConfig.dirsFile)(dirs, 'sub');


  return dirs;
}
