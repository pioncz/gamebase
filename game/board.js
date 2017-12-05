import Utils from 'utils/utils.js'
import Pawn from './pawn'
import {EASING, TIMES} from "./utils/animations";
import PawnsController from 'pawnsController';

export default class Board {
  constructor(props) {
    this.scene = props.scene;
    this.animations = props.animations;
    this.width = props.width;
    this.height = props.height;
    this.renderer = props.renderer;
    this.getPawn = props.getPawn;
    this.columnsLength = 11;
    this.fieldLength = 40 / this.columnsLength;
    
    this.fields = [
      {x: 0, z:4, player: '3', type: 'start'},
      {x: 1, z:4},
      {x: 2, z:4},
      {x: 3, z:4},
      {x: 4, z:4},
      {x: 4, z:3},
      {x: 4, z:2},
      {x: 4, z:1},
      {x: 4, z:0},
      {x: 5, z:0},
      {x: 5, z:1, player: '0', type: 'goal'},
      {x: 5, z:2, player: '0', type: 'goal'},
      {x: 5, z:3, player: '0', type: 'goal'},
      {x: 5, z:4, player: '0', type: 'goal'},
      {x: 9, z:0, player: '0', type: 'spawn'},
      {x: 10, z:0, player: '0', type: 'spawn'},
      {x: 9, z:1, player: '0', type: 'spawn'},
      {x: 10, z:1, player: '0', type: 'spawn'},
      {x: 6, z:0, player: '0', type: 'start'},
      {x: 6, z:1},
      {x: 6, z:2},
      {x: 6, z:3},
      {x: 6, z:4},
      {x: 7, z:4},
      {x: 8, z:4},
      {x: 9, z:4},
      {x: 10, z:4},
      {x: 10, z:5},
      {x: 9, z:5, player: '1', type: 'goal'},
      {x: 8, z:5, player: '1', type: 'goal'},
      {x: 7, z:5, player: '1', type: 'goal'},
      {x: 6, z:5, player: '1', type: 'goal'},
      {x: 9, z:9, player: '1', type: 'spawn'},
      {x: 10, z:9, player: '1', type: 'spawn'},
      {x: 9, z:10, player: '1', type: 'spawn'},
      {x: 10, z:10, player: '1', type: 'spawn'},
      {x: 10, z:6, player: '1', type: 'start'},
      {x: 9, z:6},
      {x: 8, z:6},
      {x: 7, z:6},
      {x: 6, z:6},
      {x: 6, z:7},
      {x: 6, z:8},
      {x: 6, z:9},
      {x: 6, z:10},
      {x: 5, z:10},
      {x: 5, z:9, player: '2', type: 'goal'},
      {x: 5, z:8, player: '2', type: 'goal'},
      {x: 5, z:7, player: '2', type: 'goal'},
      {x: 5, z:6, player: '2', type: 'goal'},
      {x: 0, z:9, player: '2', type: 'spawn'},
      {x: 1, z:9, player: '2', type: 'spawn'},
      {x: 0, z:10, player: '2', type: 'spawn'},
      {x: 1, z:10, player: '2', type: 'spawn'},
      {x: 4, z:10, player: '2', type: 'start'},
      {x: 4, z:9},
      {x: 4, z:8},
      {x: 4, z:7},
      {x: 4, z:6},
      {x: 3, z:6},
      {x: 2, z:6},
      {x: 1, z:6},
      {x: 0, z:6},
      {x: 0, z:5},
      {x: 1, z:5, player: '3', type: 'goal'},
      {x: 2, z:5, player: '3', type: 'goal'},
      {x: 3, z:5, player: '3', type: 'goal'},
      {x: 4, z:5, player: '3', type: 'goal'},
      {x: 0, z:0, player: '3', type: 'spawn'},
      {x: 1, z:0, player: '3', type: 'spawn'},
      {x: 0, z:1, player: '3', type: 'spawn'},
      {x: 1, z:1, player: '3', type: 'spawn'},
    ];
    this.createBoard();
    
    this.pawnsController = new PawnsController({
      scene: this.scene,
      fieldLength: this.fieldLength,
      pawns: props.pawns,
      animations: props.animations,
      columnsLength: this.columnsLength,
    });
  }
  createBoard() {
    let canvas = Utils.$({element: 'canvas'}),
      ctx = canvas.getContext('2d');
    let width = this.width,
      height = this.height;
    
    canvas.width = width;
    canvas.height = height;
    
    var gridAmount = 11;
    
    var players = [
      {color: '#64DD17'},
      {color: '#D50000'},
      {color: '#1DE9B6'},
      {color: '#FFEA00'},
    ];
    
    ctx.clearRect(0, 0, width, height);
    
    // background
    var grd = ctx.createLinearGradient(0, 0, width, height);
    grd.addColorStop(.1, "#0fb8ad");
    grd.addColorStop(.4, "#1fc8db");
    grd.addColorStop(.7, "#2cb5e8");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, width);
    
    //fields
    function drawField(field) {
      let x = field.x,
        z = field.z,
        color = 'white',
        lineWidth = 1,
        strokeStyle = '#CFD8DC';
      
      if (field.player) {
        color = players[field.player].color;
        lineWidth = 4;
        strokeStyle = 'rgba(255,255,255,0.3)';
      }
      
      ctx.beginPath();
      var cellSize = width / gridAmount;
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
  
      ctx.strokeStyle = null;
      ctx.fillStyle = '#000';
      ctx.font = "12px Arial";
      ctx.fillText("x: " + x + ", z: " + z,cellX - r2,cellZ);
    }
    
    for (let i = 0; i < this.fields.length; i++) {
      drawField(this.fields[i]);
    }
    
    let texture = new THREE.Texture(canvas);
    this.materials = [
      new THREE.MeshBasicMaterial({map: texture}),
      new THREE.MeshBasicMaterial({color: 'rgba(61, 72, 97, 0.8)'})
    ];
    this.geometry = new THREE.BoxGeometry(40, 2, 40);
    
    texture.needsUpdate = true;
    this.$ = new THREE.Mesh(this.geometry, new THREE.MeshFaceMaterial(this.materials));
    
    this.geometry.faces[0].materialIndex = 1;
    this.geometry.faces[1].materialIndex = 1;
    this.geometry.faces[4].materialIndex = 0;
    this.geometry.faces[5].materialIndex = 0;
    this.geometry.faces[8].materialIndex = 1;
    this.geometry.faces[9].materialIndex = 1;
    
    var cube = new THREE.Mesh(this.geometry, new THREE.MeshFaceMaterial(this.materials));
    this.scene.add(cube);
  }
  getFieldsSequence(pawnData, length) {
    let currentField,
      currentFieldI = 0,
      fieldSequence = [];
    

    for(let i = 0; i < this.fields.length; i++) {
      let field = this.fields[i];
      
      if (field.x === pawnData.x && field.z === pawnData.z) {
        currentField = field;
        currentFieldI = i;
        break;
      }
    }
    
    if (currentField) {
      for(let i = currentFieldI; i < this.fields.length && fieldSequence.length < length; i++) {
        let field = this.fields[i];
        
        if (!field.type) {
          fieldSequence.push(field);
        }
      }
    }
    
    
    return fieldSequence;
  }
  movePawn(pawnId, length) {
    let pawn = this.pawnsController.getPawn(pawnId);
    let pawnData = this.getPawn(pawnId);
    
    if (pawn && pawnData) {
      let fieldsSequence = this.getFieldsSequence(pawnData, length);
  
      if (fieldsSequence.length) {
        Utils.asyncLoop(fieldsSequence.length, (loop, i) => {
          this.pawnsController.movePawn(
            pawnId,
            fieldsSequence[i].x,
            fieldsSequence[i].z
          ).then(
            loop.next
          );
        }, () => {
          pawnData.x = fieldsSequence[fieldsSequence.length-1].x;
          pawnData.z = fieldsSequence[fieldsSequence.length-1].z;
        });
      }
    }
  }
}