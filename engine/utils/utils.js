const Utils = {
  $: function(options) {
    let elemenet = options.element || 'div';

    return document.createElement(elemenet);
  },
  asyncLoop: (iterations, func, callback) => {
    var index = 0;
    var done = false;
    var loop = {
      next: function() {
        if (done) return;

        if (index < iterations) {
          func(loop, index);
          index++;
        } else {
          done = true;
          if (callback) callback();
        }
      },
      break: function() {
        done = true;
        callback();
      },
    };
    loop.next();
    return loop;
  },
  isIos: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
}

export default Utils