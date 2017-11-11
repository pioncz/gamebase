export default class Pawn {
  constructor(props) {
    this.scene = props.scene;

    var geometry = new THREE.ConeGeometry(3.4, 8, 20, 1, false, 0, 6.5);
    var material = new THREE.MeshBasicMaterial({color: props.color});
    var cone = new THREE.Mesh(geometry, material);
    this.scene.add(cone);
  }
}