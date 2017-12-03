import Pawn from "./pawn";
import {EASING, TIMES} from "./utils/animations";

export default class PawnsController {
  constructor(props) {
    this.scene = props.scene;
    this.pawns = {};
    this.fieldLength = props.fieldLength;
    this.animations = props.animations;
    
    for (let pawnId in props.pawns) {
      let parsedX = props.pawns[pawnId].x * this.fieldLength,
        parsedZ = props.pawns[pawnId].z * this.fieldLength;
      
      let pawn = new Pawn({
        ...props.pawns[pawnId],
        scene: this.scene,
        x: props.pawns[pawnId].x,
        z: props.pawns[pawnId].z,
        parsedX: parsedX,
        parsedZ: parsedZ,
      });
      this.pawns[pawnId] = pawn;
    }
  }
  movePawn(pawnId, x, z) {
    let pawn = this.pawns[pawnId];
    
    let returnPromise = new Promise((resolve, reject) => {
      if (pawn) {
        let oldX = pawn.parsedX,
          dX = Math.abs(oldX - (x * this.fieldLength)),
          oldZ = pawn.parsedZ,
          dZ = Math.abs(oldZ - (z * this.fieldLength));
    
        this.animations.create({
          length: 1000,
          easing: EASING.InOutQuad,
          update: (progress) => {
            let newX = oldX + (dX * progress),
              newY = 2.8 * (1 + EASING.Sin(progress / 2)),
              newZ = oldZ + (dZ * progress);
        
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
}