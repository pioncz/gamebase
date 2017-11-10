import Controls from './utils/controls'
import Board from './board'

export default class Engine {
    constructor(props) {
        this.container = props.container;
        this.raycaster = new THREE.Raycaster();
        this.renderer = new THREE.WebGLRenderer({alpha: true});

        this.scene = new THREE.Scene();
        this.controls = new Controls({container: this.container});

        this.container.appendChild(this.renderer.domElement);
        this.onResize();

        // Hande canvas resizing
        //window.addEventListener('resize', this.onResize.bind(this), true);
// camera
        var aspect = this.width / this.height;
        var d = 20;
        this.camera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 1, 1000 );

        // method 1 - use lookAt
        this.camera.position.set( 20, 20, 20 );
        this.camera.lookAt( new THREE.Vector3(0,0,0) );

        this.board = new Board({scene: this.scene});

        this.animate();
    }
    onResize() {
        let width = this.container.offsetWidth,
            height = this.container.offsetHeight;

        this.width = width;
        this.height = height;
        this.renderer.setSize(width, height);
        //this.camera.aspect = width / height;
        //this.camera.updateProjectionMatrix();
    }
    animate() {
      this.renderer.render(this.scene, this.camera);
      window.requestAnimationFrame(this.animate.bind(this));
    }
}