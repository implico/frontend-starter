# Frontend-starter migration guide

## 1.6.13
- Sprites
  - move the contents of `/src/img/sprites` directory to `/src/sprites`
  - if you had any additional directories, place them under the `/src/img/sprites`
  - config item properties changed: `imgSrc` to `src`, `imgDest` to `dest`, added required `name`

- Custom dirs
  - now defined in the `frs.config.js` (an array `config.customDirs.items` instead of `dirs.custom` object)
  - `from` and `to` properties changed to `src` and `dest`

See the new docs with examples for [Frontend-starter](https://github.com/implico/frontend-starter) and [default bundle](https://github.com/implico/frs-bundle-default).


## 1.6.12
Ensure the following issues are up-to-date:
- config filenames renamed from `frs.config.custom.js` to `frs.config.js` and `frs.dirs.custom.js` to `frs.dirs.js`
- `frs.config.js`: remove `.common` references, e.g. change `config.images.common.imagemin.optimizationLevel = 4;` to `config.images.imagemin.optimizationLevel = 4;`
- `frs.dirs.js`: ensure that you follow the same `case` conditions scheme as in [the file in default bundle](https://github.com/implico/frs-bundle-default/blob/master/frs.dirs.js) (reduced 3 steps into 2: `main` and `sub`)
- move `/src/js/vendor` to `/vendor/js`
