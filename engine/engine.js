import Controls from './utils/controls'
import Board from './board'

export default class Engine {
    constructor(props) {
        this.container = props.container;
        this.raycaster = new THREE.Raycaster();
        this.renderer = new THREE.WebGLRenderer({alpha: true});
        this.camera = new THREE.PerspectiveCamera(75, 1/ 2, 0.1, 10000);

        this.scene = new THREE.Scene();
        this.controls = new Controls({container: this.container});

        this.container.appendChild(this.renderer.domElement);
        this.onResize();
        this.board = new Board({scene: this.scene});

        //this.camera.rotateZ(0.05);
        this.camera.position.z = 400;
        this.camera.position.x = 55;
        this.camera.position.y = -55;
        this.board.$.rotateZ(45 * Math.PI/180);
        this.camera.lookAt(this.board.$.position);

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