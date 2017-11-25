export const TIMES = {
  Infinity: 'Infinity',
};

export const EASING = {

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