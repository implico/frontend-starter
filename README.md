# Frontend-starter

Frontend gulp builder. This is (just?) a prepared, configurable [gulp][gulp] environment. Automatically produces clean and optimized output code. A perfect solution for any frontend work, especially landing pages. Very easy to integrate with any backend environment.

Development is based on fully configurable bundles, which modify the core configuration and provide directory structure. The [default bundle][bundle-default] adds [Bower][bower] support and useful [SASS][sass] mixins ([SASS-core][sass-core]).


## Features
The framework provides the following functionality via [gulp][gulp] plugins:
* separate source and distribution directories (configurable path), watching for new/changed files using [gulp-watch]
* images: [imagemin][gulp-imagemin], [sprites][gulp-spritesmith]
* JS: [source maps][gulp-sourcemaps], [concatenation][gulp-concat], [compression][gulp-uglify], [JSHint][gulp-jshint], vendor dirs cache (concat only on change)
* Styles: [SASS][sass] with [node-sass], [media queries with Breakpoint library][sass-breakpoint], source maps, [Autoprefixer][gulp-autoprefixer]; by default, use of [SASS-core][sass-core] (mixins and functions: automatic rem/vw/percentage unit converters for dimensions and fonts, responsive sprites)
* Views: [Swig template engine][swig] with [gulp-swig]
* Server: [Browsersync][browsersync] (automatic refreshing on every change)
* easy to integrate with MV* frameworks and backend apps (see the [bundles](#bundles))


## Installation
You need the following tools to start using the framework:
* [nodejs]
* [gulp]

<br>
Then, install the framework globally:
```
npm install frontend-starter -g
```

If you use Visual Studio, close it while npm installs the modules.

Installation registers a `frs` command to run the tasks. This is just a kind of pipeline to execute gulp in proper directories.


<a name="bundles"></a>
## Bundles
Use on of the available bundles or create your own:

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


### Partial tasks
* common: `images`, `sprites`, `fonts`
* dev: `styles:dev`, `js:dev`, `views:dev`, `custom-dirs:dev`, `browser-sync:dev`
* prod: `styles:prod`, `js:prod`, `views:prod`, `custom-dirs:prod`, `browser-sync:prod`


### Key shortcuts
While watching for changes (tasks: `frs`/`frs dev:watch` or `frs dev`), you can use the following shortcuts:
* Ctrl+P: to build the prod version (init `prod` task) and reload the browser
* Ctrl+D: to build the dev version (init `dev:build` task) and reload the browser
* Ctrl+C: to exit



<br>
## Functionality

### Views, Styles (including fonts, sprites), JavaScript

See your [bundle](#bundles) docs.


### Images
Images are optimized ([gulp-imagemin]) and copied into the dist directory.


### Server
[Browsersync][browsersync] provides a simple HTTP server with auto-refreshing on each change.





<br>
<a name="configuration"></a>
## Directories and configuration
All configuration definitions are placed in files: `gulpfile.dirs.js` and `gulpfile.config.js`. They will be documented soon - until then, please see the sources.

To change the defaults, edit the `fs.dirs.custom.js` and `fs.config.custom.js` files located in your bundle root directory.


### Directories
You can see the default definitons of each directory in the first section of the `gulpfile.dirs.js` file.

You can also add your custom directories (for example - download assets like PDFs) by editing `dirs.custom`. See the commented out example below the dir definitions.

### Config object
See the `gulpfile.config.js` file. `config` object contains configuration parameters divided into key sections. Most of them have subsets, with options applied according to the environment mode: `common` (all), `dev` and `prod`.

* *styles*: sourcemap generation, [gulp-autoprefixer] and [gulp-sass] options
* *sprites*: you can generate multiple sprite files by adding subsequent elements to the `items` array
* *js*: sourcemap generation, minification, merging vendor and app into one file (true by default), scripts loading priority
* *views*: [gulp-swig] options
* *images*: [imagemin][gulp-imagemin] options
* *browserSync*: [Browsersync][browsersync] options
* *clean*: modify deletion options




<br>
## Source maps
Source maps allow you to bind concatenated/minified/compiled dist JS and SASS code with your src resources. Inspected elements and JS console messages will lead you to the actual source files, like SASS scripts. Follow these instructions to configure mapping:

1. Open Chrome Dev Tools.

2. Click the Sources tab, right click on the dir structure on the left and choose Add folder to workspace. Choose the `app/src` folder and confirm permission (alternatively just drag & drop the `src` folder to the console).

3. In the dir structure, right click on any JavaScript file in the `js/` directory **under the added to workspace `src` directory** (at the bottom), e.g. `src/js/app.js`, choose "Map to network resource" and then the actual `[domain]/js/[filename]`, e.g. `localhost/js/app.js` in the select box that appeared.

4. That's not all. Go to the console settings (click the 3 dots in the upper right corner and then "Settings"), choose "Workspace" on the left and then edit mappings for your added directory:
	* left field (URL prefix): change to `http://[domain]/src` (add the `src/` to the url), e.g. `http://localhost/src/`
	* right field (folder path): ensure that is set to `/`

Your app JS and SASS files are now mapped. For Bower files, follow the same instructions for the `bower_components` dir. In point 3 you will have to choose a vendor file that your application really uses. In the last point set the URL prefix to `http://[domain]/bower_components`, e.g. `http://localhost/bower_components`.

Refresh the browser and you're done!



<br>
## Known issues, TODO
* bundles: define custom plugins and tasks





[angularjs]: https://angularjs.org/
[browsersync]: https://www.browsersync.io/
[bower]: http://bower.io/
[bundle-default]: https://github.com/implico/fs-bundle-default
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
