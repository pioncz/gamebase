import Pawn from './pawn';
import { EASING } from './utils/animations';

export default class PawnsController {
  constructor(props) {
    this.scene = props.scene;
    this.camera = props.camera;
    this.pawns = {};
    this.fieldLength = props.fieldLength;
    this.animations = props.context.animations;
    this.context = props.context;
    this.gridSize = props.gridSize;
    this.renderOrder = props.renderOrder;
    this.pawnSelectionRenderOrder = props.renderOrder;
    this.orientation = { portrait: false, rotationY: 0 };

    this.$ = new THREE.Group();
    this.$.name = 'PawnsController';
  }
  createPawns({ pawns, firstPlayerId }) {
    // If all pawns spawn in the same field, move them
    const sameField = pawns.length > 1 && pawns[0].x === pawns[1].x;

    for (let pawnIndex in pawns) {
      let x = pawns[pawnIndex].x;
      let z = pawns[pawnIndex].z;

      if (sameField) {
        x += (pawnIndex < 2 ? -1 : 1) * 0.25;
        z += (pawnIndex % 2 ? -1 : 1) * 0.25;
      }

      let pawnId = pawns[pawnIndex].id,
        parsedX =
          (x - Math.floor(this.gridSize / 2)) *
          (this.fieldLength / this.gridSize),
        parsedZ =
          (z - Math.floor(this.gridSize / 2)) *
          (this.fieldLength / this.gridSize),
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

      pawn.pawnMesh.renderOrder =
        playerId === firstPlayerId ? 50 : 10;

      pawn.pawnMesh.material.opacity = 0;
      pawn.selectionObject.renderOrder =
        this.pawnSelectionRenderOrder;
      this.$.add(pawn.$);
    }
  }
  initPawns() {
    for (let pawnId in this.pawns) {
      let pawn = this.pawns[pawnId];

      if (!pawn) return;

      let delay = Math.floor(+pawnId / 4) * 200 + (+pawnId % 4) * 100;

      this.animations.create({
        id: 'enterPawn' + pawnId,
        length: 300,
        delay: delay,
        easing: EASING.InOutQuad,
        update: (progress) => {
          let newY = 20 * (1 - progress) + 2,
            newOpacity = progress * 5;

          pawn.pawnMesh.material.opacity = newOpacity;
          pawn.moveTo(pawn.parsedX, newY, pawn.parsedZ);
        },
      });
    }
  }
  removePawns() {
    for (let pawnId in this.pawns) {
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

    // If last field is save and there are more pawns in the same field => move them
    const lastField = fieldSequence[fieldSequence.length - 1];

    let pawnOnLastField;
    for (let i = 0; i < fieldSequence.length; i++) {
      let { x, z, animationLength } = fieldSequence[i],
        newX =
          (x - Math.floor(this.gridSize / 2)) *
          (this.fieldLength / this.gridSize),
        newZ =
          (z - Math.floor(this.gridSize / 2)) *
          (this.fieldLength / this.gridSize),
        pawnOnNextField =
          !!this.getPawnByXZ(x, z) && i !== fieldSequence.length - 1;

      animationsSteps.push({
        length: animationLength,
        easing: EASING.InOutQuad,
        update: (
          (newX, newZ, pawnOnLastField, pawnOnNextField) =>
          (progress) => {
            let oldX = pawn.parsedX,
              oldZ = pawn.parsedZ,
              dX = oldX - newX,
              dZ = oldZ - newZ,
              newParsedX = oldX - dX * progress,
              newParsedY,
              newParsedZ = oldZ - dZ * progress;

            if (
              (progress <= 0.5 && pawnOnLastField) ||
              (progress > 0.5 && pawnOnNextField)
            ) {
              newParsedY = 4 + EASING.Sin(progress / 2);
            } else {
              newParsedY = 2 + 3 * EASING.Sin(progress / 2);
            }

            pawn.moveTo(newParsedX, newParsedY, newParsedZ);
          }
        )(newX, newZ, pawnOnLastField, pawnOnNextField),
        finish: () => {
          pawn.parsedX = newX;
          pawn.parsedZ = newZ;
        },
      });

      pawnOnLastField = pawnOnNextField;
    }

    return this.animations.createSequence({
      name: 'movePawn' + pawnId,
      steps: animationsSteps,
    });
  }
  getPawn(pawnId) {
    return this.pawns[pawnId];
  }
  getPawnByXZ(x, z) {
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
    for (let pawnId in this.pawns) {
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
    this.orientation = { portrait, rotationY };
    this.$.rotation.y = rotationY;

    for (let pawnIndex in this.pawns) {
      this.pawns[pawnIndex].rotate(this.orientation);
    }
  }
}
