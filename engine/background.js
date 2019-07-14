import Utils from 'utils/utils.js'

class Background {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    let canvas = Utils.$({element: 'canvas',}),
      texture = new THREE.Texture(canvas),
      width = 1,
      depth = 1,
      height = 1;
    this.material = new THREE.MeshBasicMaterial({map: texture,});
    this.geometry = new THREE.BoxGeometry(width, depth, height);
    this.texture = texture;

    canvas.width = 200;
    canvas.height = 200;

    // Draw gradient
    const ctx = canvas.getContext('2d');
    var grd = ctx.createLinearGradient(0, 0, canvas.width / 2, canvas.height);
    grd.addColorStop(0.6, "#243B55");
    grd.addColorStop(1, "#141E30");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    texture.needsUpdate = true;
    texture.magFilter = THREE.NearestFilter;
    this.$ = new THREE.Mesh(this.geometry, this.material);
    this.$.name = 'Background';
    this.$.position.set(-27.5,-34,-27.5);
    this.$.rotateY(this.$.rotation.y + 45 * Math.PI / 180);

    this.resize();
    this.scene.add(this.$);

    window.bg = this.$;
  }
  resize(scaleX, scaleY) {
    if (scaleX !== this.scaleX || scaleY !== this.scaleY) {
      this.scaleX = scaleX;
      this.scaleY = scaleY;
      this.$.scale.set(scaleX, scaleY, 1);
    }
  }
}

export default Background;