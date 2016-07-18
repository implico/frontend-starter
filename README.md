# Frontend-starter

Frontend [gulp.js][gulp]-based (v4) build framework. A prepared, configurable environment available as a **global** package. Automatically produces clean and optimized output code. A perfect solution for any frontend work.

Development is based on fully customizable bundles (currently available only simple [default bundle][bundle-default]), which modify the core configuration and provide directory structure.


## About

This is not another [Yeoman](http://yeoman.io/) or [Web Starter Kit](https://developers.google.com/web/tools/starter-kit/) - that's why the features tipical for these frameworks will be described further. This is also not an alternative for such tools like [Browserify](http://browserify.org/) or [webpack](https://webpack.github.io/) - in this area it just allows to build separate JavaScript packages (in webpack - bundles, here called comps) - but you can still replace/adjust the `js` task to your needs.

The framework is intended for use in small or medium size projects, including those that need be developed quickly, e.g in digital agencies. Produces optimized code, that contains usually single, minified JavaScript and CSS files.

What distinguishes this tool is basically:

* core, including tasks, separated from your project code (as a global Node.js package):
  - you can update it independently and use new features
  - create your own preconfigured starter-bundles, e.g. for AngularJS, React, Wordpress or just for specific project types (e.g. clients) with common configuration
  - you don't have to run `npm install` and wait to initialize a project - just start coding
  - after some time you can go back to an old or other developer's project and use the same API
* fully customizable structure, ability to setup exact directory paths (e.g. source image files can be located in `~/Somewhere/On/The/Moon/`, dist HTML files in `../public_html` and JavaScript files in `dist/js`)
* by default, a **single** output JavaScript file is built (`app.js`), also for the dev environment (with source mapping):
  - adding any new file using [Bower][bower], manually placing any package into `vendor/js` dir (if you can't, don't have time or just don't want to use Bower) or creating your new source script, does not require any markup changes to include new file
  - you can, however, generate separate compositions, for example: a script consisting of jQuery (installed with Bower) and a `register.js` file (and mark the latter one as ignored in other scripts)
  - the output generation is optimized: vendor files are watched separately and cached, so if you change your own code these are just prepended
* automatically creates separate sprite images for `src/sprites` subdirectories (and you can use them responsively)
* `clean` task does not remove the whole dist directory, but handles them separately; that's why you can mix your framework assets with files from other sources (e.g. backend)
* provides keyboard shortcuts (Ctrl+...) while watching: rebuild, build production version, lint

Thanks to the above parameters, it is very easy to integrate with a backend application, including classic, non-RESTful/SPAs (Single Page Applications).

The architecture, in few words, is as follows: when you invoke the main `frs [task]` command, the script runs [gulp] in the framework directory (so it uses the core `gulpfile.js`), but gets the assets from (and builds to) the directories defined in your configuration files. So you can consider it as a kind of [gulp][gulp] pipeline.

The result: you just develop fast. Modify/create new stylesheets or images and see your page automatically refreshing with changes. Put pictures into sprites dir and get all things done. Install or paste new JavaScript files and see the results instantly, with source maps.


## Features

The framework provides the following functionality via [gulp][gulp] plugins:
* Separate source and distribution directories (configurable path), watching for new/changed files
* Images: [imagemin][gulp-imagemin] for optimization, [spritesmith][gulp-spritesmith] for sprites
* JS: [source maps][gulp-sourcemaps] ([read about](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/)), [concatenation][gulp-concat] into one file, [compression][gulp-uglify], [ESLint][eslint] to check your code quality, [Babel][babel] to provide ES2015 (AKA ES6) support, vendor dirs cache (concat only on change), custom file compositions
* Styles: [SASS][sass] preprocessor with [node-sass], [source maps](http://thesassway.com/intermediate/using-source-maps-with-sass), [Autoprefixer][gulp-autoprefixer] to handle vendor CSS prefixes, [sass-glob] to use globs in SASS imports, optimization: [group-css-media-queries][gulp-group-css-media-queries] (media queries optimization by grouping - disabled by default as unsafe) and [cssnano][gulp-cssnano] (with only safe optimisations by default). The [default bundle][bundle-default] comes additionally with [Breakpoint library][sass-breakpoint] to handle media queries easily and [SASS-core][sass-core] with responsive mixins and functions
* Views: optimized with [htmlmin][gulp-htmlmin]
* Server: [Browsersync][browsersync], providing automatic refresh on every change
* Easy to integrate with MV* frameworks and backend apps (see the [bundles](#bundles))


## Installation

You need the following tools to start using the framework:
* [Node.js][nodejs]
  - for Windows, use the [installer](https://nodejs.org/en/download/)
  - for Linux, the easiest way is to [install via package manager](https://nodejs.org/en/download/package-manager/)
* [gulp.js][gulp] - install [globally](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md#1-install-gulp-globally)


<br>

Then, install the framework globally:

```
npm install frontend-starter -g
```

If you are experiencing any problems during installation, you probably have to update your Node.js (recommended [nvm](https://github.com/creationix/nvm), then use the latest Node.js version) and [npm](https://docs.npmjs.com/getting-started/installing-node). In some cases system restart may be needed before installation. If you use Visual Studio, close it while npm installs the modules.

Installation registers an `frs` command to run the tasks.


<a name="bundles"></a>
## Bundles

Use on of the available bundles (bootstrap configuration and asset structure) or create your own:

* [default bundle][bundle-default]
* AngularJS bundle (soon)


<br>

## CLI (tasks)
Use the following tasks from the command line:


### Build & watch together
`frs start`

For your first run, or when you want to rebuild a clean dist version. This will run both `build` and `watch` tasks.



### Watch - the default task
`frs`
or
`frs watch`

Gulp watches for any changes in your src directory and runs the appropiate task.



### Build
`frs build`

Cleans and builds the dist version.



### Lint
`frs lint`

Runs a linter (currently only [ESLint][eslint]).



### Clean
`frs clean`

Cleans the dist directory.



### Production
`frs build -p`

Add the `-p` parameter to any task, to get the optimized version. Or set `NODE_ENV` variable to `production` (e.g. `$ NODE_ENV=production frs build`).



### Restart
To restart the builder without opening a new Browsersync window in the browser, add a `-r` parameter for the tasks: default (`watch`) and `start`, e.g.

```
frs -r
frs start -r
```


### Partial tasks
`styles`, `sprites`, `fonts`, `js`, `images`, `views`, `custom-dirs`, `browser-sync`


### Keyboard shortcuts
While watching for changes (tasks: `frs`/`frs watch` or `frs start`), you can use the following shortcuts:
* Ctrl+P: to build the production version (init `build -p` task)
* Ctrl+D: to build the development version (init `build` task)
* Ctrl+L: to run lint (init `lint` task)
* Ctrl+C: to exit



<br>

## Functionality

### Styles, Fonts, Views

See your [bundle](#bundles) docs.


### Sprites
All files placed in the sprites directory will be merged into one sprite image (by default - `sprites.png`). To create more than one sprite bundle, place them in separate directories (directory name will be the output sprite filename by default). Example usage:

```
/src/sprites/home/
  icon-1.png
  icon-2.png
/src/sprites/contact/
  icon-1.png
  icon-2.png
/src/sprites/ (root dir)
  icon-1.png
  icon-2.png
```

This will generate sprite files in `/dist/img/` directory: `home.png`, `contact.png` and `sprites.png`. To use a sprite in your stylesheets, include the generated SASS file(s) and then use the mixins:

```sass
//to get /src/sprites/home/icon-1.png
@include sprite($home-icon-1);

//to get /src/sprites/contact/icon-2.png
@include sprite($contact-icon-2);

//to get /src/sprites/icon-1.png
@include sprite($icon-1);
```

As you can see, by default each Spritesmith generated sprite variable has a prefix equal to the directory name (except for the root dir, that has none).

You can customize any of the directories options, by adding an item explicitly in the config file. For example, this will disable a variable prefix for sprites from `/home` directory (so you can use it like it was in the root):

```
config.sprites.items.push({
  name: 'home',
  varPrepend: ''
}
```

See more in the [default bundle example configuration][bundle-default-config].


### JavaScript

For third-party scripts, you can use [Bower][bower] or place any file in the `/vendor/js` directory. For your own code, just create any file in `src/js`. By default, all of them will be merged into single `app.js` file (in the above order).

#### JavaScript compositions

You can generate separate JavaScript compositions, dependent on selected Bower, vendor and/or own (app) script files. Let's say, that you want to create `register.js` output file, that uses jQuery, `register.js` and `utilities.js` from the sources. We assume, that we don't want these files to be included in our main `app.js` file:

```js
config.js.comps.register = {
  filename: 'register', //set to null to not produce any output file (for sub-comps); if not set, defaults to comp id

  bower: [],                                  //set only name of the package
  vendor: [],                                 //just example, you don't have to define when not used
  app: ['utilities.js', 'register.js'],       //path relative to the appropriate directory

  //set prioritized paths
  priority: {
    vendor: [],
    app: ['utilities.js']   //this file will be included before register.js
  },

  //set other comp ids to include
  dependencies: ['jQuery'],

  //exclude (ignore) all loaded here scripts in other comps, e.g.
  //excludeIn: ['comp1', 'comp2']   //excluded in selected comps
  //excludeIn: true                 //excluded in all other comps
  //excludeIn: false                //no exclusion
  excludeIn: true,                  //here: we exclude it in any other comps

  watch: true  //not needed, watch blocked only if false
}

//we didn't include jQuery directly in the "register" comp, because in that case it would also be ignored in other comps
config.js.comps.jQuery: {
  filename: null,    //we don't want to create any output - this is just an auxiliary comp
  bower: ['jquery'],
  watch: false
}

```


### Images

Images are optimized (for production, [gulp-imagemin]) and copied into the dist directory.


### Custom directories

You can setup custom directories to watch (and optionally copy). For example, if you integrate the framework with backend that has own view templating system, set the appropriate directory to be watched. In this case, you will also probably need to set [Browsersync][browsersync] proxy (see the [default bundle][bundle-default] example configuration) to use the original server (like Apache) but have your page being refreshed on each time the view or any other files change.

Example - watch and copy contents of "php" dir from src to dist:

```js
config.customDirs.items.push({
  name: 'php views',  //optional, displayed in the console during watch
  src: dirs.src.main + 'php/**/*.php',
  dest: dirs.dist.main + 'php/',  //set to null to just watch the dir without copying (e.g. external backend views)
});
```


### Server
[Browsersync][browsersync] provides a simple HTTP server with auto-refreshing on each change.





<br>

<a name="configuration"></a>
## Directories and configuration

All configuration definitions are placed in core files: [gulpfile.dirs.js](gulpfile.dirs.js) and [gulpfile.config.js](gulpfile.config.js). See the [default bundle][bundle-default] config files for common examples and the [dir](gulpfile.dirs.js) or [config](gulpfile.config.js) sources for full list of options. It's very simple.

To change the defaults, edit the `frs.dirs.js`, `frs.config.js` and `frs.tasks.js` files located in your bundle root directory.


### Directories

You can see the default definitons of each directory in the [gulpfile.dirs.js](gulpfile.dirs.js) file. The `frs.dirs.js` is included in two stages:

* right after defining the src and dist directory (so you can change it and the value will populate to subdirectories like images, styles...)
* at the end (to change particular src/dist directories). See the [default bundle dir config][bundle-default-dir].


### Config object

See the [gulpfile.config.js](gulpfile.config.js) file. `config` object contains configuration parameters divided into key sections. Use the subsets to target specific environment mode: `dev` and `prod`.

* *styles*: sourcemap generation, [gulp-autoprefixer], [gulp-sass] and [gulp-cssnano] options
* *sprites*: you can customize sprite files by adding subsequent elements to the `items` array
* *js*: sourcemap generation, minification, merging vendor and app into one file (true by default), scripts loading priority
* *images*: [imagemin][gulp-imagemin] options
* *views*: [gulp-htmlmin] options
* *customDirs*: custom, additional directories (to watch/copy)
* *browserSync*: [Browsersync][browsersync] options
* *clean*: modify deletion options

See the [default bundle custom config][bundle-default-config] for examples.

#### Customizing core tasks

Each gulp pipeline step has a kind of hook, that allows to inject own code and/or disable default stream transformation. Consider the following configuration code for `styles` task:

```js
var config = {
  // (...)
  styles: {
    // (...)
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
      // (...)
      inject: {
        optimizeMediaQueries: false,
        optimize: false
      }
    }
// (...)

```

To remove any of above steps, set the inject config value to `false`:

```js
config.styles.inject.optimize = false;
```

To add any transformation before the step, or replace it, assign it to a function:

```js
var cleanCss = require('gulp-clean-css');
config.styles.inject.optimize = function(stream) {
  // stream: current stream
  stream = stream.pipe(cleanCss());

  // return stream;   //if you don't want to cancel the original step

  // but we want to cancel the default step (cssnano)
  return this.cancel(stream);
}
```

This replaces [gulp-cssnano] with [gulp-clean-css](https://github.com/scniro/gulp-clean-css) (you have to run `npm install gulp-clean-css --save-dev` first).


The `src` injects are handled a bit differenlty. The function obtains a glob array to be passed to the `gulp.src`. If the default step is canceled, the return value is considered as an input stream (unless it is falsy - then the whole task is canceled). In other case, the returned value must be a glob (e.g. you can change the default one), that will be used by `gulp.src`.

For the `clean` task, the inject function receives current glob array with paths to be removed (assigned incrementally).

Available properties available from within the inject function are:

- `this.task`: task name
- `this.appData`: an object `{ dirs, config, app, tasks, taskReg, gulp, browserSync }`
- `this.taskParams`: an object with task paramters (common param for all tasks is `isWatch` that indicates that it was called by the watcher; see the tasks source for other params, defined at the beginning of the run method)
- `this.taskData`: an object created for some tasks with additional info:
  - `sprites`: `{ itemInfo }` (current item config object)
  - `js`: `{ comp, filename, filenameVendor, vendorDir }` (current internal comp object, not the comp config definition)
  - `customDirs`: `{ dirInfo }` (current item config object)
- `this.isDev`: indicates whether dev or prod mode


### Adding/removing tasks

All tasks to be registered in gulp are organized in the `taskReg` object. Consider the following example definition that may be placed in the `frs.tasks.js` file:

```js
appData.taskReg['mytask'] = {
  fn() {
    var stream = appData.gulp.src(appData.dirs.src.images)
      .pipe(appData.gulp.dest('/some-dir'));

    //you can also access config, e.g. check if dev vs. prod mode
    //console.log(appData.config.main.isDev);

    //currently all tasks must return a promise
    return appData.app.streamToPromise(stream);
  },
  deps: ['clean', ['js', 'views']],

  // blockQuitOnFinish: true  //set this option only for persistent tasks like watching for changes (by default any task function is wrapped to ensure process quitting)
}
```

This adds `mytask` task, that copies contents of images dir to somewhere.

The `deps` is an array of tasks invoked before. It follows the [run-sequence](https://github.com/OverZealous/run-sequence#usage) convention: by default tasks are run synchronously (one by one), but placing them in an array will allow to run asynchronously (at once). In the above example, `js` and `views` will run in parallel after `clean` is complete. This notation is converted internally to gulp 4's [series](https://github.com/gulpjs/gulp/blob/4.0/docs/API.md#gulpseriestasks)/[parallel](https://github.com/gulpjs/gulp/blob/4.0/docs/API.md#gulpparalleltasks).

To add a task as a dependency to an existing task, use the helper:

```js
//appData.app.taskRegUtils.addDep(taskToAdd, targetTask, relatedTask, isBefore);
appData.app.taskRegUtils.addDep('mytask', 'build', 'images', true);
```

The above code adds `mytask` to the `build` pipeline, before `images` (last parameter defines the placement, for false it would be placed after).

To replace the original (core) task, just override its `appData.taskReg` definition.

To remove a core task, or remove a dependency, use the helpers:

```js
// removes views task (and from all tasks' depenedencies)
appData.app.taskRegUtils.removeTask('views');

// removes images dependency from build task
appData.app.taskRegUtils.removeDep('images', 'build');

// removes images dependency from any task
appData.app.taskRegUtils.removeDep('images', true);
```

See the core tasks registry definitions in [gulpfile.tasks.js](gulpfile.tasks.js).





<br>

## Source maps

Source maps allow you to bind concatenated/minified/compiled distribution JS and SASS code with your sources. Inspected elements and JS console messages will lead you to the actual source files, like SASS scripts. Follow these instructions to configure mapping:

1. Open Chrome Dev Tools.

2. Click the Sources tab and drag & drop the `src` folder to the console (alternatively right click on the dir structure on the left and choose "Add folder to workspace"). Confirm permission.

3. Go to the console settings (click the 3 dots in the upper right corner and then "Settings"), choose "Workspace" on the left and add a mapping for this folder:
  * left field (URL prefix): set to `http://[domain]/src`, e.g. `http://localhost/src/`
  * right field (folder path): set to `/`


Your app JS and SASS files are now mapped. Refresh the browser and you're done!

If you want to have mapping for Bower files, follow the same instructions for the `bower_components` dir. In the last point set the URL prefix to `http://[domain]/bower_components`, e.g. `http://localhost/bower_components`.


<br />

## Standalone (local) version

To use [gulp.js][gulp] directly, not through the `frs` command, clone this repo into a desired directory, run `npm install` and then directly `gulp [task]`. The framework will look for configuration files in the parent directory (`../`).


<br>

## TODO

- [x] take advantage of [cssnano][gulp-cssnano], [htmlmin][gulp-htmlmin]
- [x] supporting [Babel][babel]
- [x] full task customization based on hooks (injected for every task step, allowing to modify or remove it)
- [x] ability to register custom tasks
- [ ] custom tasks key shortcuts
- [ ] unit tests task
- [ ] unit tests for the framework
- [ ] plugins API



<br>

## Known issues

* to be inspected: on Windows, when editing SASS scripts, the watcher sometimes blocks and does not see any changes (needs restart); depends on [Chokidar][chokidar]





[angularjs]: https://angularjs.org/
[browsersync]: https://www.browsersync.io/
[babel]: https://babeljs.io/
[bower]: http://bower.io/
[bundle-default]: https://github.com/implico/frs-bundle-default
[bundle-default-dir]: https://github.com/implico/frs-bundle-default/blob/master/frs.dirs.js
[bundle-default-config]: https://github.com/implico/frs-bundle-default/blob/master/frs.config.js
[chokidar]: https://github.com/paulmillr/chokidar
[eslint]: http://eslint.org/
[gulp]: http://gulpjs.com/
[gulp-autoprefixer]: https://github.com/sindresorhus/gulp-autoprefixer
[gulp-concat]: https://github.com/contra/gulp-concat
[gulp-cssnano]: https://github.com/ben-eb/gulp-cssnano
[gulp-imagemin]: https://github.com/sindresorhus/gulp-imagemin
[gulp-group-css-media-queries]: https://github.com/avaly/gulp-group-css-media-queries
[gulp-eslint]: https://github.com/adametry/gulp-eslint
[gulp-htmlmin]: https://github.com/jonschlinkert/gulp-htmlmin
[gulp-sass]: https://github.com/dlmanning/gulp-sass
[gulp-sourcemaps]: https://github.com/floridoo/gulp-sourcemaps
[gulp-spritesmith]: https://github.com/twolfson/gulp.spritesmith
[gulp-swig]: https://github.com/colynb/gulp-swig
[gulp-uglify]: https://github.com/terinjokes/gulp-uglify
[main-bower-files]: https://github.com/ck86/main-bower-files
[minimatch]: https://github.com/isaacs/minimatch
[nodejs]: https://nodejs.org/
[node-sass]: https://github.com/sass/node-sass
[sass]: http://sass-lang.com/
[sass-breakpoint]: http://breakpoint-sass.com/
[sass-core]: https://github.com/implico/sass-core
[sass-glob]: https://github.com/tomgrooffer/gulp-sass-glob
[swig]: http://paularmstrong.github.io/swig/
