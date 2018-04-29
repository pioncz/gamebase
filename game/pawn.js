export default class Pawn {
  constructor(props) {
    this.scene = props.scene;
    this.x = props.x;
    this.z = props.z;
    var geometry = new THREE.ConeGeometry(1.2, 2.8, 8, 1, true, 0, 6.3);
    var material = new THREE.MeshPhongMaterial({
      color: props.color,
      flatShading: true,
      specular: 0x000000,
      shininess: 0,
      reflectivity: 0,
      transparent: true,
    });
    this.$ = new THREE.Mesh(geometry, material);

    this.parsedX = props.parsedX;
    this.parsedZ = props.parsedZ;
    this.moveTo(props.parsedX, 22.8, props.parsedZ);
    this.scene.add(this.$);
  }
  moveTo(x, y, z) {
    this.$.position.x = x + 0.4;
    this.$.position.y = y;
    this.$.position.z = z + 0.4;
  }
}