import Controls from './utils/controls'
import { EASING, TIMES, Animations } from './utils/animations'
import Board from './board'

let i = 0;

export default class Game {
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
        this.camera = new THREE.OrthographicCamera(
            -this.frustumSize * aspect,
            this.frustumSize * aspect,
            this.frustumSize,
            -this.frustumSize,
            1,
            1000);
        this.camera.position.set( 20, 20, 20 );
        this.camera.lookAt( new THREE.Vector3(0,0,0) );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( width, height );
        this.container.appendChild(this.renderer.domElement);

        // Handle canvas resizing
        window.addEventListener('resize', this.onResize.bind(this), true);

        let pawns = [
            {id: 0, x: 2, z: 1, color: 'red'},
            {id: 1, x: 2, z: 1, color: 'green'},
            {id: 2, x: 4, z: 1, color: 'blue'},
        ];

        this.board = new Board({
            width: 512,
            height: 512,
            scene: this.scene,
            renderer: this.renderer,
            pawns: pawns,
            animations: this.animations,
        });

        this.board.movePawn('1', 4, 1);
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