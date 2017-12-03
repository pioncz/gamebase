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
        x: parsedX,
        z: parsedZ,
      });
      this.pawns[pawnId] = pawn;
    }
  }
  movePawn(pawnId, x, z) {
    let pawn = this.pawns[pawnId];
    
    if (pawn) {
      let oldX = pawn.x,
        dX = Math.abs(oldX - (x * this.fieldLength)),
        oldZ = pawn.z,
        dZ = Math.abs(oldZ - (z * this.fieldLength));
      
      this.animations.create({
        length: 1000,
        times: TIMES.Infinity,
        easing: EASING.InOutQuad,
        update: (progress) => {
          let newX = oldX + (dX * progress),
            newY = 2.8 * (1 + EASING.Sin(progress / 2)),
            newZ = oldZ + (dZ * progress);

          pawn.moveTo(newX, newY, newZ);
        },
      });
    } else {
      console.error('No pawn with id: ' + pawnId);
    }
  }
}