# Frontend-starter

Frontend boilerplate framework. This is (just?) a prepared, configurable [gulp][gulp] environment with [Bower][bower] support. Plus bundles with directory structure and useful [sass][SASS] mixins. Automatically produces clean and optimized output code. A perfect solution for any frontend work, especially landing pages.


## Features
The framework provides the following functionality via [gulp][gulp] plugins:
* separate source and distribution directories (configurable path), watching for new/changed files using [gulp-watch]
* images: [imagemin][gulp-imagemin], [sprites][gulp-spritesmith]
* JS: [source maps][gulp-sourcemaps], [concatenation][gulp-concat], [compression][gulp-uglify], [JSHint][gulp-jshint], vendor dirs cache (concat only on change)
* Styles: [SASS + Compass (concatenation, compression)][compass], [media queries with Breakpoint library][sass-breakpoint], source maps, [Autoprefixer][gulp-autoprefixer]; by default, use of [SASS-core][sass-core] (mixins and functions: automatic rem/vw/percentage unit converters for dimensions and fonts, responsive sprites)
* Views: [Swig template engine][swig] with [gulp-swig]
* Server: [Browsersync][browsersync] (automatic refreshing on every change)
* easy to integrate with MV* frameworks (see the [bundles](#bundles))


## Installation
You need the following tools to start using the framework:
* [nodejs]
* [gulp]
* [Compass][compass]
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



<br>
## Functionality

### Views, Styles (including fonts, spites), JavaScript

See your [bundle](#bundles) docs.


### Images
Images are optimized ([gulp-imagemin]) and copied into the dist directory.


### Server
[Browsersync][browsersync] provides a simple HTTP server with auto-refreshing on each change.





<br>
<a name="configuration"></a>
## Configuration
To change default configuration (directories, task config), edit the `app/gulpfile.config.custom.js` and `app/gulpfile.config.dirs.js` files in your bundle root directory.

### Directories
You see the definiton each directory in the first section of the file.

You can also add your custom directories by editing `dirs.custom`. See the commented out example below the dir definitions.

### Config object
`config` object contains configuration parameters divided into key sections. Most of them have subsets, with options applied according to the environment mode: `common` (all), `dev` and `prod`.

* global:
  * `globAdd`: glob pattern added to watch patterns (excludes temp files etc.)
* styles: sourcemap generation, [gulp-autoprefixer] and [gulp-compass] options
* sprites: you can generate multiple sprite files by adding subsequent elements to the `items` array
* js: sourcemap generation, minification, merging vendor and app into one file (true by default), scripts loading priority
* views: [gulp-swig] options
* images: [imagemin][gulp-imagemin] options
* browserSync: [Browsersync][browsersync] options
* clean task: modify deletion options




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
* under Windows, the watcher sometimes blocks and does not see any changes (usally when you save SASS files a couple of times in a short time) - the script must be then restarted (probably depends on [gulp-watch]/[Chokidar][chokidar])
* bundles: define custom plugins and code





[angularjs]: https://angularjs.org/
[browsersync]: https://www.browsersync.io/
[bower]: http://bower.io/
[bundle-default]: https://github.com/implico/fs-bundle-default
[chokidar]: https://github.com/paulmillr/chokidar
[compass]: http://compass-style.org/
[gulp]: http://gulpjs.com/
[gulp-autoprefixer]: https://github.com/sindresorhus/gulp-autoprefixer
[gulp-compass]: https://github.com/appleboy/gulp-compass
[gulp-concat]: https://github.com/contra/gulp-concat
[gulp-imagemin]: https://github.com/sindresorhus/gulp-imagemin
[gulp-jshint]: https://github.com/spalger/gulp-jshint
[gulp-sourcemaps]: https://github.com/floridoo/gulp-sourcemaps
[gulp-spritesmith]: https://github.com/twolfson/gulp.spritesmith
[gulp-swig]: https://github.com/colynb/gulp-swig
[gulp-uglify]: https://github.com/terinjokes/gulp-uglify
[gulp-watch]: https://github.com/floatdrop/gulp-watch
[main-bower-files]: https://github.com/ck86/main-bower-files
[minimatch]: https://github.com/isaacs/minimatch
[nodejs]: https://nodejs.org/
[sass]: http://sass-lang.com/
[sass-breakpoint]: http://breakpoint-sass.com/
[sass-core]: https://github.com/implico/sass-core
[swig]: http://paularmstrong.github.io/swig/
