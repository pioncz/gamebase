import Pawn from "./pawn";

export default class PawnsController {
  constructor(props) {
    this.scene = props.scene;
    this.pawns = {};
    this.fieldLength = props.fieldLength;
    
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
}