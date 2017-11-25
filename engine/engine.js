import Controls from './utils/controls'
import { EASING, TIMES, Animations } from './utils/animations'
import Board from './board'

let i = 0;

export default class Engine {
  constructor(props) {
    this.container = props.container;
    this.raycaster = new THREE.Raycaster();
    this.renderer = new THREE.WebGLRenderer({alpha: true});
    
    this.scene = new THREE.Scene();
    this.controls = new Controls({container: this.container});
    this.animations = new Animations();
    
    let width = this.container.offsetWidth,
      height = this.container.offsetHeight,
      aspect = width / height;
    this._lastRender = 0;
    this.frustumSize = 20;
    this.camera = new THREE.OrthographicCamera( - this.frustumSize * aspect, this.frustumSize * aspect, this.frustumSize, - this.frustumSize, 1, 1000 );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( width, height );
    
    this.container.appendChild(this.renderer.domElement);
    
    // Handle canvas resizing
    window.addEventListener('resize', this.onResize.bind(this), true);
    
    // method 1 - use lookAt
    this.camera.position.set( 20, 20, 20 );
    this.camera.lookAt( new THREE.Vector3(0,0,0) );
    
    this.boardWidth = 512;
    this.boardHeight = 512;
    
    let meshWidth = 20,
      meshHeight = 20,
      columnsLength = 11,
      x = 40/columnsLength;
    
    let pawns = [
      {x: 0, y: 2.8, z: 0, color: 'red'},
      {x: x, y: 2.8, z: 0, color: 'green'},
      {x: 0, y: 2.8, z: x * 2, color: 'blue'},
    ];
    
    this.board = new Board({
      scene: this.scene,
      pawns: pawns,
      animations: this.animations,
    });
  
    this.board.movePawn(0, 0, 2.8, 0);
  
    this.animations.create({
      length: 1000,
      times: TIMES.Infinity,
      easing: EASING.InOutQuad,
      update: (progress) => {
        let newX = x * progress,
          newY = 2.8 * (1 + EASING.Sin(progress / 2));
      
        this.board.movePawn(1, newX, newY, x);
      },
    });
    
    this.animate();
  }
  onResize() {
    let width = this.container.offsetWidth,
      height = this.container.offsetHeight,
      aspect = width / height;
    
    this.windowWidth = width;
    this.windowHeight = height;
    this.renderer.setSize(width, height);
    
    this.camera.left   = - this.frustumSize * aspect;
    this.camera.right  =   this.frustumSize * aspect;
    this.camera.top    =   this.frustumSize;
    this.camera.bottom = - this.frustumSize;
    this.camera.updateProjectionMatrix();
  }
  animate(timestamp) {
    let delta = Math.min(Date.now() - this._lastRender, 500);
    
    this.renderer.render(this.scene, this.camera);
    this.animations.tick(delta);
    this._lastRender = Date.now();
    window.requestAnimationFrame(this.animate.bind(this));
  }
}