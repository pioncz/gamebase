import Utils from "./utils/utils";
import { EASING } from "./utils/animations";
import Config from 'config.js';

export default class Dice {
  constructor({scene, animations}) {
    this.scene = scene;
    this.animations = animations;
  
    var geometry = new THREE.BoxGeometry( 2, 2, 2 );
    
    var materials = [
      this._createFace(1),
      this._createFace(2),
      this._createFace(3),
      this._createFace(4),
      this._createFace(5),
      this._createFace(6),
    ];
  
    this.cube = new THREE.Mesh( geometry, materials );
    this.cube.position.x = 0;
    this.cube.position.y = 2;
    this.cube.position.z = 0;
    this._setOpacity(0);
    this.scene.add( this.cube );
  }
  _createFace(number) {
    let canvas = Utils.$({element: 'canvas'}),
      ctx = canvas.getContext('2d'),
      width = 64,
      height = 64,
      texture = new THREE.Texture(canvas),
      radius = 5;
    
    let drawDot = (x, y, r) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI, false);
        ctx.fill();
      },
      w4 = width / 4,
      h4 = height / 4,
      h2 = height / 2,
      w2 = width / 2,
      dotPositions = {
        1: [{x: w2, y: h2}],
        2: [{x:w4, y: h4}, {x:(w2+w4), y: (h2+h4)}],
        3: [{x:w4, y: h4}, {x:w2, y: h2}, {x:(w2+w4), y: (h2+h4)}],
        4: [{x:w4, y: h4}, {x:(w2+w4), y: (h2+h4)}, {x:(w2+w4), y: h4}, {x:w4, y: (h2+h4)}],
        5: [{x:w4, y: h4}, {x:(w2+w4), y: (h2+h4)}, {x: w2, y: h2}, {x:(w2+w4), y: h4}, {x:w4, y: (h2+h4)}],
        6: [{x:w4, y: h4}, {x:w2, y: h4}, {x:(w2+w4), y: h4}, {x:w4, y: (h2+h4)}, {x:w2, y: (h2+h4)}, {x:(w2+w4), y: (h2+h4)}],
      };
    
    canvas.width = width;
    canvas.height = height;
  
    ctx.fillStyle = '#f6f6f5'; // '#ffbbe4';
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = "#1e1e1e"; // '#fff'
    let dots = dotPositions[number];
    for(let dotI in dots) {
      let dot = dots[dotI];
  
      drawDot(dot.x, dot.y, radius);
    }
    
    texture.needsUpdate = true;
    
    return new THREE.MeshBasicMaterial({map: texture, transparent: true});
  }
  _setOpacity(opacity) {
    for(let materialId in this.cube.material) {
      let material = this.cube.material[materialId];
      
      material.opacity = opacity;
    }
  }
  roll(number) {
    let cube = this.cube,
      numberRotations = {
        1: {x: 0, z: .25},
        2: {x: 0, z: .75},
        3: {x: 0, z: 0},
        4: {x: 0, z: .5},
        5: {x: .75, z: 1},
        6: {x: .25, z: 1},
      },
      totalLength = Config.ludo.animations.rollDice;
    
    let baseX = (2*Math.PI) * numberRotations[number].x,
      baseZ = (2*Math.PI) * numberRotations[number].z;
  
    // Substract animation rotation
    baseX -= (2*Math.PI) * 1.25;
    baseZ -= (2*Math.PI) * .25;
    
    this.animations.createSequence({name: 'rollDice', steps: [{
        update: (progress) => {
          let diceAlpha = progress * 5;
      
          this._setOpacity(diceAlpha);
      
          cube.position.x = 15-10*progress;
          cube.position.y = 15-13*progress;
          cube.position.z = -(15-10*progress);
      
          cube.rotation.x = baseX + (2*Math.PI) * progress;
          cube.rotation.z = baseZ + (2*Math.PI) * progress / 4;
        },
        easing: EASING.InQuad,
        length: totalLength * 5/8,
      }, {
        update: (progress) => {
          cube.position.x = 5 * (1-progress);
          cube.position.y = 2 + 2 * EASING.Sin(progress/2);
          cube.position.z = -5 * (1-progress);
      
          cube.rotation.x = baseX + (2*Math.PI) * progress / 4;
        },
        length: totalLength * 3/8,
      }, {
        update: (progress) => {
          this._setOpacity(1-progress);
        },
        length: 300,
        delay: 1000,
      }
    ]});
  }
}