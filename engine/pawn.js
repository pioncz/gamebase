export default class Pawn {
  constructor(props) {
    this.scene = props.scene;
//8
    var geometry = new THREE.ConeGeometry(1.2, 2.8, 20, 1, false, 0, 6.5);
    var material = new THREE.MeshBasicMaterial({color: props.color, wireframe: true});
    this.$ = new THREE.Mesh(geometry, material);

    this.$.position.x = props.x + 0.4;
    this.$.position.y = 2.8;
    this.$.position.z = props.z + 0.4;
window.$ = this.$;
    this.scene.add(this.$);
  }
}