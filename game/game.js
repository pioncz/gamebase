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
            {id: 0, x: 9, z: 10, color: '#D50000', player: '1'},
            {id: 1, x: 10, z: 10, color: '#D50000', player: '1'},
            {id: 2, x: 9, z: 9, color: '#D50000', player: '1'},
            {id: 3, x: 10, z: 9, color: '#D50000', player: '1'},
            {id: 4, x: 9, z: 0, color: '#64DD17', player: '0'},
            {id: 5, x: 10, z: 0, color: '#64DD17', player: '0'},
            {id: 6, x: 9, z: 1, color: '#64DD17', player: '0'},
            {id: 7, x: 10, z: 1, color: '#64DD17', player: '0'},
            {id: 8, x: 0, z: 9, color: '#1DE9B6', player: '2'},
          {id: 9, x: 1, z: 9, color: '#1DE9B6', player: '2'},
          {id: 10, x: 0, z: 10, color: '#1DE9B6', player: '2'},
          {id: 11, x: 1, z: 10, color: '#1DE9B6', player: '2'},
          {id: 12, x: 0, z: 0, color: '#FFEA00', player: '3'},
          {id: 13, x: 1, z: 0, color: '#FFEA00', player: '3'},
          {id: 14, x: 0, z: 1, color: '#FFEA00', player: '3'},
          {id: 15, x: 1, z: 1, color: '#FFEA00', player: '3'},
        ];
        let getPawn = (pawnId) => {
          return pawns.find((a) => a.id == pawnId);
        };

        this.board = new Board({
            width: 512,
            height: 512,
            scene: this.scene,
            renderer: this.renderer,
            pawns: pawns,
            getPawn: getPawn,
            animations: this.animations,
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