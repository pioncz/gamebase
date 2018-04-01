export default class Dice {
  constructor({scene, animations}) {
    this.scene = scene;
    this.animation = animations;
  
    var geometry = new THREE.BoxGeometry( 10, 10, 10 );
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  
    var materials = [
      new THREE.MeshBasicMaterial( { color: 0x00ff00 } ),
      new THREE.MeshBasicMaterial( { color: 0xff0000 } ),
      new THREE.MeshBasicMaterial( { color: 0x0000ff } ),
      new THREE.MeshBasicMaterial( { color: 0x00ff00 } ),
      new THREE.MeshBasicMaterial( { color: 0xff0000 } ),
      new THREE.MeshBasicMaterial( { color: 0x0000ff } ),
    ];
    
    var cube = new THREE.Mesh( geometry, materials );
    cube.position.x = 5;
    cube.position.y = 5;
    cube.position.z = 5;
    this.scene.add( cube );
  }
}