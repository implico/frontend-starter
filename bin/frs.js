#!/usr/bin/env node

var exec        = require('child_process').exec,
    keypress    = require('keypress');


//execute gulp on module direcotry passing the project dir in a parameter
var childrenProc = [],
    env = process.env;

env.FS_BASE_DIR = process.cwd();


var spawnGulp = function(task, exitOnClose) {
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
  if (exitOnClose) {
    child.on('close', function() {
      process.exit();
    });
  }
}
//kill all processes on exit
process.on('exit', function() {
  childrenProc.forEach(function(child) {
    child.kill('SIGTERM');
  });
});



//get task name or set to default
var task = process.argv[2] ? process.argv[2] : 'default';


//register key events
keypress(process.stdin);

process.stdin.on('keypress', function(ch, key) {

  if (key.ctrl) {
    switch (key.name) {
      case 'c':
        childrenProc.forEach(function(child) {
          child.stdin.on('error', function() {}).write('FS_CLOSE');
        });
        setTimeout(function() {
          process.exit();
        }, 500);
        break;
      case 'p':
        console.log('--- Invoked prod task from keyboard ---');
        spawnGulp('prod');
        break;
      case 'd':
        console.log('--- Invoked dev:build task from keyboard ---');
        spawnGulp('dev:build');
        break;
    }
  }
});
if (process.stdin.setRawMode)
  process.stdin.setRawMode(true);
process.stdin.resume();

if (!task || (task == 'dev:watch') || (task == 'prod:preview')) {
  console.log('Use keys:')
  console.log('Ctrl+P: prod');
  console.log('Ctrl+D: dev:build');
  console.log('Ctrl+C: exit\n');
}



spawnGulp(task, true);
