var extend = require('extend');

function Injector(task, appData, taskData) {
  this.task = task;
  this.appData = appData;
  this.taskData = taskData;
  this.isCanceled = false;
  this.isDev = (taskData && taskData.config && taskData.config.main && (typeof taskData.config.main.isDev !== 'undefined')) ? taskData.config.main.isDev : appData.config.main.isDev;

  var taskConfig;
  if (typeof task == 'string') {
    //passed a task id
    taskConfig = this.appData.config[task];
  }
  else {
    //passed a config object (customDirs)
    taskConfig = task;
  }

  var taskConfigEnv = taskConfig[this.isDev ? 'dev': 'prod']
  this.taskConfig = taskConfigEnv ? extend(true, taskConfig, taskConfigEnv) : taskConfig;
  if (taskData && taskData.config) {
    this.taskConfig = extend(true, this.taskConfig, taskData.config);
  }
  //fallback
  if (taskConfig.common) {
    var common = taskConfig.common,
        isWrong = ((task == 'browserSync') && common.options.host) || ((task == 'views') && common.useSwig);

    if (isWrong) {
      console.error('Frontend-starter error: please remove deprecated references to .common keys in your ' + appData.dirs.customConfig.configFile
        + ' file, \ne.g. change config.styles.common.sourceMapsRoot to config.styles.sourceMapsRoot');
      process.exit(1);
    }
  }

  this.taskConfig.inject = this.taskConfig.inject || {};
}

Injector.prototype.run = function(name, stream, data) {
  var injectorFn = this.taskConfig.inject[name];

  this.isCanceled = false;

  if (typeof injectorFn === 'function') {
    return injectorFn.call(this, stream, data, name);
  }
  else {
    if (injectorFn === false) {
      this.isCanceled = true;
    }
    return stream;
  }
}

Injector.prototype.cancel = function(stream) {
  this.isCanceled = true;
  return stream;
}

module.exports = Injector;
