export default class Pawn {
  constructor(props) {
    this.scene = props.scene;

    var geometry = new THREE.ConeGeometry(1.2, 2.8, 20, 1, false, 0, 6.5);
    var material = new THREE.MeshBasicMaterial({color: props.color, wireframe: true});
    this.$ = new THREE.Mesh(geometry, material);

    this.moveTo(props.parsedX, 2.8, props.parsedZ);
    this.scene.add(this.$);
  }
  moveTo(x, y, z) {
    this.$.position.x = x + 0.4;
    this.parsedX = x;
    this.$.position.y = y;
    this.$.position.z = z + 0.4;
    this.parsedZ = z;
  }
}