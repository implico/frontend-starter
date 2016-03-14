# Frontend-starter

Frontend boilerplate framework. This is (just?) a prepared, configurable [gulp][gulp] environment with [Bower][bower] support. Plus bundles with directory structure and useful [SASS][sass] mixins. Automatically produces clean and optimized output code. A perfect solution for any frontend work, especially landing pages.


## Features
The framework provides the following functionality via [gulp][gulp] plugins:
* separate source and distribution directories (configurable path), watching for new/changed files using [gulp-watch]
* images: [imagemin][gulp-imagemin], [sprites][gulp-spritesmith]
* JS: [source maps][gulp-sourcemaps], [concatenation][gulp-concat], [compression][gulp-uglify], [JSHint][gulp-jshint], vendor dirs cache (concat only on change)
* Styles: [SASS][sass] with [node-sass], [media queries with Breakpoint library][sass-breakpoint], source maps, [Autoprefixer][gulp-autoprefixer]; by default, use of [SASS-core][sass-core] (mixins and functions: automatic rem/vw/percentage unit converters for dimensions and fonts, responsive sprites)
* Views: [Swig template engine][swig] with [gulp-swig]
* Server: [Browsersync][browsersync] (automatic refreshing on every change)
* easy to integrate with MV* frameworks (see the [bundles](#bundles))


## Installation
You need the following tools to start using the framework:
* [nodejs]
* [gulp]
* [Bower][bower]
* Git, e.g. [Github desktop](https://desktop.github.com/)

<br>
After cloning the repo (remember **not to use a directory containing an exclamation mark (!)** - it breaks glob patterns), run:
```
npm install
```

If you use Visual Studio, close it while npm installs the modules.

<a name="bundles"></a>
## Bundles
Use on of the available bundles or create your own:

* [default bundle][bundle-default]
* AngularJS bundle (soon)


<br>
## CLI (tasks)
Use the following tasks from the command line:


### Dev build & watch together
`gulp dev`

For your first run, or when you want to rebuild a clean dist version. This will run both `dev:build` and `dev:watch` tasks.



### Watch - the default task
`gulp`
or
`gulp dev:watch`

Gulp watches for any changes in your src directory and runs the appropiate task.



### Build
`gulp dev:build`

Cleans and builds the dist version.



### Production
`gulp prod`

Prepares a production build (minified resources).



### Production with preview
`gulp prod:preview`

Same as `prod`, but additionally launches a Browsersync preview.



### Clean
`gulp clean`

Cleans the dist directory.


### Partial tasks
* common: `images`, `sprites`, `fonts`
* dev: `styles:dev`, `js:dev`, `views:dev`, `custom-dirs:dev`, `browser-sync:dev`
* prod: `styles:prod`, `js:prod`, `views:prod`, `custom-dirs:prod`, `browser-sync:prod`


### Key shortcuts
While watching for changes (tasks: `gulp`/`gulp dev:watch` or `gulp dev`), you can use the following shortcuts:
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
All configuration definitions are placed in the `gulpfile.config.js` file. **DO NOT** edit its contents to maintain ability of updates of the core.

Instead, to change default configuration (directories, tasks config), edit the `app/gulpfile.config.custom.js` and `app/gulpfile.config.dirs.js` files in your bundle root directory.

You can also change the `app` directory - simply create a file named `gulpfile.config.app.js` in the framework root directory and change the app dir, e.g.:
```js
module.exports = function(dirs) {
  dirs.app = '../other_dir';
}
```

### Directories
You can see the definitons of each directory in the first section of the file.

You can also add your custom directories (for example - download assets like PDFs) by editing `dirs.custom`. See the commented out example below the dir definitions.

### Config object
`config` object contains configuration parameters divided into key sections. Most of them have subsets, with options applied according to the environment mode: `common` (all), `dev` and `prod`.

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
2. Click the Sources tab, right click on the dir structure on the left and choose Add folder to workspace. Choose the `app/src` folder and confirm permission (alternatively drag & drop the folder to the console).
3. In the dir structure, right click on any file in the `src` directory different than `style.css`, e.g. `js/app.js` (in your domain, not the added directory), choose "Map to file system resource" and then `src/[path to file]` in the select box that appeared.

SASS and JS files are now mapped.

To map JS Bower vendor dir, follow the same steps for the `vendor` dir.




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
