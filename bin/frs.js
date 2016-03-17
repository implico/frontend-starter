#!/usr/bin/env node

var spawn       = require('child_process').spawn,
    keypress    = require('keypress');


//execute gulp on module direcotry passing the project dir in a parameter
var childrenProc = [],
    env = process.env;

env.FS_BASE_DIR = process.cwd();


var spawnGulp = function(task, exitOnClose) {
  var child = spawn('gulp.cmd', [task], { cwd: __dirname, env: env });
  childrenProc.push(child);
  child.stdout.on('data', function(data) {
    process.stdout.write(data);
  });
  child.stderr.on('data', function(data) {
    process.stdout.write(data);
  });
  if (exitOnClose) {
    child.stderr.on('close', function(data) {
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



//register key events
keypress(process.stdin);

process.stdin.on('keypress', function(ch, key) {

  if (key.ctrl) {
    switch (key.name) {
      case 'c':
        childrenProc.forEach(function(child) {
          child.stdin.write('FS_CLOSE');
        });
        setTimeout(function() {
          process.exit();
        }, 1000);
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
console.log('Use keys:')
console.log('Ctrl+P: prod');
console.log('Ctrl+D: dev:build');
console.log('Ctrl+C: exit\n');



//get task name or set to default
var task = process.argv[2] ? process.argv[2] : 'default';

spawnGulp(task, true);
