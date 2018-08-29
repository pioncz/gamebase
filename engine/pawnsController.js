import Pawn from "./pawn";
import {EASING, TIMES} from "./utils/animations";
import Config from 'config.js';

export default class PawnsController {
  constructor(props) {
    this.scene = props.scene;
    this.pawns = {};
    this.fieldLength = props.fieldLength;
    this.animations = props.context.animations;
    this.context = props.context;
    this.columnsLength = props.columnsLength;
    
    this.$ = new THREE.Object3D();
    this.$.name = 'PawnsController';
    this.scene.add(this.$);
  }
  createPawns({pawns}) {
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
          let newY = (20*(1-progress)) + 2.8,
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
      console.log(pawnId);
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
    
    for(let i = 0; i < fieldSequence.length; i++) {
      let field = fieldSequence[i],
        x = field.x,
        z = field.z,
        newX = (x - Math.floor(this.columnsLength/2)) * this.fieldLength,
        newZ = (z - Math.floor(this.columnsLength/2)) * this.fieldLength;
      
      animationsSteps.push({
        length: Config.ludo.animations.movePawn,
        easing: EASING.InOutQuad,
        update: ((newX, newZ) =>
          (progress) => {
            let oldX = pawn.parsedX,
              oldZ = pawn.parsedZ,
              dX = oldX - newX,
              dZ = oldZ - newZ,
              newParsedX = oldX - (dX * progress),
              newParsedY = 2.8 * (1 + EASING.Sin(progress / 2)),
              newParsedZ = oldZ - (dZ * progress);
  
            pawn.moveTo(newParsedX, newParsedY, newParsedZ);
        })(newX, newZ),
        finish: () => {
          pawn.parsedX = newX;
          pawn.parsedZ = newZ;
        },
      });
    }
    
    return this.animations.createSequence({name: 'movePawn'+pawnId, steps: animationsSteps});
  }
  getPawn(pawnId) {
    return this.pawns[pawnId];
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
}