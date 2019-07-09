import Controls from './utils/controls'
import { EASING, TIMES, Animations, } from './utils/animations'
import Board from './board'
import EventEmitter from 'event-emitter-es6'
import Games from 'Games.js'
import DimmingPass from './shaders/dimmingPass';

export default class Engine extends EventEmitter {
  constructor( { container, gameName, }) {
    super();
    this.container = container;
    this.raycaster = new THREE.Raycaster();
    this.initializing = false;
    this.gameName = gameName;
    this.gameId = null;

    this.scene = new THREE.Scene();
    this.controls = new Controls({container: this.container,});
    this.animations = new Animations();
    this.raycaster = new THREE.Raycaster();

    let width = this.container.offsetWidth,
      height = this.container.offsetHeight,
      aspect = width / height;

    this._lastRender = 0;
    this.frustumSize = 21;
    this.camera = new THREE.OrthographicCamera(
      -this.frustumSize * aspect,
      this.frustumSize * aspect,
      this.frustumSize,
      -this.frustumSize,
      1,
      1000);
    this.camera.position.set( 40, 50, 40 );
    this.camera.lookAt( new THREE.Vector3(0,0,0) );
    this.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true,});
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setClearColor( '#243B55', 1 );
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

    // Shaders setup
    this.clock = new THREE.Clock();
    this.composer = new THREE.EffectComposer(this.renderer);
    this.composer.setSize( window.innerWidth * 2, window.innerHeight * 2 );
    let renderPass = new THREE.RenderPass(this.scene, this.camera);

    this.dimmingPass = new DimmingPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      this.scene,
      this.camera,
      [],
      {
        visibleEdgeColor: new THREE.Color(1, 1, 1, 1),
        hiddenEdgeColor: new THREE.Color(0.4, 0.4, 0.4, 1),
      },
    );
    this.dimmingPass.renderToScreen = true;
    this.composer.addPass(renderPass);
    this.composer.addPass(this.dimmingPass);

    this.animations.create({
      id: 'dimmingThickness',
      update: (progress) => {
        let parsedProgress = progress;
        if (progress > .5) {
          parsedProgress = 1 - progress;
        }
        if (this.dimmingPass.selectedObjects.length) {
          this.dimmingPass.edgeThickness = parsedProgress * 1 + 1;
          this.dimmingPass.edgeStrength = parsedProgress * 5 + 2;
        }
      },
      loop: true,
      length: 1000,
      easing: EASING.InOutCubic,
    })

    // Handle canvas events
    window.addEventListener('resize', this.onResize.bind(this), true);
    window.addEventListener('click', this.onClick.bind(this), true);
    window.addEventListener('touchstart', this.onTouch.bind(this), true);

    this.context = {
      animations: this.animations,
      controls: this.controls,
      camera: this.camera,
    };

    if (this.gameName) {
      this.createBoard();
    }


    WebFont.load({
      custom: {
        families: ['FontAwesome',],
        urls: [
          'https://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css',
        ],
        testStrings: {
          'FontAwesome': '\uf001',
        },
      },
      active: () => {
        this.animate();
      },
    });

    this.onResize();
  }
  createBoard() {
    this.board = new Board({
      scene: this.scene,
      renderer: this.renderer,
      pawns: [],
      context: this.context,
      gameName: this.gameName,
    });
    this.onResize();
  }
  onResize() {
    let width = this.container.offsetWidth,
      height = this.container.offsetHeight,
      aspect = width / height;

    this.windowWidth = width;
    this.windowHeight = height;
    this.renderer.setSize( width, height );
    this.composer.setSize( width * 2, height * 2 );

    if (aspect < 1.3) {
      this.camera.left   = - this.frustumSize;
      this.camera.right  =   this.frustumSize;
      this.camera.top    =   this.frustumSize / aspect;
      this.camera.bottom = - this.frustumSize / aspect;
      if (this.board) {
        this.board.setRotation(false); //rotates board
      }
    } else {
      this.camera.left   = - this.frustumSize * aspect;
      this.camera.right  =   this.frustumSize * aspect;
      this.camera.top    =   this.frustumSize;
      this.camera.bottom = - this.frustumSize;
      if (this.board) {
        this.board.setRotation(true); //rotates board
      }
    }
    this.camera.updateProjectionMatrix();
  }
  onClick(e) {
    if (!this.gameName) return;

    let pawnIds = [];

    // Create 5 points to check intersections with in distance of pointsDistance
    const pointsDistance = 8;
    const boundingRect = this.renderer.domElement.getBoundingClientRect();
    for(let i = 0; i < 5; i++) {
      const helperX = i < 3 ? (i - 1) % 2 * pointsDistance : 0;
      const helperY = i > 2 ?
        i > 3 ? pointsDistance : -pointsDistance
        : 0;

      const point = {
        x: ( (e.clientX - boundingRect.left + helperX) / this.renderer.domElement.clientWidth ) * 2 - 1,
        y: - ( (e.clientY - boundingRect.top + helperY) / this.renderer.domElement.clientHeight ) * 2 + 1,
      };

      this.raycaster.setFromCamera( point, this.camera );
      const pawns = this.board.handleClick(this.raycaster);
      const ids = pawns.map(pawn => pawn.id );
      pawnIds = pawnIds.concat(ids);
    }

    this.emit('click', { pawnIds: [...new Set(pawnIds),], });
  }
  onTouch(e) {
    if (e.touches && e.touches.length) {

      this.onClick({
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
      });
      e.stopPropagation();
    }
  }
  initGame({gameId, gameName, pawns, players,}, firstPlayerId) {
    if (!this.board) {
      this.gameName = gameName;
      this.createBoard();
    }

    if (this.initializing) {
      console.log('Game is updating already.');
      return;
    }
    if (this.gameId === gameId) {
      console.log('Game ids are the same.');
      return;
    }

    if (this.gameName !== gameName) {
      this.changeGame(gameName);
    }

    this.initializing = true;

    let firstPlayerIndex = players.findIndex(player => player.id === firstPlayerId);
    this.board.initGame({pawns, players, firstPlayerIndex,});
    this.onResize();
    this.initializing = false;
  }
  selectPawns(pawnIds) {
    this.dimmingPass.selectedObjects = [];
    for(let i = 0; i < pawnIds.length; i++) {
      let pawn = this.board.pawnsController.getPawn(pawnIds[i]);
      this.dimmingPass.selectedObjects.push(pawn.pawnMesh);
    }
    this.board.pawnsController.selectPawns(pawnIds);
  }
  animate(timestamp) {
    let delta = Math.min(Date.now() - this._lastRender, 500);

    this.composer.render(this.clock.getDelta());
    this.animations.tick(delta);
    this._lastRender = Date.now();
    window.requestAnimationFrame(this.animate.bind(this));
  }
  changeGame(gameName) {
    if (this.gameName !== gameName) {
      this.gameName = gameName;
      if (!this.board) {
        this.createBoard();
      }
      this.board.changeGame(gameName);
    }
  }
  rollDice(number, diceColors) {
    this.board.rollDice(number, diceColors);
  }
}