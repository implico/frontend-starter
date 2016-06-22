#!/usr/bin/env node

var exec        = require('child_process').exec,
    keypress    = require('keypress');


//execute gulp on module directory passing the project dir in an anv variable
var childrenProc = [],
    env = process.env;

env.FRS_BASE_DIR = process.cwd();
process.chdir(__dirname);
global.frsBlockWatch = false;


var spawnGulp = function(task, exitOnClose) {
  global.frsBlockWatch = true;
  var child = exec('gulp ' + task, { cwd: __dirname, env: env }).on('error', function() {
    console.error('Frontend-starter: error while executing "gulp". Check if you have gulp.js installed.')
    process.exit(1);
  });
  childrenProc.push(child);
  child.stdout.on('data', function(data) {
    process.stdout.write(data);
  });
  child.stderr.on('data', function(data) {
    process.stdout.write(data);
  });
  child.on('close', function() {
    global.frsBlockWatch = false;
    if (exitOnClose) {
      process.exit();
    }
  });
}

//kills all processes
var killProcesses = function() {
  childrenProc.forEach(function(child) {
    child.stdin.on('error', function() {}).write('_FRS_CLOSE_');
    child.kill('SIGTERM');
  });
}

//kill all processes on exit
process.on('exit', function() {
  killProcesses();
});



//get task name or set to default
var task = process.argv[2] ? process.argv[2] : 'default';


//register keys
keypress(process.stdin);

process.stdin.on('keypress', function(ch, key) {

  if (key && key.ctrl) {
    switch (key.name) {
      case 'c':
        process.exit();
        break;
      case 'p':
        console.log('--- Invoked build production task from keyboard ---');
        spawnGulp('build -p');
        break;
      case 'd':
        console.log('--- Invoked build development task from keyboard ---');
        spawnGulp('build');
        break;
      case 'l':
        console.log('--- Invoked lint task from keyboard ---');
        spawnGulp('lint');
        break;
    }
  }
});
if (process.stdin.setRawMode)
  process.stdin.setRawMode(true);
process.stdin.resume();

console.log('Use keys:')
console.log('Ctrl+P: build production');
console.log('Ctrl+D: build development');
console.log('Ctrl+L: lint');
console.log('Ctrl+C: exit\n');


require('gulp-cli')();
