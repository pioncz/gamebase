import Controls from './utils/controls';
import { EASING, TIMES, Animations } from './utils/animations';
import Board from './board';
import Games from './../games/Games.js';
import DimmingPass from './shaders/dimmingPass';
import Utils from './utils/utils';
import Stats from './utils/stats';
import EventsEmitter from './utils/eventsEmitter.js';

export default class Engine extends EventsEmitter {
  constructor({ container, gameName }) {
    super();
    this.container = container;
    this.raycaster = new THREE.Raycaster();
    this.initializing = false;
    this.gameName = gameName;
    this.gameId = null;
    this.firstPlayerId = null;

    this.scene = new THREE.Scene();
    this.animations = new Animations();
    this.raycaster = new THREE.Raycaster();

    this.stats = new Stats();
    this.stats.showPanel(0);
    this.stats.dom.style.position = 'absolute';
    this.stats.dom.style.zIndex = '1000';
    this.stats.dom.style.top = 0;

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
      200,
    );
    this.camera.position.set(40, 50, 40);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor('#000', 0);
    this.renderer.setSize(width, height);
    this.container.appendChild(this.renderer.domElement);

    var ambientLight = new THREE.AmbientLight(0x000000);
    this.scene.add(ambientLight);
    var lights = [],
      intensity = 0.6;
    lights[0] = new THREE.PointLight(0xffffff, intensity, 0);
    lights[1] = new THREE.PointLight(0xffffff, intensity, 0);
    lights[2] = new THREE.PointLight(0xffffff, intensity, 0);
    lights[3] = new THREE.PointLight(0xffffff, intensity, 0);

    let dist = 60,
      distH = 20;
    lights[0].position.set(dist, distH, 0);
    lights[1].position.set(-dist, distH, 0);
    lights[2].position.set(0, distH, dist);
    lights[3].position.set(0, distH, -dist);

    this.scene.add(lights[0]);
    this.scene.add(lights[1]);
    this.scene.add(lights[2]);
    this.scene.add(lights[3]);

    // Shaders setup
    this.clock = new THREE.Clock();
    this.composer = new THREE.EffectComposer(this.renderer);
    this.composer.setSize(
      window.innerWidth * 2,
      window.innerHeight * 2,
    );
    let renderPass = new THREE.RenderPass(this.scene, this.camera);
    renderPass.renderToScreen = true;

    this.composer.addPass(renderPass);
    // this.composer.addPass(this.dimmingPass);

    this.edgeCorrection = 0; // updated on window resize

    // Handle canvas events
    window.addEventListener(
      'resize',
      () => {
        // Ios doesnt update container size properly onresize
        if (Utils.isIos) {
          setTimeout(this.onResize, 100);
        } else {
          this.onResize();
        }
      },
      true,
    );
    if ('ontouchstart' in document.documentElement) {
      window.addEventListener(
        'touchstart',
        this.onTouch.bind(this),
        true,
      );
    } else {
      window.addEventListener('click', this.onClick.bind(this), true);
    }

    this.context = {
      animations: this.animations,
      camera: this.camera,
    };

    this.createBoard();
    this.onResize();
    this.animate();
  }
  createBoard() {
    this.board = new Board({
      scene: this.scene,
      camera: this.camera,
      renderer: this.renderer,
      pawns: [],
      context: this.context,
      gameName: this.gameName,
    });
    this.onResize();
  }
  onResize = () => {
    let width = this.container.offsetWidth,
      height = this.container.offsetHeight,
      aspect = document.body.clientWidth / document.body.clientHeight;
    if (isNaN(aspect)) return;

    this.windowWidth = width;
    this.windowHeight = height;
    this.renderer.setSize(width, height);
    this.composer.setSize(width * 2, height * 2);

    this.edgeCorrection = Math.max(
      Math.min((this.windowWidth - 600) / 1400, 1),
      0,
    ); // 0 - 1

    document.body.classList = '';

    if (aspect <= 1.3) {
      document.body.classList.add('portrait');

      if (aspect <= 0.8) {
        this.frustumSize = 22;
      } else {
        this.frustumSize = 26;
      }

      const moveY = 1;

      this.camera.left = -this.frustumSize;
      this.camera.right = this.frustumSize;
      this.camera.top = (this.frustumSize + moveY) / aspect;
      this.camera.bottom = -(this.frustumSize - moveY) / aspect;
      if (this.board) {
        this.board.setPortraitRotation(true); //rotates board
      }
    } else if (this.windowWidth < 1000) {
      document.body.classList.add('landscape');

      this.frustumSize = 18;
      const moveY = 0;

      this.camera.left = -this.frustumSize * aspect - 16;
      this.camera.right = this.frustumSize * aspect;
      this.camera.top = this.frustumSize + moveY;
      this.camera.bottom = -this.frustumSize + moveY;

      if (this.board) {
        this.board.setPortraitRotation(true); //rotates board
      }
    } else {
      if (document.body.clientWidth < 1000) {
        document.body.classList.add('landscape');
      }

      this.frustumSize = 22;

      this.camera.left = -this.frustumSize * aspect;
      this.camera.right = this.frustumSize * aspect;
      this.camera.top = this.frustumSize;
      this.camera.bottom = -this.frustumSize;
      if (this.board) {
        this.board.setPortraitRotation(false); //rotates board

        const marginTop = 4;
        this.board.$.position.set(marginTop, 0.8, marginTop);
        this.board.pawnsController.$.position.set(
          marginTop,
          0,
          marginTop,
        );
        this.board.diceContainer.position.set(
          marginTop,
          0.0,
          marginTop,
        );
      }
    }

    this.camera.updateProjectionMatrix();
  };
  onClick(e) {
    if (!this.gameName) return;

    const boundingRect =
      this.renderer.domElement.getBoundingClientRect();
    const point = {
      x:
        ((e.clientX - boundingRect.left) /
          this.renderer.domElement.clientWidth) *
          2 -
        1,
      y:
        -(
          (e.clientY - boundingRect.top) /
          this.renderer.domElement.clientHeight
        ) *
          2 +
        1,
    };

    this.raycaster.setFromCamera(point, this.camera);
    const pawn = this.board.handleClick(
      this.raycaster,
      this.firstPlayerId,
    );

    // this.emit('click', { pawnId: pawn ? pawn.id : null });
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
  initGame(
    { gameId, gameName, pawns, players },
    firstPlayerId,
    animationLength,
  ) {
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
    this.firstPlayerId = firstPlayerId;

    this.firstPlayerIndex = players.findIndex(
      (player) => player.id === firstPlayerId,
    );
    this.onResize();
    this.board
      .initGame({
        pawns,
        players,
        firstPlayerIndex: this.firstPlayerIndex,
        animationLength,
        firstPlayerId,
      })
      .then(() => {
        this.initializing = false;
      });
  }
  clearGame = () => {
    if (!this.board) {
      console.log('No board');
      return;
    }
    this.board.clearGame();
  };
  selectPawns(pawnIds) {
    if (!this.board) return;

    this.board.selectPawns(pawnIds);
  }
  animate = () => {
    const now = Date.now();
    const delta = this._lastRender ? now - this._lastRender : 0;

    if (delta > 24 || !this._lastRender) {
      this._lastRender = now;
      this.stats.begin();
      this.animations.tick(delta);
      this.composer.render(this.clock.getDelta());
      this.stats.end();
    }

    window.setTimeout(
      () => window.requestAnimationFrame(this.animate),
      16,
    );
  };
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
  toggleControls() {
    if (!this.controls) {
      this.controls = new THREE.OrbitControls(
        this.camera,
        this.renderer.domElement,
      );
    } else if (this.controls.enabled) {
      this.controls.enabled = false;
    } else {
      this.controls.enabled = true;
    }
  }
  resetControls() {
    if (!this.controls) {
      return;
    }
    this.controls.reset();
  }
  movePawn(pawnMove) {
    this.board.movePawn(pawnMove);
  }
  appendStats() {
    document.body.appendChild(this.stats.dom);
  }
}
