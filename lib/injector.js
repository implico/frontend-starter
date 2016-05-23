function Injector(task, appData, taskData) {
  this.task = task;
  this.appData = appData;
  this.taskData = taskData;

  var taskConfig = this.appData.config[this.task],
      cancel = taskConfig.inject.cancel;
  if (cancel) {
    if (typeof cancel === 'function') {
      cancel = cancel(this.taskData, this.appData);
    }
    else if (!(cancel instanceof Array)) {
      console.error('Frontend-starter error: wrong injector cancel value for task ' + task);
    }
  }
  this.cancel = cancel;
}

Injector.prototype.run = function(name, stream) {
  var injectorFn = this.appData.config[this.task].inject[name];

  if (injectorFn) {
    return injectorFn(stream, this.taskData, this.appData);
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
