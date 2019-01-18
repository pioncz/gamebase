import Controls from './utils/controls'
import { EASING, TIMES, Animations } from './utils/animations'
import Board from './board'
import EventEmitter from 'event-emitter-es6'

export default class Engine extends EventEmitter {
  constructor(props) {
    super();
    this.container = props.container;
    this.raycaster = new THREE.Raycaster();
    this.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    this.initializing = false;
    this.gameId = null;

    this.scene = new THREE.Scene();
    this.controls = new Controls({container: this.container});
    this.animations = new Animations();
    this.raycaster = new THREE.Raycaster();

    let width = this.container.offsetWidth,
      height = this.container.offsetHeight,
      aspect = width / height;

    this._lastRender = 0;
    this.frustumSize = 15;
    this.camera = new THREE.OrthographicCamera(
      -this.frustumSize * aspect,
      this.frustumSize * aspect,
      this.frustumSize,
      -this.frustumSize,
      1,
      1000);
    // this.camera = new THREE.PerspectiveCamera( 30, aspect, 1, 1000 );
    this.camera.position.set( 50, 50, 50 );
    // this.camera.position.set( 60, 60, 60 );
    this.camera.lookAt( new THREE.Vector3(0,0,0) );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( width, height );
    this.container.appendChild(this.renderer.domElement);

    var ambientLight = new THREE.AmbientLight( 0x000000 );
    this.scene.add( ambientLight );
    var lights = [],
      intensity = .6;
    lights[ 0 ] = new THREE.PointLight( 0xffffff, intensity, 0 );
    lights[ 1 ] = new THREE.PointLight( 0xffffff, intensity, 0 );
    lights[ 2 ] = new THREE.PointLight( 0xffffff, intensity, 0 );
    lights[ 3 ] = new THREE.PointLight( 0xffffff, intensity, 0 );

    let dist = 60,
      distH = 20;
    lights[ 0 ].position.set( dist, distH, 0 );
    lights[ 1 ].position.set( -dist, distH, 0 );
    lights[ 2 ].position.set( 0, distH, dist );
    lights[ 3 ].position.set( 0, distH, -dist );

    this.scene.add( lights[ 0 ] );
    this.scene.add( lights[ 1 ] );
    this.scene.add( lights[ 2 ] );
    this.scene.add( lights[ 3 ] );

    // Handle canvas events
    window.addEventListener('resize', this.onResize.bind(this), true);
    window.addEventListener('click', this.onClick.bind(this), true);

    this.context = {
      animations: this.animations,
      controls: this.controls,
      camera: this.camera,
    };

    this.board = new Board({
      scene: this.scene,
      renderer: this.renderer,
      pawns: [],
      context: this.context,
    });

    WebFont.load({
      custom: {
        families: ['FontAwesome'],
        urls: [
          'https://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css',
        ],
        testStrings: {
          'FontAwesome': '\uf001'
        }
      },
      active: () => {
        this.animate();
      }
    });

    this.onResize();
  }
  onResize() {
    let width = this.container.offsetWidth,
      height = this.container.offsetHeight,
      aspect = width / height,
      gameScale = width < 1400 ? width / 1400 : 1;

    this.windowWidth = width;
    this.windowHeight = height;
    this.renderer.setSize(width, height);

    this.camera.left   = - this.frustumSize * aspect / gameScale;
    this.camera.right  =   this.frustumSize * aspect / gameScale;
    this.camera.top    =   this.frustumSize / gameScale;
    this.camera.bottom = - this.frustumSize / gameScale;
    this.camera.updateProjectionMatrix();

    this.board.setSize(gameScale);
  }
  onClick(e) {
    let mouse = {
      x: ( e.clientX / this.renderer.domElement.clientWidth ) * 2 - 1,
      y: - ( e.clientY / this.renderer.domElement.clientHeight ) * 2 + 1,
    };

    this.raycaster.setFromCamera( mouse, this.camera );

    let pawns = this.board.handleClick(this.raycaster),
      pawnIds = pawns.map(pawn => pawn.id );

    this.emit('click', { pawnIds });
  }
  initGame({gameId, pawns, players}, firstPlayerId) {
    if (this.initializing) {
      console.log('Game is updating already.');
      return;
    }
    if (this.gameId === gameId) {
      console.log('Game ids are the same.');
      return;
    }

    this.initializing = true;

    let firstPlayerIndex = players.findIndex(player => player.id === firstPlayerId);
    this.board.initGame({pawns, players, firstPlayerIndex});
    this.onResize();
    this.initializing = false;
  }
  selectPawns(pawnIds) {
    this.board.pawnsController.selectPawns(pawnIds);
  }
  animate(timestamp) {
    let delta = Math.min(Date.now() - this._lastRender, 500);

    this.renderer.render(this.scene, this.camera);
    this.animations.tick(delta);
    this._lastRender = Date.now();
    window.requestAnimationFrame(this.animate.bind(this));
  }
}