import Pawn from "./pawn";
import {EASING, TIMES,} from "./utils/animations";
import Config from 'config.js';

export default class PawnsController {
  constructor(props) {
    this.scene = props.scene;
    this.pawns = {};
    this.fieldLength = props.fieldLength;
    this.animations = props.context.animations;
    this.context = props.context;
    this.columnsLength = props.columnsLength;
    this.animationLength = null;

    this.$ = new THREE.Group();
    this.$.name = 'PawnsController';
  }
  createPawns({pawns,}) {
    for (let pawnIndex in pawns) {
      let pawnId = pawns[pawnIndex].id,
        parsedX = (pawns[pawnIndex].x - Math.floor(this.columnsLength/2)) * this.fieldLength,
        parsedZ = (pawns[pawnIndex].z - Math.floor(this.columnsLength/2)) * this.fieldLength;

      let pawn = new Pawn({
        ...pawns[pawnIndex],
        id: pawnId,
        parsedX: parsedX,
        parsedZ: parsedZ,
        x: pawns[pawnIndex].x,
        z: pawns[pawnIndex].z,
        context: this.context,
      });
      this.pawns[pawnId] = pawn;

      let delay = Math.floor((+pawnIndex / 4))*200+(+pawnIndex % 4)*100;

      pawn.pawnMesh.material.opacity = 0;
      this.$.add(pawn.$);
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
  createSelectionObjects() {
    for (const pawnIndex in this.pawns) {
      const pawn = this.pawns[pawnIndex];
      pawn.createSelectionObject();
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
  setAnimationLength(animationLength) {
    this.animationLength = animationLength;
  }
  movePawn(pawnId, fieldSequence) {
    if (!this.animationLength) {
      return;
    }

    let pawn = this.pawns[pawnId],
      animationsSteps = [];

    if (!pawn) {
      console.error('No pawn with id: ' + pawnId);
      return;
    }

    let pawnOnLastField;
    for(let i = 0; i < fieldSequence.length; i++) {
      let {x, z,} = fieldSequence[i],
        newX = (x - Math.floor(this.columnsLength/2)) * this.fieldLength,
        newZ = (z - Math.floor(this.columnsLength/2)) * this.fieldLength,
        pawnOnNextField = (!!this.getPawnByXZ(x, z)) &&
          i !== (fieldSequence.length -1);

      animationsSteps.push({
        length: this.animationLength,
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

      if (pawnIds.indexOf(pawnId) > -1) {
        pawn.select();
      } else {
        pawn.unselect();
      }
    }
  }
  rotate(newRotation) {
    this.$.rotation.y = newRotation;

    for(let pawnIndex in this.pawns) {
      let pawn = this.pawns[pawnIndex];

      if (pawn && pawn.selectionObject) {
        if (newRotation % (Math.PI / 2)) {
          pawn.selectionObject.rotation.y = newRotation - Math.PI / 4;
        } else {
          pawn.selectionObject.rotation.y = newRotation + Math.PI / 4;
        }
      }
    }
  }
}