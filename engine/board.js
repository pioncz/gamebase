import Utils from 'utils/utils.js'

export default class Board {
  constructor({ scene }) {
    this.scene = scene;
    this.geometry = new THREE.BoxGeometry(32, 32, 1);


    let canvas = Utils.$({element: 'canvas'}),
      ctx = canvas.getContext('2d');
    let x = 20,
      y = 40,
      r = 10,
      width = 512,
      height = 512,
      entity = {
        width: width / 15,
        height: height / 15
      };

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.lineTo(0, height / 2);
    ctx.lineTo(width/2, 0);
    ctx.lineTo(0, 0);
    // ctx.quadraticCurveTo(x + width/2, y, x + width/2, y + r);
    ctx.closePath();
    ctx.fill();
    // ctx.lineTo(x + width, y + height - r);
    // ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    // ctx.lineTo(x + r, y + height);
    // ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    // ctx.lineTo(x, y + r);
    // ctx.quadraticCurveTo(x, y, x + r, y);


    let texture = new THREE.Texture(canvas);
    this.material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 1,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    texture.needsUpdate = true;

    this.$ = new THREE.Mesh(this.geometry, this.material);
    this.scene.add( this.$ );
  }
  update() {

  }
  render() {

  }
}