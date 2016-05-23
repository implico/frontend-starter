function Injector(data) {
  this.data = data;
}

Injector.prototype.get = function(name, stream) {
  var injectorFn = this.data.config.injectors[name];
  this.data.cancelNext = false;

  if (injectorFn) {
    return injectorFn(stream, this.data);
  }
  else{
    if (injectorFn === false) {
      this.data.cancelNext = true;
    }
    return stream;
  }
}

module.exports = Injector;
