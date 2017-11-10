import Utils from 'utils/utils.js'

export default class Board {
  constructor({ scene }) {
    this.scene = scene;
    this.geometry = new THREE.BoxGeometry(512, 512, 5);


    let canvas = Utils.$({element: 'canvas'}),
      ctx = canvas.getContext('2d');
    let x = 20,
      y = 40,
      r = 10,
      width = 512,
      height = 512,
      entity = {
        width: width / 15,
        height: height / 15
      };

    canvas.width = width;
    canvas.height = height;

    var gridAmount = 11;

    var players = [
      {color: '#D50000'},
      {color: '#64DD17'},
      {color: '#1DE9B6'},
      {color: '#FFEA00'},

    ]

    var fields = [
      {x: 0, y: 4, player: '3', type:'start'},
      {x: 1, y: 4},
      {x: 2, y: 4},
      {x: 3, y: 4},
      {x: 4, y: 4},
      {x: 4, y: 3},
      {x: 4, y: 2},
      {x: 4, y: 1},
      {x: 4, y: 0},
      {x: 5, y: 0},
      {x: 5, y: 1, player: '0', type: 'goal'},
      {x: 5, y: 2, player: '0', type: 'goal'},
      {x: 5, y: 3, player: '0', type: 'goal'},
      {x: 5, y: 4, player: '0', type: 'goal'},
      {x: 9, y: 0, player: '0', type: 'spawn'},
      {x: 10, y: 0, player: '0', type: 'spawn'},
      {x: 9, y: 1, player: '0', type: 'spawn'},
      {x: 10, y: 1, player: '0', type: 'spawn'},
      {x: 6, y: 0, player: '0', type:'start'},
      {x: 6, y: 1},
      {x: 6, y: 2},
      {x: 6, y: 3},
      {x: 6, y: 4},
      {x: 7, y: 4},
      {x: 8, y: 4},
      {x: 9, y: 4},
      {x: 10, y: 4},
      {x: 10, y: 5},
      {x: 9, y: 5, player: '1', type: 'goal'},
      {x: 8, y: 5, player: '1', type: 'goal'},
      {x: 7, y: 5, player: '1', type: 'goal'},
      {x: 6, y: 5, player: '1', type: 'goal'},
      {x: 9, y: 9, player: '1', type: 'spawn'},
      {x: 10, y: 9, player: '1', type: 'spawn'},
      {x: 9, y: 10, player: '1', type: 'spawn'},
      {x: 10, y: 10, player: '1', type: 'spawn'},
      {x: 10, y: 6, player: '1', type:'start'},
      {x: 9, y: 6},
      {x: 8, y: 6},
      {x: 7, y: 6},
      {x: 6, y: 6},
      {x: 6, y: 7},
      {x: 6, y: 8},
      {x: 6, y: 9},
      {x: 6, y: 10},
      {x: 5, y: 10},
      {x: 5, y: 9, player: '2', type: 'goal'},
      {x: 5, y: 8, player: '2', type: 'goal'},
      {x: 5, y: 7, player: '2', type: 'goal'},
      {x: 5, y: 6, player: '2', type: 'goal'},
      {x: 0, y: 9, player: '2', type: 'spawn'},
      {x: 1, y: 9, player: '2', type: 'spawn'},
      {x: 0, y: 10, player: '2', type: 'spawn'},
      {x: 1, y: 10, player: '2', type: 'spawn'},
      {x: 4, y: 10, player: '2', type:'start'},
      {x: 4, y: 9},
      {x: 4, y: 8},
      {x: 4, y: 7},
      {x: 4, y: 6},
      {x: 3, y: 6},
      {x: 2, y: 6},
      {x: 1, y: 6},
      {x: 0, y: 6},
      {x: 0, y: 5},
      {x: 1, y: 5, player: '3', type: 'goal'},
      {x: 2, y: 5, player: '3', type: 'goal'},
      {x: 3, y: 5, player: '3', type: 'goal'},
      {x: 4, y: 5, player: '3', type: 'goal'},
      {x: 0, y: 0, player: '3', type: 'spawn'},
      {x: 1, y: 0, player: '3', type: 'spawn'},
      {x: 0, y: 1, player: '3', type: 'spawn'},
      {x: 1, y: 1, player: '3', type: 'spawn'},
    ];

    ctx.clearRect(0,0,width,height);

// background
    var grd=ctx.createLinearGradient(0,0,width,height);
    grd.addColorStop(.1,"#0fb8ad");
    grd.addColorStop(.4,"#1fc8db");
    grd.addColorStop(.7,"#2cb5e8");
    ctx.fillStyle=grd;
    ctx.fillRect(0,0,width,width);

//fields
    function drawField(field) {
      let x = field.x,
        y = field.y,
        color = 'white',
        lineWidth = 1,
        strokeStyle = '#CFD8DC';

      if (field.player) {
        color = players[field.player].color;
        lineWidth = 4;
        strokeStyle = 'rgba(255,255,255,0.3)';
      }

      ctx.beginPath();
      var cellSize = width/gridAmount;
      var r = cellSize/2*0.75;
      var r2 = cellSize/2*0.60;
      let cellX = (x + 0.5) * cellSize,
        cellY = (y + 0.5) * cellSize;

      ctx.arc(cellX, cellY, r, 0,2*Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.save();
      ctx.clip();

      ctx.arc(cellX, cellY, r2, 0,2*Math.PI);
      ctx.lineWidth=lineWidth;
      ctx.strokeStyle = strokeStyle;
      ctx.stroke();
      ctx.restore();
    }

    for(let i = 0; i < fields.length; i++) {
      drawField(fields[i]);
    }


    let texture = new THREE.Texture(canvas);
    this.material = new THREE.MeshBasicMaterial({
      map: texture,

      //side: THREE.DoubleSide,
    });
    texture.needsUpdate = true;
    this.$ = new THREE.Mesh(this.geometry, [this.material]);
    this.$.rotateZ(0.03);
    this.scene.add( this.$ );
  }
  update() {

  }
  render() {

  }
}