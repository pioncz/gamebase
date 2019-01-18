const Ludo = require('./index.js');

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
  };
};

let action = Ludo.Actions.Roll(),
  player = {id: '1', name: '1'},
  anotherPlayer = {id: '2', name: '2'};

describe('PickPawnHandler - user picks pawn to move', () => {
  test('Wrong player tries to roll', () => {
    let errorMessage,
      initialRoomState = createInitialRoomState();

    try {
      Ludo.ActionHandlers.Roll(action, anotherPlayer, initialRoomState)
    } catch(e) {
      errorMessage = e.message;
    }

    expect(errorMessage).toBe('its not this player turn');
  });
  test('Player already rolled in this turn', () => {
    let errorMessage,
      roomState = createInitialRoomState();

    roomState.rolled = true;
    try {
      Ludo.ActionHandlers.Roll(action, player, roomState)
    } catch(e) {
      errorMessage = e.message;
    }
    expect(errorMessage).toBe('This player already rolled in this room. Pick pawn!');
  });
  test('Player rolls 5 with pawns on spawn', () => {
    let returnActions,
      roomState = createInitialRoomState();

    returnActions = Ludo.ActionHandlers.Roll(action, player, roomState, 5);
    const rollAction = returnActions[0].action;
    const waitAction = returnActions[1].action;

    expect(returnActions.length).toBe(2);
    expect(rollAction.type).toBe('Roll');
    expect(rollAction.diceNumber).toBe(5);
    expect(waitAction.type).toBe('WaitForPlayer');
    expect(waitAction.playerId).toBe('2');
  });
  test('Player rolls 6 with pawns on spawn', () => {
    let returnActions,
      roomState = createInitialRoomState();

    returnActions = Ludo.ActionHandlers.Roll(action, player, roomState, 6);
    const rollAction = returnActions[0].action;
    const waitAction = returnActions[1].action;

    expect(returnActions.length).toBe(2);
    expect(rollAction.type).toBe('Roll');
    expect(rollAction.diceNumber).toBe(6);
    expect(waitAction.type).toBe('SelectPawns');
    expect(waitAction.pawnIds).toEqual(["12","13","14","15"]);
    expect(waitAction.playerId).toBe('1');
  });
  test('Player rolls 5 with 1 pawn on field', () => {
    let returnActions,
      roomState = createInitialRoomState();

    roomState.pawns[0].x = 0; // Move first pawn to first spawn field
    roomState.pawns[0].z = 4;

    returnActions = Ludo.ActionHandlers.Roll(action, player, roomState, 5);
    const rollAction = returnActions[0].action;
    const waitAction = returnActions[1].action;

    expect(returnActions.length).toBe(2);
    expect(rollAction.type).toBe('Roll');
    expect(rollAction.diceNumber).toBe(5);
    expect(waitAction.type).toBe('SelectPawns');
    expect(waitAction.pawnIds).toEqual(["12"]);
    expect(waitAction.playerId).toBe('1');
  });
  test('Player rolls 3, can move and beat a pawn', () => {
    let returnActions,
      roomState = createInitialRoomState();

    roomState.pawns[0].x = 0; // Move first pawn to first spawn field
    roomState.pawns[0].z = 4;
    roomState.pawns[5].x = 3; // Move seconds player pawn 5 fields
    roomState.pawns[5].z = 4;

    returnActions = Ludo.ActionHandlers.Roll(action, player, roomState, 3);
    const rollAction = returnActions[0].action;
    const waitAction = returnActions[1].action;

    expect(returnActions.length).toBe(2);
    expect(rollAction.type).toBe('Roll');
    expect(rollAction.diceNumber).toBe(3);
    expect(waitAction.type).toBe('SelectPawns');
    expect(waitAction.pawnIds).toEqual(["12"]);
    expect(waitAction.playerId).toBe('1');
  });
});