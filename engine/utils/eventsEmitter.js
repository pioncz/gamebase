var EventsEmitter = function () {
  this.events = {};
};

EventsEmitter.prototype.on = function (event, listener) {
  if (typeof this.events[event] !== 'object') {
    this.events[event] = [];
  }

  this.events[event].push(listener);
};

EventsEmitter.prototype.off = function (event, listener) {
  var idx;

  if (typeof this.events[event] === 'object') {
    idx = this.events[event].indexOf(listener);

    if (idx > -1) {
      this.events[event].splice(idx, 1);
    }
  }
};

EventsEmitter.prototype.emit = function (event) {
  var i,
    listeners,
    length,
    args = [].slice.call(arguments, 1);

  if (typeof this.events[event] === 'object') {
    listeners = this.events[event].slice();
    length = listeners.length;

    for (i = 0; i < length; i++) {
      listeners[i].apply(this, args);
    }
  }
};

EventsEmitter.prototype.once = function (event, listener) {
  this.on(event, function g() {
    this.removeListener(event, g);
    listener.apply(this, arguments);
  });
};

export default EventsEmitter;
