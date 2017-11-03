export default class Board {
  constructor({ scene }) {
    this.scene = scene;
    this.geometry = new THREE.BoxGeometry(32, 32, 1);
    this.material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      opacity: 0.9,
      transparent: true
    });
    this.$ = new THREE.Mesh(this.geometry, this.material);
    this.scene.add( this.$ );
  }
  update() {

  }
  render() {

  }
}