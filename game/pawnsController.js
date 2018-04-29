import Pawn from "./pawn";
import {EASING, TIMES} from "./utils/animations";
import Config from 'config.js';

export default class PawnsController {
  constructor(props) {
    this.scene = props.scene;
    this.pawns = {};
    this.fieldLength = props.fieldLength;
    this.animations = props.animations;
    this.columnsLength = props.columnsLength;
  }
  createPawns({pawns}) {
    for (let pawnIndex in pawns) {
      let pawnId = pawns[pawnIndex].id,
        parsedX = (pawns[pawnIndex].x - Math.floor(this.columnsLength/2)) * this.fieldLength,
        parsedZ = (pawns[pawnIndex].z - Math.floor(this.columnsLength/2)) * this.fieldLength;
      
      let pawn = new Pawn({
        ...pawns[pawnIndex],
        scene: this.scene,
        parsedX: parsedX,
        parsedZ: parsedZ,
        x: pawns[pawnIndex].x,
        z: pawns[pawnIndex].z,
      });
      this.pawns[pawnId] = pawn;
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
      debugger;
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
            debugger;
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
    
    return this.animations.createSequence({name: 'movePawn', steps: animationsSteps});
  }
  getPawn(pawnId) {
    return this.pawns[pawnId];
  }
}