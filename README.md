# Frontend-starter

Frontend boilerplate framework. This is (just?) a prepared and configurable [gulp][gulp] environment with [Bower][bower] support.

## Features
The framework provides the following functionality via [gulp][gulp] plugins:
* separate source and distribution directories (configurable path), watching for new/changed files using [gulp-watch]
* images: [imagemin][gulp-imagemin], [sprites][gulp-spritesmith]
* JS: [source maps][gulp-sourcemaps], [concatenation][gulp-concat], [compression][gulp-uglify], [JSHint][gulp-jshint], vendor dirs cache (concat only on change)
* Styles: [SASS + Compass (concatenation, compression)][compass], [media queries with Breakpoint library][sass-breakpoint], source maps, [Autoprefixer][gulp-autoprefixer], framework mixins and functions: responsive sprites, responsive fonts (vw), rem/vw/percentage unit converters
* Views: [Twig template engine][gulp-twig]
* Server: [Browsersync][browsersync] (automatic refreshing on every change)


## Installing
You need the following tools to start using the framework:
* [nodejs]
* [gulp]
* [Compass][compass]
* [Bower][bower]
* Git, e.g. [Github desktop](https://desktop.github.com/)

<br>
After installing, run:
```
npm install
bower install
```

On Windows, remember to run Bower from Git Shell.


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

### Views
Thanks to the [Twig plugin][gulp-twig], you can use features brought by this templating system: extending layouts, including partials, variables/if and for blocks/macros and so on. See the [docs][twig].

The proposed structure is:
* views/layouts: contains layout templates (i.e. common markup for all views, like header and footer). Usually there is only one layout.
* views/scripts: contains script (particular pages) templates. Scripts [extend](http://twig.sensiolabs.org/doc/tags/extends.html) layouts.

You can inject custom code using blocks - by default there are 3 of them:
* content - page content
* headTitle - page title in the &lt;head&gt; section
* bodyAttr - attributes appended to the &lt;body&gt; tag



### Styles
Proposed structure:
* `styles/style.scss`: contains only imports of included files
* `styles/_pages`: layout and page-specific styles (for each `views/scripts` templates, like index, contact, news...)
* `styles/_partials`: parts of code that you want to put in separate files, like layout partials (header & footer)
* `core`: framework base config (e.g. breakpoints, font sizes) and mixins/functions (more later)
* `custom`: project-specific config (fonts, colors) and mixins
* `vendor`: external libraries to include, for which you can't or dont't want to use Bower manager

#### RWD
By default, Frontend Starter uses the [SASS Breakpoint][sass-breakpoint] and [mobile first approach](http://www.google.com/search?q=mobile+first). The predefined in `core/config` breakpoints are:
* main, defined as min-width: `mobile`, `tablet`, `desktop` (when you want to target viewport with at least specified width)
* main, defined as exact ranges: `mobile-ex`, `tablet-ex`, `desktop-ex` (when you want to target only the specified range)
* auxiliary (small and large variations), defined as exact ranges: `mobile-sm`, `mobile-lg`, `tablet-sm`, `tablet-lg`, `desktop-sm`, `desktop-lg`

Build your stylesheet like so:

```sass
.col {

  /* common */
  background: #fff;
  
  /* tablet and desktop */
  @include respond-to(tablet) {
    float: left;
    width: 50%;
  }

  /* desktop */
  @include respond-to(desktop) {
    width: 25%;
  }

  //non-standard breakpoint
  @include breakpoint(min-width 400px, max-width 600px) {
    ...
  }
}
```

#### Fonts

##### Enabling font-face
Put the [webfont generated](http://www.fontsquirrel.com/tools/webfont-generator) files in the fonts folder (by default `fonts`) and use the commented out line in the `core/config`:

```sass
@include font-face('font-name', font-files('font.woff', 'font.ttf'), 'font.eot', normal);
```

Or when you don't want to use the Compass mixin (e.g. because of imposed font dir), you can use more flexible mixin `font-face-custom` (located in `core/mixins/fonts`).

##### Px to rem converter
Use the following function, passing as a second parameter one of mobile, tablet or desktop breakpoint:
```sass
font-size: font-rem(13px, mobile);
```
New unit is calculated using `$font-size-*` variables defined in core/config.


##### Responsive size (vw)
To make the font size dependent on the viewport width, use the `font-vw` mixin, specifying the maximum font sizes for the breakpoints, i.e.:
```sass
@include font-vw($mobile: 15px, $tablet: 13px, $desktop: 17px);
```

Media queries will be automatically created. Produced CSS code will be similar to (px size is just a fallback for browsers not supporting the vw unit):
```css
/* mobile */
font-size: 12px;
font-size: 1.69492vw;

/* tablet */
@media (min-width: 768px) {
  font-size: 14px;
  font-size: 1.51362vw;
}

/* desktop */
@media (min-width: 992px) {
  font-size: 17px;
}
```

If you don't want to create media queries, you can use the following function directly:
```sass
font-size: unit-vw(15px, mobile);
```

Available breakpoints: `mobile`, `tablet`, `desktop`, `mobile-sm`, `tablet-sm`. You can override media query breakpoints with [design breakpoints](#styles-fonts-units).


##### Responsive size with font sets
It often occurs that you have some number of standard font sizes on the website. To use the `font-vw` mixin more conveniently, you can predefine these font sizes in the `core/config` file:
```sass
$font-sets: (

  /* small font */
  sm: (mobile: 15px, tablet: 13px, desktop: 17px),

  /* normal font */
  md: (mobile: $font-size-mobile, tablet: $font-size-tablet, desktop: $font-size-desktop),

  /* header font */
  lg: (mobile: 22px, tablet: 22px, desktop: 22px)

  /*...other sets...*/
);
```

Then, use `font-vw` mixin, specifying only the font set name:
```sass
@include font-vw(sm);
```

This will produce same code as:
```sass
@include font-vw($mobile: 15px, $tablet: 13px, $desktop: 17px);
```


<a name="styles-fonts-units"></a>
#### Units
Convert px units easily to vw or percentage. Just get the px dimensions of an element from the design (e.g. PSD), and use:
```sass
width: unit-vw(50px, mobile);
//or
width: unit-percent(50px, mobile);

@include respond-to(tablet) {
  width: unit-vw(100px, tablet);
  //or
  width: unit-percent(100px, tablet);
}
```

By default the base width used to calculate vw/percentage width is the width of a breakpoint passed as the second argument. However, usually layout widths on the design do not meet the "system" (media query) breakpoints. For example, you can get a PSD design for mobile at 600px width (rather than 767px), and would like to calculate units according to this size. To deal with it, add a design breakpoint:
```sass
$design-breakpoints: (mobile: 600px);
```

In this case, all units for mobile, including font-vw, will be calculated according to this size.


#### Grids
Quickly create a grid with the following mixins:
```sass
.row {
  @include respond-to(tablet) {
    @include grid-row(20px);
  }
  .col {
    @include respond-to(tablet) {
      @include grid-col(50%);
    }
    @include respond-to(desktop) {
      width: 25%;
    }
  }
}
```

This creates a 2-col grid for tablet and 4-col grid for desktop with a 20px gutter.


#### Sprites
Sprites are generated automatically by [gulp-spritesmith][gulp-spritesmith] for all images placed in the `img/sprites` directory. To use a sprite, simply uncomment the line in style.scss with sprites sheet import and use the mixin:
```sass
.sprite-icon {
  @include sprite($file-name);
}
```

To create a responsive sprite icon:
```sass
.sprite-wrap {
  @include sprite-wrap-rwd($file-name);

  .sprite {
    @include sprite-rwd($file-name);
  }
}
```

Sprite position and dimensions will adapt to the `.sprite-wrap` container width.

You can generate multiple, separate sprite files - see the [Configuration](#configuration) section.


#### Misc
As for now, the framework comes with 2 helper mixins: `clearfix` and `input-placeholder` (for placeholder styling).




### JavaScript
You can install third party scripts via Bower (editing `bower.json`) or by placing files directly into `js/vendor` dir. All vendor files are concatenated and (by default) merged with your app (custom) files.

Default file for custom code is `js/app.js`.

Libs installed with Bower are fetched using [main-bower-files] plugin. If you don't want to include a particular package, use `overrides` option in the `bower.json` (see also [main-bower-files] docs).


### Views, styles, JavaScript: convention
What is proposed here can be illustrated in the following three sections. Naturally, you can use your own way. Also, any comments and suggestions will be appreciated.

#### 1. Views
Add an individual body id for each page type, e.g. index, contact, news... prepended with "page" keyword:
```html
<body id="page-index">
  <div class="heading">
    ...
```

#### 2. Styles
Refer to particular page styles using the page id selector as a scope, i.e.:
```sass
//_pages/index
#page-index {

  //only for homepage
  .heading {
    color: green;
  }
}
```

Code snippets that are used across the pages (for example news list same on homepage as on the news page) place in styles/_partials directory and start the class name with "layout" keyword:
```sass
//_partials/news-list
.layout-news-list {
  ...
}
```

For the key layout tags you can provide only the keyword:
```sass
header.layout {
  ...
}
```

#### 3. JavaScript
The code is namespaced with APP global object. To change its name, for example into APPB:
```javascript
var APPB = APPB || {};

//leave APP here, to be available as APP in our closure
(function($, APP) {
...
})(jQuery, APPB);

```

Target code for each page type by using a simple id checker (a kind of controller) - if an element with id="page-[page-id]" is found, the code is dispatched:
```javascript
APP.pages = {
    
  //layout - common for all, no id checking
  layout: {
    init: function() {
      layout.menuMobile();
      layout.footerSlider.init();
    },
    //subfunctionality - short version
    menuMobile: function() {
      $('#menu-toggle').click(function() {
        //...
      });
    },
    //subfunctionality - expanded version
    footerSlider: {
      init: function() {
        layout.footerSlider.create();
        $(window).resize(layout.footerSlider.resize);
      },
      create: function() {
        //...
      },
      resize: function() {
        //...
      }
    }
  },

  //other pages
  ...

  //news
  news: {
    init: function() {
      //here goes the id checking
      if (!modules.page('news'))
        return;

      //code for news
      //...
      }
    }

}
```

`APP.pages.layout` contains code common for all pages.

You can add handy helpers for each page:
```javascript
var layout = APP.pages.layout,
    //...
    news = APP.pages.news;
```

When adding a new page, initialize it in APP.init function:
```javascript
  APP.init = function() {
    //...
    news.init();
  }
```

`APP.modules` contains functional, utility methods, by default:
* `page`: allows to check if passed id meets the `body` id indicator (see APP.pages.news.init function above). Alternatively, you can pass an array of ids.
* `isBreakpoint`: in your styles, add a `z-index` to the `body` element depending on media query breakpoint (1, 2, 3 for mobile, tablet and desktop respectively) and use this function to check the current breakpoint


### Images
Images are optimized and copied into the dist directory.


### Server
Browsersync provides a simple HTTP server with auto-refreshing on each change.





<br>
<a name="configuration"></a>
## Configuration
To change default configuration, edit the `gulpfile.config.js` file.

### Directories
You can change each directory in the first section of the file.

You can also add your custom directories by editing `dirs.custom`. See the commented out example below the dir definitions.

### Config object
`config` object contains configuration parameters divided into key sections. Most of them have subsets, with options applied according to the environment mode: `common` (all), `dev` and `prod`.

* global:
  * `globAdd`: glob pattern added to watch patterns (excludes temp files etc.)
* styles: sourcemap generation, [autoprefixer] and [gulp-compass] options
* sprites: you can generate multiple sprite files by adding subsequent elements to the `items` array
* js: sourcemap generation, minification, merging vendor and app into one file (true by default)
* views: [gulp-twig] options
* images: [imagemin][gulp-imagemin] options
* browserSync: [Browsersync][browsersync] options




<br>
## Source maps
Source maps allow you to bind concatenated/minified/compiled dist JS and SASS code with your src resources. Inspected elements and JS console messages will lead you to the actual source files, like SASS scripts. Follow these instructions to configure mapping:

1. Open Chrome Dev Tools.
2. Click the Sources tab, right click on the dir structure on the left and choose Add folder to workspace. Choose the `app/src` folder and confirm permission (alternatively drag & drop the folder to the console).
3. In the dir structure, right click on any file in the `src` directory different than `style.css`, e.g. `js/app.js` (in your domain, not the added directory), choose "Map to file system resource" and then `src/[path to file]` in the select box that appeared.

SASS and JS files are now mapped.

To map a JS Bower vendor dir, follow the same steps for the `vendor` dir.





[nodejs]: https://nodejs.org/
[gulp]: http://gulpjs.com/
[gulp-watch]: https://github.com/floatdrop/gulp-watch
[gulp-imagemin]: https://github.com/sindresorhus/gulp-imagemin
[gulp-sourcemaps]: https://github.com/floridoo/gulp-sourcemaps
[gulp-concat]: https://github.com/contra/gulp-concat
[gulp-uglify]: https://github.com/terinjokes/gulp-uglify
[gulp-jshint]: https://github.com/spalger/gulp-jshint
[compass]: http://compass-style.org/
[gulp-compass]: [https://github.com/appleboy/gulp-compass]
[sass-breakpoint]: http://breakpoint-sass.com/
[gulp-autoprefixer]: https://github.com/sindresorhus/gulp-autoprefixer
[gulp-spritesmith]: https://github.com/twolfson/gulp.spritesmith
[gulp-twig]: https://github.com/zimmen/gulp-twig
[twig]: http://twig.sensiolabs.org/documentation
[browsersync]: https://www.browsersync.io/
[bower]: http://bower.io/
[main-bower-files]: https://github.com/ck86/main-bower-files