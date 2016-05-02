# Frontend-starter

Frontend gulp builder. A prepared, configurable [gulp][gulp] environment available as a **global** package. Automatically produces clean and optimized output code. A perfect solution for any frontend work.

Development is based on fully customizable bundles, which modify the core configuration and provide directory structure. The [default bundle][bundle-default] adds [Bower][bower] support and useful [SASS][sass] mixins ([SASS-core][sass-core]).


## About

This is not another [Yeoman](http://yeoman.io/) or [Web Starter Kit](https://developers.google.com/web/tools/starter-kit/) - that's why the features tipical for these frameworks will be described further. This is also not an alternative for such tools like [Browserify](http://browserify.org/) or [webpack](https://webpack.github.io/) - in this area it just allows to build separate JavaScript packages (named comps), no AMD-like build-in support.

The framework is intended for use in small or medium size projects, including those that need be developed quickly, e.g in digital agencies. Produces optimized code, that contains usually single, minified JavaScript and CSS files.

What distinguishes this tool is basically:

* core, including tasks, separated from your project code (as a global Node.js package):
  - you can update it independently and use new features
  - create your own preconfigured starter-bundles, e.g. for AngularJS, React, Wordpress or just for specific project types (e.g. clients) with common configuration
  - you don't have to run `npm install` and wait years to initialize a project - just start coding
* fully customizable structure, ability to setup exact directory paths (e.g. source image files can be located in `~/Somewhere/On/The/Moon/`, dist HTML files in `../public_html` and JavaScript files in `dist/js`)
* by default, a **single** output JavaScript file is built (`app.js`), also for the dev environment (with source mapping):
  - adding any new file using [Bower][bower], manually placing any package into `vendor` dir (if you can't, don't have time or just don't want to use Bower) or creating your new source script, does not require any markup changes to include new file
  - you can, however, generate separate compositions, for example: a script consisting of jQuery (installed with Bower) and a `register.js` file (and mark the latter one as ignored in other scripts)
  - the output generation is optimized: vendor files are watched separately and cached, so if you change your own code these are just prepended
* as you know, the standard `gulp.watch` does not see any new files, just changes; this framework uses [gulp-watch], so new file will also trigger a task
* automatically creates sprites for defined directories (and you can use them responsively)
* `clean` task does not remove the whole dist directory, but handles them separately; that's why you can mix your framework assets with files from other sources (e.g. backend)
* provides keyboard shortcuts (Ctrl+...) while watching: rebuild, build production version, restart

Thanks to the above parameters, it is very easy to integrate with a backend application, including non-RESTful/SPAs (Single Page Applications).

The architecture, in few words, is as follows: when you invoke the main `frs [task]` command, the script runs [gulp] in the framework directory (so it uses the core `gulpfile.js`), but gets the assets from (and builds to) the directories defined in your configuration files. So you can consider it as a kind of [gulp.js][gulp] pipeline.

The result: you just develop fast. Modify/create new stylesheets or images and see your page automatically refreshing with changes. Put pictures into sprites dir and get all things done. Install or paste new JavaScript files and see the results instantly, with source maps. Use [Swig's][swig] template inheritance, includes and variables.


## Features
The framework provides the following functionality via [gulp][gulp] plugins:
* separate source and distribution directories (configurable path), watching for new/changed files using [gulp-watch]
* images: [imagemin][gulp-imagemin], [sprites][gulp-spritesmith]
* JS: [source maps][gulp-sourcemaps], [concatenation][gulp-concat], [compression][gulp-uglify], [JSHint][gulp-jshint], vendor dirs cache (concat only on change), custom packages (compositions)
* Styles: [SASS][sass] with [node-sass], [media queries with Breakpoint library][sass-breakpoint], source maps, [Autoprefixer][gulp-autoprefixer]; by default, use of [SASS-core][sass-core] (mixins and functions: automatic rem/vw/percentage unit converters for dimensions and fonts, responsive sprites)
* Views: [Swig template engine][swig] with [gulp-swig]
* Server: [Browsersync][browsersync] (automatic refreshing on every change)
* easy to integrate with MV* frameworks and backend apps (see the [bundles](#bundles))


## Installation
You need the following tools to start using the framework:
* [nodejs]
  - for Windows, use the [installer](https://nodejs.org/en/download/)
  - for Linux, the easiest way is to [install via package manager](https://nodejs.org/en/download/package-manager/)
* [gulp] - install [globally](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md#1-install-gulp-globally)


<br>
Then, install the framework globally:
```
npm install frontend-starter -g
```

If you use Visual Studio, close it while npm installs the modules.

Installation registers a `frs` command to run the tasks.


<a name="bundles"></a>
## Bundles
Use on of the available bundles (bootstrap configuration and asset structure) or create your own:

* [default bundle][bundle-default]
* AngularJS bundle (soon)


<br>
## CLI (tasks)
Use the following tasks from the command line:


### Dev build & watch together
`frs dev`

For your first run, or when you want to rebuild a clean dist version. This will run both `dev:build` and `dev:watch` tasks.



### Watch - the default task
`frs`
or
`frs dev:watch`

Gulp watches for any changes in your src directory and runs the appropiate task.



### Build
`frs dev:build`

Cleans and builds the dist version.



### Production
`frs prod`

Prepares a production build (minified resources).



### Production with preview
`frs prod:preview`

Same as `prod`, but additionally launches a Browsersync preview.



### Clean
`frs clean`

Cleans the dist directory.


### Restart
To restart the builder without opening a new Browsersync window in the browser, add a `-r` parameter for the tasks: default (`dev:watch`) and `dev`, e.g.

```
frs -r
frs dev -r
```


### Partial tasks
* common: `sprites`, `fonts`
* dev: `styles:dev`, `js:dev`, `images:dev`, `views:dev`, `custom-dirs:dev`, `browser-sync:dev`
* prod: `styles:prod`, `js:prod`, `images:prod`, `views:prod`, `custom-dirs:prod`, `browser-sync:prod`


### Keyboard shortcuts
While watching for changes (tasks: `frs`/`frs dev:watch` or `frs dev`), you can use the following shortcuts:
* Ctrl+P: to build the prod version (init `prod` task)
* Ctrl+D: to build the dev version (init `dev:build` task)
* Ctrl+R: to restart watching (without opening new Browsersync window in the browser)
* Ctrl+C: to exit



<br>
## Functionality

### Views, Styles (including fonts, sprites)

See your [bundle](#bundles) docs.


### JavaScript

You can use [Bower][bower], place any file into the `src/js/vendor` directory or create any file in `src/js`. By default, they will be merged into single `app.js` file (in the above order).

#### JavaScript compositions

You can generate separate JavaScript compositions, dependent on selected Bower, vendor and/or own script files. Let's say, that you want to create previously mentioned `register.js` file, that uses jQuery, `register.js` and `utilities.js` from the sources. We assume, that we don't want these files to be included in our main `app.js` file:

```js
config.js.common.comps.register = {
  filename: 'register', //set to false to not produce any output file (for sub-comps); if not set, defaults to comp id

  bower: [],                                  //set only name of the package
  vendor: [],                                 //just example, you don't have to define when not used
  app: ['utilities.js', 'register.js'],      //path relative to the appropriate directory

  //set prioritized paths
  priority: {
    vendor: [],
    app: ['utilities.js']   //this file will be included before register.js
  },

  //set other comp ids to include
  dependencies: ['jQuery'],

  //set comps to exclude all loaded scripts in other comps, e.g.
  //excludeIn: ['comp1', 'comp2']   //excluded in selected comps
  //excludeIn: true                 //excluded in all other comps
  //excludeIn: false                //no exclusion
  excludeIn: true,                  //here: we exclude it in any other comps

  watch: true  //not needed, watch blocked only if false
}

//we didn't include jQuery directly in the "register" comp, because in that case it would also be ignored in other comps
config.js.common.comps.jQuery: {
  filename: false,    //we don't want to create any output - this is just an auxiliary comp
  bower: ['jquery'],
  watch: false
}

```


### Images

Images are optimized (for production, [gulp-imagemin]) and copied into the dist directory.



### Custom directories

You can setup custom directories to watch (and optionally copy). For example, if you integrate the framework with backend that has own view templating system, set the appropriate directory to be watched. In this case, you will also probably need to set [Browsersync][browsersync] proxy (see the [default bundle][bundle-default] example configuration) to have your page refreshing on each time the view files change.


### Server
[Browsersync][browsersync] provides a simple HTTP server with auto-refreshing on each change.





<br>
<a name="configuration"></a>
## Directories and configuration
All configuration definitions are placed in core files: `gulpfile.dirs.js` and `gulpfile.config.js`. See the [default bundle][bundle-default] config files for common examples and the [dir](gulpfile.dirs.js) or [config](gulpfile.config.js) sources. It's very simple.

To change the defaults, edit the `fs.dirs.custom.js` and `fs.config.custom.js` files located in your bundle root directory.


### Directories
You can see the default definitons of each directory in the `gulpfile.dirs.js` file. The `fs.dirs.custom.js` is included in three stages:

* right after defining the src directory (so you can change it and the value will populate to src subdirectories like images, styles...)
* right after defining the dist directory (simiralry as in the previous case or for change some src directories)
* at the end (to change some dist directories or set custom dirs). See the [default bundle dir config][bundle-default-dir].


### Config object
See the `gulpfile.config.js` file. `config` object contains configuration parameters divided into key sections. Most of them have subsets, with options applied according to the environment mode: `common` (all), `dev` and `prod`.

* *styles*: sourcemap generation, [gulp-autoprefixer] and [gulp-sass] options
* *sprites*: you can generate multiple sprite files by adding subsequent elements to the `items` array
* *js*: sourcemap generation, minification, merging vendor and app into one file (true by default), scripts loading priority
* *views*: [gulp-swig] options
* *images*: [imagemin][gulp-imagemin] options
* *browserSync*: [Browsersync][browsersync] options
* *clean*: modify deletion options

See the [default bundle custom config][bundle-default-config].


<br>
## Source maps
Source maps allow you to bind concatenated/minified/compiled dist JS and SASS code with your src resources. Inspected elements and JS console messages will lead you to the actual source files, like SASS scripts. Follow these instructions to configure mapping:

1. Open Chrome Dev Tools.

2. Click the Sources tab and drag & drop the `src` folder to the console (alternatively right click on the dir structure on the left and choose "Add folder to workspace"). Confirm permission.

3. Go to the console settings (click the 3 dots in the upper right corner and then "Settings"), choose "Workspace" on the left and add a mapping for this folder:
  * left field (URL prefix): set to `http://[domain]/src`, e.g. `http://localhost/src/`
  * right field (folder path): set to `/`


Your app JS and SASS files are now mapped. Refresh the browser and you're done!

If you want to have mapping for Bower files, follow the same instructions for the `bower_components` dir. In the last point set the URL prefix to `http://[domain]/bower_components`, e.g. `http://localhost/bower_components`.


<br />
## Standalone (local) version

To use [gulp.js][gulp] directly, not through the `frs` command, clone this repo into a desired directory, run `npm install` and then directly `gulp [task]`. The framework will look for configuration files in the higher-level directory (`../`).


<br>
## TODO
* take advantage of [cssnano](https://github.com/ben-eb/cssnano), [HTMLMinifier](https://github.com/kangax/html-minifier)
* [Babel](https://babeljs.io/) support
* full task customization based on hooks (injected for every task step, allowing to modify or remove it)
* ability to register custom tasks with key shortcuts


<br>
## Known issues
* to be inspected: on Windows, when editing SASS scripts, the watcher sometimes blocks and does not see any changes (needs restarting by Ctrl+R); depends on [Chokidar][chokidar]
* as for now for partial tasks (`styles:dev`, `js:dev` etc.), after finishing the job the script does not exit (needs quitting manually by Ctrl+C)





[angularjs]: https://angularjs.org/
[browsersync]: https://www.browsersync.io/
[bower]: http://bower.io/
[bundle-default]: https://github.com/implico/fs-bundle-default
[bundle-default-dir]: https://github.com/implico/fs-bundle-default/blob/master/fs.dirs.custom.js
[bundle-default-config]: https://github.com/implico/fs-bundle-default/blob/master/fs.config.custom.js
[chokidar]: https://github.com/paulmillr/chokidar
[gulp]: http://gulpjs.com/
[gulp-autoprefixer]: https://github.com/sindresorhus/gulp-autoprefixer
[gulp-concat]: https://github.com/contra/gulp-concat
[gulp-imagemin]: https://github.com/sindresorhus/gulp-imagemin
[gulp-jshint]: https://github.com/spalger/gulp-jshint
[gulp-sass]: https://github.com/dlmanning/gulp-sass
[gulp-sourcemaps]: https://github.com/floridoo/gulp-sourcemaps
[gulp-spritesmith]: https://github.com/twolfson/gulp.spritesmith
[gulp-swig]: https://github.com/colynb/gulp-swig
[gulp-uglify]: https://github.com/terinjokes/gulp-uglify
[gulp-watch]: https://github.com/floatdrop/gulp-watch
[main-bower-files]: https://github.com/ck86/main-bower-files
[minimatch]: https://github.com/isaacs/minimatch
[nodejs]: https://nodejs.org/
[node-sass]: https://github.com/sass/node-sass
[sass]: http://sass-lang.com/
[sass-breakpoint]: http://breakpoint-sass.com/
[sass-core]: https://github.com/implico/sass-core
[swig]: http://paularmstrong.github.io/swig/
