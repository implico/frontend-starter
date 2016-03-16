#!/usr/bin/env node

var exec        = require('child_process').exec,
    keypress    = require('keypress');


//execute gulp on module direcotry passing the project dir in a parameter
var childrenProc = [],
    env = process.env;

env.FS_BASE_DIR = process.cwd();


var execGulp = function(task, exitOnClose) {
  var child = exec('gulp ' + task, { cwd: __dirname, env: env, killSignal: 'SIGKILL' });
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
    child.kill('SIGKILL');
  });
});



//register key events
keypress(process.stdin);

process.stdin.on('keypress', function(ch, key) {

  if (key.ctrl) {
    switch (key.name) {
      case 'c':
        process.exit();
        break;
      case 'p':
        console.log('--- Invoked prod task from keyboard ---');
        execGulp('prod');
        break;
      case 'd':
        console.log('--- Invoked dev:build task from keyboard ---');
        execGulp('dev:build');
        break;
    }
  }
});
process.stdin.setRawMode(true);
process.stdin.resume();
console.log('Use keys:')
console.log('Ctrl+P: prod');
console.log('Ctrl+D: dev:build');
console.log('Ctrl+C: exit\n');



//get task name or set to default
var task = process.argv[2] ? process.argv[2] : 'default';

execGulp(task, true);
