import Utils from './utils'

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

const nextId = (() => {
  let id = 0;
  return () => id++;
})();

class Animation {
  constructor({id, update, length = 0, delay = 0, easing = null, loop = false,}) {
    this.id = id;
    this.lengthLeft = length;
    this.length = length;
    this.delayLeft = delay;
    this.easing = easing;
    this.update = update;
    this.loop = loop;
    this.finished = false;
    this.finishPromise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

export class Animations {
  constructor(props) {
    this.animations = [];
    this.sequences = {}; // 'sequenceName':
  }
  _getAnimationById(id) {
    let animation = this.animations.find(animation => animation.id === id);

    return animation;
  }
  removeAnimation(id) {
    let animation = this._getAnimationById(id);

    if (!animation) return;

    this._finishAnimation(id);
    this.animations.splice(this.animations.indexOf(animation), 1);
  }
  _finishAnimation(id) {

  }
  create(options) {
    options.id = options.id || nextId();

    if (this._getAnimationById(options.id)) this.removeAnimation(options.id);

    let animation = new Animation(options);

    this.animations.push(animation);

    return animation.finishPromise;
  }
  tickAnimation(delta, animation) {
    let progress;

    if (animation.delayLeft) {
      animation.delayLeft -= delta;
    }

    if (animation.delayLeft <= 0) {
      progress = (1 - animation.lengthLeft / animation.length);
      if (animation.easing) {
        progress = animation.easing(progress);
      }

      animation.update(progress);
      animation.lengthLeft -= delta;
      if (animation.lengthLeft < 0) {
        if (animation.loop) {
          animation.lengthLeft = animation.length;
        } else if (!animation.finished) {
          animation.finished = true;
          animation.update(1);
        }
      }
    }

    if (animation.finished) {
      animation.resolve();
    }
  }
  tick(delta) {
    for(let i = this.animations.length - 1; i >= 0; i--) {
      this.tickAnimation(delta, this.animations[i]);

      if (this.animations[i].finished) {
        this.animations.splice(i, 1);
      }
    }

    for(let sequenceName in this.sequences) {
      let sequence = this.sequences[sequenceName];

      if (sequence.animations.length) {
        this.tickAnimation(delta, sequence.animations[0]);
        if (sequence.animations[0].finished) {
          sequence.animations.shift();
        }
      } else {
        sequence.resolveFunction();
        delete this.sequences[sequenceName];
      }
    }
  }
  createSequence({name, steps,}) {
    let animations = [],
      resolveFunction = null,
      rejectFunction = null,
      animationPromise = new Promise((resolve, reject) => {
        resolveFunction = resolve;
        rejectFunction = reject;
      });

    for(let stepId in steps) {
      let step = steps[stepId],
        animation = new Animation(step);

      animations.push(animation);

      if (step.finish) {
        animation.finishPromise.then(step.finish, step.finish);
      }
    }

    this.sequences[name] = {
      name,
      animations,
      resolveFunction,
      rejectFunction,
    };

    return animationPromise;
  }
  restartAnimation(id) {
    let animation = this._getAnimationById(id);

    if (!animation) return;

    animation.lengthLeft = animation.length;
  }
}