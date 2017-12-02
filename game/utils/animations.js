export const TIMES = {
  Infinity: 'Infinity',
};

export const EASING = {
  // no easing, no acceleration
  Linear: function (t) { return t },
  // accelerating from zero velocity
  InQuad: function (t) { return t*t },
  // decelerating to zero velocity
  OutQuad: function (t) { return t*(2-t) },
  // acceleration until halfway, then deceleration
  InOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
  // accelerating from zero velocity
  InCubic: function (t) { return t*t*t },
  // decelerating to zero velocity
  OutCubic: function (t) { return (--t)*t*t+1 },
  // acceleration until halfway, then deceleration
  InOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
  // accelerating from zero velocity
  InQuart: function (t) { return t*t*t*t },
  // decelerating to zero velocity
  OutQuart: function (t) { return 1-(--t)*t*t*t },
  // acceleration until halfway, then deceleration
  InOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
  // accelerating from zero velocity
  InQuint: function (t) { return t*t*t*t*t },
  // decelerating to zero velocity
  OutQuint: function (t) { return 1+(--t)*t*t*t*t },
  // acceleration until halfway, then deceleration
  InOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t },
  OutElastic: (t) => {
    var p = 0.3;
    return Math.pow(2,-10*t) * Math.sin((t-p/4)*(2*Math.PI)/p) + 1;
  },
  Sin: (t) => {
    return Math.sin((2*Math.PI) * t);
  },
};

export class Animations {
  constructor(props) {
    this.animations = [];
  }
  create(options) {
    this.animations.push({
      ...options,
      lengthLeft: options.length,
    });
  }
  tick(delta) {
    for(let i = this.animations.length - 1; i >= 0; i--) {
      let animation = this.animations[i],
        progress;
      
      progress = animation.lengthLeft / animation.length;
      if (animation.easing) {
        progress = animation.easing(progress);
      }
      
      animation.update(progress);
      animation.lengthLeft -= delta;
      if (animation.lengthLeft < 0) {
        if (animation.times == TIMES.Infinity) {
          animation.lengthLeft = animation.length;
        } else {
          this.animations.splice(i, 1);
        }
      }
    }
  }
}