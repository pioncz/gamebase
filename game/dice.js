import Utils from "./utils/utils";

export default class Dice {
  constructor({scene, animations}) {
    this.scene = scene;
    this.animation = animations;
  
    var geometry = new THREE.BoxGeometry( 2, 2, 2 );
    
    var materials = [
      this._createFace(1),
      this._createFace(2),
      this._createFace(3),
      this._createFace(4),
      this._createFace(5),
      this._createFace(6),
    ];
    
    var cube = new THREE.Mesh( geometry, materials );
    cube.position.x = 0;
    cube.position.y = 2;
    cube.position.z = 0;
    this.scene.add( cube );
    window.cube = cube;
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
  
    ctx.fillStyle = "#f6f6f5";
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = "#1e1e1e";
    let dots = dotPositions[number];
    for(let dotI in dots) {
      let dot = dots[dotI];
  
      drawDot(dot.x, dot.y, radius);
    }
    // drawDot(w4, h4, radius);
    // drawDot(w2, h4, radius);
    // drawDot((w2+w4), h4, radius);
    // drawDot(w2, h2, radius);
    // drawDot(w4, (h2+h4), radius);
    // drawDot(w2, (h2+h4), radius);
    // drawDot((w2+w4), (h2+h4), radius);
    
    texture.needsUpdate = true;
    
    return new THREE.MeshBasicMaterial({map: texture});
  }
}