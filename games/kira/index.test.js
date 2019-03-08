const Ludo = require('./index.js');

let currentTime = 1;
Date.now = () => { return currentTime; };

const createInitialRoomState = () => {
  const playerIds = ['1', '2'],
    playerColors = [{playerId: '1', color: 'red'}, {playerId: '2', color: 'blue'}];
  let pawns = Ludo.InitialState().pawns;

  playerIds.forEach((playerId, i) => {
    let playerColor = playerColors.find(playerColor => playerColor.playerId === playerId);

    for(let j = 0; j < 4; j++) {
      pawns[(i * 4 + j)].playerId = playerColor.playerId;
      pawns[(i * 4 + j)].color = playerColor.color;
    }
  });

  return {
    roomId: '0',
    currentPlayerId: '1',
    rolled: false,
    playerIds,
    playerColors,
    pawns,
    roundTimestamp: null,
  };
};

const isFunction = (functionToCheck) => !!(functionToCheck && {}.toString.call(functionToCheck) === '[object Function]');

let action = Ludo.Actions.Roll(),
  player = {id: '1', name: '1'},
  anotherPlayer = {id: '2', name: '2'};

describe('User make full move', () => {
  test('d', () => {
    expect(1).toBe(1);
  });
});