var extend = require('extend');

function Injector(task, appData, taskData) {
  this.task = task;
  this.appData = appData;
  this.taskData = taskData;

  var taskConfig;
  if (typeof task == 'string') {
    //passed a task id
    taskConfig = this.appData.config[task];
  }
  else {
    //passed a config object (customDirs)
    taskConfig = task;
  }

  if (typeof taskData.isDev !== 'undefined') {
    this.taskConfig = extend(true, taskConfig, taskConfig[taskData.isDev ? 'dev': 'prod']);
    //fallback
    if (taskConfig.common) {
      var common = taskConfig.common,
          isWrong = ((task == 'browserSync') && common.options.host);

      if (isWrong) {
        console.error('Frontend-starter error: please remove references to .common keys in your ' + appData.dirs.customConfig.configFile + ' file, \ne.g. change config.styles.common.sourceMapsRoot to config.styles.sourceMapsRoot');
        process.exit(1);
      }
    }
  }
  else {
    this.taskConfig = taskConfig;
  }

  this.taskConfig.inject = this.taskConfig.inject || {};

  this.cancelTask = this.taskConfig.inject.cancelTask ? Promise.resolve() : false;

  var cancel = this.taskConfig.inject.cancel;
  if (cancel) {
    if (typeof cancel === 'function') {
      cancel = cancel.call(this);
    }
    else if (!(cancel instanceof Array)) {
      console.error('Frontend-starter error: wrong injector cancel value for task ' + task);
    }
  }
  this.cancel = cancel;
}

Injector.prototype.run = function(name, stream, data) {
  var injectorFn = this.taskConfig.inject[name];

  if (injectorFn) {
    return injectorFn.call(this, stream, data);
  }
  else{
    if (injectorFn === false) {
      this.cancel = this.cancel || [];
      this.cancel.push(name);
    }
    return stream;
  }
}

Injector.prototype.isCanceled = function(name) {
  return this.cancel && (this.cancel.indexOf(name) >= 0);
}

module.exports = Injector;
