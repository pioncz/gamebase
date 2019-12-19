import Utils from 'utils/utils.js'
import PawnsController from 'pawnsController';
import Dice from './dice';
import BoardUtils from './../games/ludo/BoardUtils.js';
import Games from 'Games.js';
import { EASING, } from './utils/animations'

const GridAmount = 11;

const RenderOrder = {
  PawnSelection: 1000,
  PawnsController: 800,
  Board: 400,
};

export default class Board {
  constructor(props) {
    this.scene = props.scene;
    this.camera = props.camera;
    this.animations = props.context.animations;
    this.context = props.context;
    this.canvasWidth = 512;
    this.canvasHeight = 512;
    this.renderer = props.renderer;
    this.columnsLength = 11;
    this.fieldLength = 40 / this.columnsLength;
    this.canvas = Utils.$({element: 'canvas',});
    this.texture = null;
    this.rotation = 0;
    this.portraitRotation = false;
    this.gameName = props.gameName;
    this.dices = [];
    this.diceAnimationLength;
    this.diceContainer = new THREE.Group();
    this.scene.add(this.diceContainer);

    this.createBoard();
    this.createPawns();
    this.rotateBoard(this.rotation);
    this.changeGame(props.gameName);
  }
  // Color fields, create pawns
  initGame(props) {
    return new Promise((resolve, reject) => {
      this.pawnsController.removePawns();
      this.pawnsController.$.position.y = 0;

      const { players, firstPlayerIndex, animationLength, } = props;

      // Set field colors
      for(let fieldIndex in this.fields) {
        let field = this.fields[fieldIndex];

        if (field.playerIndex !== undefined) {
          let player = players[field.playerIndex];

          if (player) {
            field.color = player.color;
            field.disabled = false;
          } else {
            field.disabled = true;
          }
        }
      }
      this.drawBoard();

      this.pawnsController.createPawns({pawns: props.pawns,});

      let newRotation = (Math.PI/2) * firstPlayerIndex;
      this.rotateBoard(newRotation);

      const animateBoard = () => {
        const animationRotation = Math.PI/4;
        const startRotation = this.rotation - animationRotation;

        this.$.position.y = 0;
        this.pawnsController.$.position.y = 0;
        this.animations.create(
          {
            id: 'board-init',
            easing: EASING.InOutQuint,
            length: animationLength,
            update: (progress) => {
              const opacity = progress;
              this.$.material[0].opacity = opacity;
              this.$.material[1].opacity = opacity;
              this.$.scale.set(progress, progress, progress);
              this.rotateBoard(startRotation + animationRotation * progress);
            },
          },
        ).then(() => {
          this.pawnsController.initPawns();
          resolve();
        });
      };

      this.animations
        .finishAnimation('board-clear')
        .then(animateBoard, animateBoard);
    });
  }
  clearGame = () => {
    this.animations.removeAnimation('board-init');

    this.$.position.y = 0;
    this.pawnsController.$.position.y = 0;
    this.animations.create(
      {
        id: 'board-clear',
        length: 800,
        easing: EASING.InOutQuint,
        update: (progress) => {
          const opacity = 1 - progress;
          this.$.material[0].opacity = opacity;
          this.$.material[1].opacity = opacity;
          this.$.position.y -= progress * 5;
          this.pawnsController.$.position.y -= progress * 5;
        },
      },
    ).then(() => {
      this.pawnsController.removePawns();
    })
  }
  drawBoard() {
    let ctx = this.canvas.getContext('2d'),
      width = this.canvasWidth,
      height = this.canvasHeight;
    this.canvas.width = width,
    this.canvas.height = height;
    Games[this.gameName].Board.drawBoard(this.canvas);

    //fields
    let drawField = (field) => {
      let x = field.x,
        z = field.z,
        color = 'white',
        lineWidth = 4,
        strokeStyle = 'rgba(0,0,0,.07)';

      if (field.color) {
        color = field.color;
        strokeStyle = 'rgba(255,255,255,0.3)';
      }
      if (field.disabled) {
        color = '#bbb';
        strokeStyle = 'rgba(255,255,255,0.3)';
      }

      ctx.beginPath();
      var cellSize = width / GridAmount;
      var r = cellSize / 2 * 0.75;
      var r2 = cellSize / 2 * 0.60;
      let cellX = (x + 0.5) * cellSize,
        cellZ = (z + 0.5) * cellSize;

      ctx.arc(cellX, cellZ, r, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.save();
      ctx.clip();

      ctx.arc(cellX, cellZ, r2, 0, 2 * Math.PI);
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = strokeStyle;

      ctx.stroke();
      ctx.restore();
    }

    for (let i = 0; i < this.fields.length; i++) {
      drawField(this.fields[i]);
    }

    this.texture.needsUpdate = true;
  }
  createPawns() {
    this.pawnsController = new PawnsController({
      context: this.context,
      scene: this.scene,
      camera: this.camera,
      fieldLength: this.fieldLength,
      pawns: [],
      animations: this.animations,
      columnsLength: this.columnsLength,
      renderOrder: RenderOrder.PawnsController,
      pawnSelectionRenderOrder: RenderOrder.PawnSelection,
    });
    this.scene.add(this.pawnsController.$);
  }
  selectPawns(pawnIds) {
    if (pawnIds.length) {
      this.animations.create(
        {
          id: 'board-darken',
          length: 200,
          easing: EASING.InOutQuint,
          update: (progress) => {
            const opacity = 1.0 - 0.2 * progress;
            this.$.material[0].opacity = opacity;
            this.$.material[1].opacity = opacity;
          },
        }
      );
    } else {
      this.animations.create(
        {
          id: 'board-lighten',
          length: 200,
          easing: EASING.InOutQuint,
          update: (progress) => {
            const opacity = 0.8 + 0.2 * progress;
            this.$.material[0].opacity = opacity;
            this.$.material[1].opacity = opacity;
          },
        }
      );
    }
    this.pawnsController.selectPawns(pawnIds);
  }
  createBoard() {
    let canvas = this.canvas,
      texture = new THREE.Texture(canvas),
      width = 40,
      depth = 2,
      height = 40;
    this.materials = [
      new THREE.MeshBasicMaterial(
        {
          map: texture,
          transparent: true,
          opacity: 0,
        }
      ),
      new THREE.MeshBasicMaterial(
        {
          color: 'rgba(61, 72, 97, 0.8)',
          transparent: true,
          opacity: 0,
        }
      ),
    ];
    this.geometry = new THREE.BoxGeometry(width, depth, height);
    this.texture = texture;

    texture.needsUpdate = true;

    this.geometry.faces[0].materialIndex = 1;
    this.geometry.faces[1].materialIndex = 1;
    this.geometry.faces[4].materialIndex = 0;
    this.geometry.faces[5].materialIndex = 0;
    this.geometry.faces[8].materialIndex = 1;
    this.geometry.faces[9].materialIndex = 1;

    this.$ = new THREE.Mesh(this.geometry, this.materials);
    this.$.scale.set(0.01, 0.01, 0.01);
    this.$.name = 'BoardMesh';
    this.scene.add(this.$);
  }
  /* setRotation
    rotate if rotate param is true
   */
  setPortraitRotation(isPortrait) {
    this.portraitRotation = isPortrait;
    this.rotateBoard(this.rotation);
  }
  getFieldsSequence(pawnData, length) {
    let currentField,
      currentFieldI = 0,
      fieldSequence = [],
      firstStart = false;

    for(let i = 0; i < this.fields.length; i++) {
      let field = this.fields[i];

      if (field.x === pawnData.x && field.z === pawnData.z) {
        currentField = field;
        currentFieldI = i;
        break;
      }
    }

    if (currentField) {
      for(let i = currentFieldI + 1; i < this.fields.length && fieldSequence.length < length; i++) {
        let field = this.fields[i];

        if (field.type === 'start' && field.player === pawnData.player) {
          fieldSequence.push(field);
          firstStart = true;
          break;
        } else if (!field.type || field.type === 'start') {
          fieldSequence.push(field);
        } else if (field.type === 'goal' && field.player === pawnData.player) {
          fieldSequence.push(field);
        }
      }
      if (!firstStart && fieldSequence.length < length) {
        for(let j = 0; j < currentFieldI + 1 && fieldSequence.length < length; j++) {
          let field = this.fields[j];

          if (field.type === 'start' && field.player === pawnData.player) {
            fieldSequence.push(field);
            break;
          } else if (!field.type || field.type === 'start') {
            fieldSequence.push(field);
          } else if (field.type === 'goal' && field.player === pawnData.player) {
            fieldSequence.push(field);
          }
        }
      }
    }

    return fieldSequence;
  }
  checkMoves(pawns, diceNumber, playerIndex) {
    return BoardUtils.checkMoves(pawns, diceNumber, playerIndex);
  }
  movePawn({pawnId, fieldSequence,}) {
    let pawn = this.pawnsController.getPawn(pawnId);

    if (pawn && fieldSequence.length) {
      return this.pawnsController.movePawn(pawnId, fieldSequence)
        .then(() => {
          pawn.x = fieldSequence[fieldSequence.length-1].x;
          pawn.z = fieldSequence[fieldSequence.length-1].z;
        }, () => {
          console.log('Cannot move this pawn with this dice value');
        });
    }
  }
  handleClick(raycaster) {
    let pawns = [];

    for(let pawnId of Object.keys(this.pawnsController.pawns)) {
      let pawn = this.pawnsController.pawns[pawnId],
        intersects = raycaster.intersectObject(pawn.boundingSphere, true);

      if (pawn && intersects.length) {
        pawns.push(pawn);
      }
    }

    return pawns;
  }
  rotateBoard(newRotation) {
    this.rotation = newRotation;

    let parsedRotation = newRotation;
    if (this.portraitRotation) {
      parsedRotation += Math.PI / 4;
    }
    this.$.rotation.y = parsedRotation;
    this.pawnsController.rotate(parsedRotation, this.portraitRotation);
  }
  createSelectionObjects() {
    if (this.pawnsController) {
      this.pawnsController.createSelectionObjects();
    }
    this.rotateBoard(this.rotation);
  }
  changeGame(gameName) {
    this.gameName = gameName;
    this.fields = Games[this.gameName].Fields;
    this.diceAnimationLength = Games[gameName].AnimationLengths.rollDice;
    this.clearGame();
  }
  rollDice(number, diceColors) {
    if (this.dices.length) {
      for(let i = this.dices.length - 1; i >= 0; i--) {
        this.dices[i].remove();
        this.dices.splice(i, 1);
      }
    }
    const dice = new Dice({
      container: this.diceContainer,
      context: this.context,
      colors: diceColors,
    });

    dice.roll(number, this.diceAnimationLength);
    this.dices.push(dice);
  }
}