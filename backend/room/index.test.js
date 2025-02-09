const { Room, } = require('./');
const Games = require('./../../games/Games.js');
const Game = require('./../../games/game');
const Ludo = Games.Ludo;

const colors = ['blue', 'red','yellow', 'green',];

const createRoom = (numberOfPlayers = 2) => {
  let room = new Room({
    id: 0,
    gameName: 'Ludo',
  });
  const players = [];

  for(let i = 0; i < numberOfPlayers; i++) {
    players.push({id: i, name: 'Player ' + i,});
  }

  room.gameState.pawns = Ludo.InitialState().pawns;
  room.gameState.playerColors = [];

  players.forEach((player, index) => {
    const color = colors[index];
    room.addPlayer(player);
    room.gameState.playerColors.push({playerId: player.id, color,});

    for(let j = 0; j < 4; j++) {
      room.gameState.pawns[(index * 4 + j)].playerId = player.id;
      room.gameState.pawns[(index * 4 + j)].color = color;
    }
  });

  return room;
}

describe('Disconnect handler', () => {
  test('Player disconnects when it was his turn. Game goes on', () => {
    const room = createRoom(3);
    const gameState = room.gameState;
    const player = gameState.players[0];
    gameState.selectedPawns = gameState.pawns.filter(pawn => pawn.playerId === player.id);
    gameState.currentPlayerId = player.id;

    const actions = room.playerDisconnected(player.id);

    expect(gameState.currentPlayerId).toBe(gameState.players[1].id);
    expect(gameState.selectedPawns.length).toBe(0);

    expect(actions.length).toBe(2);
    expect(actions[0].action.type).toBe(Ludo.ActionTypes.WaitForPlayer);
    expect(actions[0].action.playerId).toBe(gameState.players[1].id);
    expect(actions[0].action.expectedAction).toBe(Ludo.ActionTypes.Roll);
    expect(actions[1].action.type).toBe(Game.ActionTypes.Disconnected);
    expect(actions[1].action.playerId).toBe(gameState.players[0].id);
  });

  test('Player disconnects when it was his turn. Game finishes', () => {
    const room = createRoom(2);
    const gameState = room.gameState;
    const player = gameState.players[0];
    gameState.selectedPawns = gameState.pawns.filter(pawn => pawn.playerId === player.id);
    gameState.currentPlayerId = player.id;

    const actions = room.playerDisconnected(player.id);

    expect(actions.length).toBe(2);
    expect(actions[0].action.type).toBe(Ludo.ActionTypes.FinishGame);
    expect(actions[0].action.winnerId).toBe(gameState.players[1].id);
    expect(actions[1].action.type).toBe(Game.ActionTypes.Disconnected);
    expect(actions[1].action.playerId).toBe(gameState.players[0].id);
  })
});
