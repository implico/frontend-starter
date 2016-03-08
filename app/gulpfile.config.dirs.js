//custom dir definitions
module.exports = function(dirs, mode) {

  switch (mode) {

    //invoked after setting the src dir (set custom src dir here)
    case 'src':
      //e.g.
      //dirs.src.main = dirs.app + 'source_dir/';
      break;

    //invoked after setting the dist dir (set custom dist dir here)
    case 'dist':
      //e.g.
      //dirs.dist.main = dirs.app + 'public_html/';
      break;

    //invoked after setting all dirs (set custom dir modifications/definitions here)
    case 'all':

      //end of code: uncomment if you change the Bower vendor dir to update html5shiv source dir
      // if (dirs.custom.html5shiv)
      //   dirs.custom.html5shiv.from = dirs.vendor + 'html5shiv/dist/html5shiv.min.js';
      break;
  }
}