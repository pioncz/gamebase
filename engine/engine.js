import Controls from './utils/controls'
import Board from './board'
import Pawn from './pawn'

export default class Engine {
    constructor(props) {
        this.container = props.container;
        this.raycaster = new THREE.Raycaster();
        this.renderer = new THREE.WebGLRenderer({alpha: true});

        this.scene = new THREE.Scene();
        this.controls = new Controls({container: this.container});

        let width = this.container.offsetWidth,
          height = this.container.offsetHeight;
        var aspect = width / height;
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

        this.board = new Board({scene: this.scene});
        this.pawn = new Pawn({scene: this.scene, color: 'red'});

        this.animate();
    }
    onResize() {
        let width = this.container.offsetWidth,
            height = this.container.offsetHeight;

        this.width = width;
        this.height = height;
        this.renderer.setSize(width, height);

        var aspect = width / height;
      this.camera.left   = - this.frustumSize * aspect;
      this.camera.right  =   this.frustumSize * aspect;
      this.camera.top    =   this.frustumSize;
      this.camera.bottom = - this.frustumSize;
      this.camera.updateProjectionMatrix();
    }
    animate() {
      this.renderer.render(this.scene, this.camera);
      window.requestAnimationFrame(this.animate.bind(this));
    }
}