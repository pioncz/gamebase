import Pawn from "./pawn";
import {EASING, TIMES,} from "./utils/animations";
import Config from 'config.js';

export default class PawnsController {
  constructor(props) {
    this.scene = props.scene;
    this.camera = props.camera;
    this.pawns = {};
    this.fieldLength = props.fieldLength;
    this.animations = props.context.animations;
    this.context = props.context;
    this.columnsLength = props.columnsLength;
    this.renderOrder = props.renderOrder;
    this.pawnSelectionRenderOrder = props.renderOrder;
    this.orientation = { portrait: false, rotationY: 0,};

    this.$ = new THREE.Group();
    this.$.name = 'PawnsController';
  }
  createPawns({pawns, firstPlayerId, }) {
    for (let pawnIndex in pawns) {
      let pawnId = pawns[pawnIndex].id,
        parsedX = (pawns[pawnIndex].x - Math.floor(this.columnsLength/2)) * this.fieldLength,
        parsedZ = (pawns[pawnIndex].z - Math.floor(this.columnsLength/2)) * this.fieldLength,
        playerId = pawns[pawnIndex].playerId;

      let pawn = new Pawn({
        ...pawns[pawnIndex],
        id: pawnId,
        scene: this.scene,
        camera: this.camera,
        parsedX: parsedX,
        parsedZ: parsedZ,
        playerId: playerId,
        x: pawns[pawnIndex].x,
        z: pawns[pawnIndex].z,
        context: this.context,
      });
      this.pawns[pawnId] = pawn;

      pawn.pawnMesh.renderOrder = playerId === firstPlayerId ? 1000 : 10;

      pawn.pawnMesh.material.opacity = 0;
      pawn.selectionObject.renderOrder = this.pawnSelectionRenderOrder;
      this.$.add(pawn.$);
    }
  }
  initPawns() {
    for (let pawnId in this.pawns) {
      let pawn = this.pawns[pawnId];

      if (!pawn) return;

      let delay = Math.floor((+pawnId / 4))*200+(+pawnId % 4)*100;

      this.animations.create({
        id: 'enterPawn' + pawnId,
        length: 300,
        delay: delay,
        easing: EASING.InOutQuad,
        update: (progress) => {
          let newY = (20*(1-progress)) + 2,
            newOpacity = (progress * 5);

          pawn.pawnMesh.material.opacity = newOpacity;
          pawn.moveTo(pawn.parsedX, newY ,pawn.parsedZ);
        },
      });
    }
  }
  removePawns() {
    for(let pawnId in this.pawns) {
      let pawn = this.pawns[pawnId];
      this.animations.removeAnimation('enterPawn' + pawnId);
      pawn.unselect();
      this.$.remove(pawn.$);
      delete this.pawns[pawnId];
    }
  }
  movePawn(pawnId, fieldSequence) {
    let pawn = this.pawns[pawnId],
      animationsSteps = [];

    if (!pawn) {
      console.error('No pawn with id: ' + pawnId);
      return;
    }

    let pawnOnLastField;
    for(let i = 0; i < fieldSequence.length; i++) {
      let {x, z, animationLength,} = fieldSequence[i],
        newX = (x - Math.floor(this.columnsLength/2)) * this.fieldLength,
        newZ = (z - Math.floor(this.columnsLength/2)) * this.fieldLength,
        pawnOnNextField = (!!this.getPawnByXZ(x, z)) &&
          i !== (fieldSequence.length -1);

      animationsSteps.push({
        length: animationLength,
        easing: EASING.InOutQuad,
        update: ((newX, newZ, pawnOnLastField, pawnOnNextField) =>
          (progress) => {
            let oldX = pawn.parsedX,
              oldZ = pawn.parsedZ,
              dX = oldX - newX,
              dZ = oldZ - newZ,
              newParsedX = oldX - (dX * progress),
              newParsedY,
              newParsedZ = oldZ - (dZ * progress);

            if ((progress <= 0.5 && pawnOnLastField) ||
              (progress > 0.5 && pawnOnNextField)) {
              newParsedY = 4 + EASING.Sin(progress / 2);
            } else {
              newParsedY = 2 + 3 * EASING.Sin(progress / 2);
            }

            pawn.moveTo(newParsedX, newParsedY, newParsedZ);
          })(newX, newZ, pawnOnLastField, pawnOnNextField),
        finish: () => {
          pawn.parsedX = newX;
          pawn.parsedZ = newZ;
        },
      });

      pawnOnLastField = pawnOnNextField;
    }

    return this.animations.createSequence({name: 'movePawn'+pawnId, steps: animationsSteps,});
  }
  getPawn(pawnId) {
    return this.pawns[pawnId];
  }
  getPawnByXZ(x,z) {
    let returnPawn;

    for (const pawnId in this.pawns) {
      const pawn = this.pawns[pawnId];

      if (pawn.x === x && pawn.z === z) {
        returnPawn = pawn;
        break;
      }
    }

    return returnPawn;
  }
  selectPawns(pawnIds) {
    for(let pawnId in this.pawns) {
      let pawn = this.pawns[pawnId];

      if (!pawn) {
        console.log(`Invalid pawnId: ${pawnId}`);
        return;
      }

      if (!pawnIds.length) {
        pawn.normalizeColor();
        pawn.unselect();
      } else {
        if (pawnIds.indexOf(pawnId) > -1) {
          if (!pawn.selected) {
            pawn.lighten();
            pawn.select(this.orientation);
          }
        } else {
          if (pawn.selected) {
            pawn.unselect();
          }
          pawn.darken();
        }
      }
    }
  }
  rotate(rotationY, portrait) {
    this.orientation = { portrait, rotationY,};
    this.$.rotation.y = rotationY;

    for(let pawnIndex in this.pawns) {
      this.pawns[pawnIndex].rotate(this.orientation);
    }
  }
}