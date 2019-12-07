import './styles/styles.sass'
import Engine from 'engine.js'
import Games from 'Games.js';

document.getElementById('webapp').innerHTML = '';

const nextId = (()=>{
    let id = 0;
    return () => {
      return (id++)+'';
    };
  })(),
  randomColor = (format) => {
    var rint = Math.round(0xffffff * Math.random());
    switch(format)
    {
    case 'hex':
      return ('#0' + rint.toString(16)).replace(/^#0([0-9a-f]{6})$/i, '#$1');
    case 'rgb':
      return 'rgb(' + (rint >> 16) + ',' + (rint >> 8 & 255) + ',' + (rint & 255) + ')';
    default:
      return rint;
    }
  },
  randomPlayer = () => {
    let id = nextId() + 'playerId';

    return {
      id,
      color: randomColor('rgb'),
      avatar: '/static/avatar6.jpg',
      login: 'Name ' + id,
      index: null,
    }
  };

const engine = new Engine({
  container: document.getElementById('webapp'),
  gameName: 'Ludo',
});
engine.on('click', (e) => {
  if (!e.pawnIds.length) {
    engine.rollDice(
      parseInt(Math.random() * 6) + 1,
      [randomColor('rgb'), randomColor('rgb'),],
    );
  }
});
let gameName = 'Ludo';

let newPawns = [
  {id: '12', x: 0, z: 0,}, // first player
  {id: '13', x: 1, z: 0,}, // first player
  {id: '14', x: 0, z: 1,}, // first player
  {id: '15', x: 1, z: 1,}, // first player
  {id: '4', x: 9, z: 0,}, // second player
  {id: '5', x: 10, z: 0,}, // second player
  {id: '6', x: 9, z: 1,}, // second player
  {id: '7', x: 10, z: 1,}, // second player
  {id: '0', x: 9, z: 10,}, // third player
  {id: '1', x: 10, z: 10,}, // third player
  {id: '2', x: 9, z: 9,}, // third player
  {id: '3', x: 10, z: 9,}, // third player
  {id: '8', x: 0, z: 9,}, // fourth player
  {id: '9', x: 1, z: 9,}, // fourth player
  {id: '10', x: 0, z: 10,}, // fourth player
  {id: '11', x: 1, z: 10,}, // fourth player
];
let newPlayers = [];

for(let i = 0; i < 4; i++) {
  let newPlayer = randomPlayer();
  newPlayer.index = newPlayers.length;
  newPlayers.push(newPlayer);
}

for(let pawnI in newPawns) {
  let pawn = newPawns[pawnI],
    player = newPlayers[Math.floor(pawnI / 4)];

  pawn.color = player.color;
  pawn.playerId = player.id;
  pawn.playerIndex = player.index;
}

let firstPlayer = newPlayers[0];
let firstPlayerId = (firstPlayer && firstPlayer.id) || 0;

const movePawn = () => {
  let which = parseInt(Math.random() * newPawns.length);
  let pawnId = newPawns[which].id;
  let x = parseInt(Math.random() * 10);
  let z = parseInt(Math.random() * 10);

  // engine.movePawn({
  //   pawnId,
  //   fieldSequence: [{x, z, animationLength: 500,},],
  // });
};

const selectPawn = () => {
  let whichPawn = parseInt(Math.random() * newPawns.length);

  engine.selectPawns([newPawns[whichPawn].id,]);
};

setTimeout(() => {
  engine.initGame(
    {
      gameId: 'gameId',
      gameName: 'Ludo',
      pawns: newPawns,
      players: newPlayers,
    },
    firstPlayerId,
    Games[gameName].AnimationLengths.startGameBase,
  );

  setInterval(() => {
    movePawn();
    selectPawn();
  }, 3000);
}, 100);