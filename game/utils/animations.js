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

class Animation {
  constructor({update, length = 0, delay = 0, easing = null}) {
    this.lengthLeft = length;
    this.length = length;
    this.delayLeft = delay;
    this.easing = easing;
    this.update = update;
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
  create(options) {
    let animation = new Animation(options);
  
    this.animations.push(animation);
  
    return animation.finishPromise;
  }
  tick(delta) {
    let _tick = (animation) => {
      let progress;
  
      if (animation.delayLeft) {
        animation.delayLeft -= delta;
      }
  
      if (animation.delayLeft <= 0) {
        progress = (1 - animation.lengthLeft / animation.length);
        if (animation.easing) {
          progress = animation.easing(progress);
        }
    
        if (progress == 1) {
          animation.finished = true;
        }
        animation.update(progress);
        animation.lengthLeft -= delta;
        if (animation.lengthLeft < 0) {
          if (animation.times == TIMES.Infinity) {
            animation.lengthLeft = animation.length;
          } else {
            if (!animation.finished) {
              animation.finished = true;
              animation.update(1);
            }
          }
        }
      }
    };
    
    for(let i = this.animations.length - 1; i >= 0; i--) {
      _tick(this.animations[i]);
      
      if (this.animations[i].finished) {
        this.animations[i].resolve();
        this.animations.splice(i, 1);
      }
    }
    
    for(let sequenceName in this.sequences) {
      let sequence = this.sequences[sequenceName];
      
      if (sequence.animations.length) {
        _tick(sequence.animations[0]);
        if (sequence.animations[0].finished) {
          sequence.animations.shift();
        }
      } else {
        delete this.sequences[sequenceName];
      }
    }
  }
  createSequence({name, steps}) {
    if (this.sequences[name]) {
    
    }
    
    let animations = [];
    
    for(let stepId in steps) {
      let step = steps[stepId];
      
      animations.push(new Animation(step));
    }
  
    this.sequences[name] = {name, animations};
    
    // let newLoop = Utils.asyncLoop(
    //   steps.length,
    //   (loop, index) => {
    //     this.create(steps[index])
    //       .then(() => { loop.next() });
    //   },
    //   () => {});
    //
    // this.sequences[name] = newLoop;
  }
}