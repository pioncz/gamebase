import Controls from './utils/controls'
import Board from './board'

export default class Engine {
    constructor(props) {
        this.container = props.container;
        this.raycaster = new THREE.Raycaster();
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        this.camera = new THREE.PerspectiveCamera(75, 1/ 2, 0.1, 10000);

        this.scene = new THREE.Scene();
        this.controls = new Controls({container: this.container});
        this.camera.position.z = 35;
        this.container.appendChild(this.renderer.domElement);
        this.onResize();
        this.board = new Board({scene: this.scene});

        // Hande canvas resizing
        window.addEventListener('resize', this.onResize.bind(this), true);
        this.animate();
    }
    onResize() {
        let width = this.container.offsetWidth,
            height = this.container.offsetHeight;

        this.width = width;
        this.height = height;
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
    animate() {
      this.renderer.render(this.scene, this.camera);
      window.requestAnimationFrame(this.animate.bind(this));
    }
}