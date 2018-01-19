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
    
    for (let pawnId in props.pawns) {
      let parsedX = (props.pawns[pawnId].x - Math.floor(props.columnsLength/2)) * this.fieldLength,
        parsedZ = (props.pawns[pawnId].z - Math.floor(props.columnsLength/2)) * this.fieldLength;
      
      let pawn = new Pawn({
        ...props.pawns[pawnId],
        scene: this.scene,
        parsedX: parsedX,
        parsedZ: parsedZ,
        x: props.pawns[pawnId].x,
        z: props.pawns[pawnId].z,
      });
      this.pawns[pawnId] = pawn;
    }
  }
  movePawn(pawnId, x, z) {
    let pawn = this.pawns[pawnId];
    
    let returnPromise = new Promise((resolve, reject) => {
      if (pawn) {
        let oldX = pawn.parsedX,
          newX = (x - Math.floor(this.columnsLength/2)) * this.fieldLength,
          dX = oldX - newX,
          oldZ = pawn.parsedZ,
          newZ = (z - Math.floor(this.columnsLength/2)) * this.fieldLength,
          dZ = oldZ - newZ;
    
        this.animations.create({
          length: Config.ludo.animations.movePawn,
          easing: EASING.InOutQuad,
          update: (progress) => {
            let newX = oldX - (dX * progress),
              newY = 2.8 * (1 + EASING.Sin(progress / 2)),
              newZ = oldZ - (dZ * progress);
        
            pawn.moveTo(newX, newY, newZ);
          },
        }).then(resolve);
      } else {
        console.error('No pawn with id: ' + pawnId);
        reject();
      }
    });
    
    return returnPromise;
  }
  getPawn(pawnId) {
    return this.pawns[pawnId];
  }
}