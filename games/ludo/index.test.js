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

describe('SelectColorHandler', () => {
  test('', () => {
  });


});

describe('User make full move', () => {
  test('Current player picks pawn', () => {
    let errorMessage,
      initialRoomState = createInitialRoomState(),
      pawnId = initialRoomState.pawns.find(pawn => pawn.playerId === initialRoomState.currentPlayerId);

    try {
      Ludo.ActionHandlers.PickPawn(Ludo.Actions.PickPawn(pawnId), player, initialRoomState)
    } catch(e) {
      errorMessage = e.message;
    }

    expect(errorMessage).toBe('Dice not rolled');
  });
  test('Wrong player rolls', () => {
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

    currentTime = 1;
    returnActions = Ludo.ActionHandlers.Roll(action, player, roomState, 5);
    expect(roomState.rolled).toBe(true);
    expect(roomState.currentPlayerId).toBe(roomState.playerIds[1]);
    expect(returnActions.length).toBe(3);
    const rollAction = returnActions[0];
    const waitAction = returnActions[1];
    const stopProgressAction = returnActions[2];
    expect(rollAction.action.type).toBe(Ludo.ActionTypes.Roll);
    expect(rollAction.action.diceNumber).toBe(5);
    expect(waitAction.action.type).toBe(Ludo.ActionTypes.WaitForPlayer);
    expect(waitAction.action.playerId).toBe(roomState.playerIds[1]);
    expect(waitAction.action.expectedAction).toBe(Ludo.ActionTypes.Roll);
    expect(waitAction.timestamp).toBe(currentTime + Ludo.AnimationLengths.rollDice);
    expect(isFunction(waitAction.callback)).toBe(true);
    expect(stopProgressAction.action.type).toBe(Ludo.ActionTypes.StopProgress);

    currentTime++;
    const callbackActions = waitAction.callback();
    expect(roomState.rolled).toBe(false);
    expect(roomState.currentPlayerId).toBe(roomState.playerIds[1]);
    expect(callbackActions.length).toBe(1);
    const resetProgressAction = callbackActions[0].action;
    expect(resetProgressAction.type).toBe(Ludo.ActionTypes.RestartProgress);
    expect(roomState.roundTimestamp).toBe(currentTime + Ludo.Config.RoundLength);
  });
  test('Player rolls 6 with pawns on spawn', () => {
    let returnActions,
      roomState = createInitialRoomState();

    currentTime = 1;
    returnActions = Ludo.ActionHandlers.Roll(action, player, roomState, 6);
    expect(roomState.rolled).toBe(true);
    expect(roomState.currentPlayerId).toBe(roomState.playerIds[0]);
    expect(returnActions.length).toBe(3);
    const rollAction = returnActions[0];
    const waitAction = returnActions[1];
    const stopProgressAction = returnActions[2];
    expect(rollAction.action.type).toBe(Ludo.ActionTypes.Roll);
    expect(rollAction.action.diceNumber).toBe(6);
    expect(waitAction.action.type).toBe(Ludo.ActionTypes.WaitForPlayer);
    expect(waitAction.timestamp).toBe(currentTime + Ludo.AnimationLengths.rollDice);
    expect(waitAction.action.expectedAction).toBe(Ludo.ActionTypes.PickPawn);
    expect(isFunction(waitAction.callback)).toBe(true);
    expect(stopProgressAction.action.type).toBe(Ludo.ActionTypes.StopProgress);

    currentTime++;
    const callbackActions = waitAction.callback();
    expect(roomState.rolled).toBe(true);
    expect(callbackActions.length).toBe(2);
    const selectPawnsAction = callbackActions[0].action;
    const resetProgressAction = callbackActions[1].action;
    expect(selectPawnsAction.type).toBe(Ludo.ActionTypes.SelectPawns);
    expect(selectPawnsAction.pawnIds).toEqual(["12","13","14","15"]);
    expect(selectPawnsAction.playerId).toBe('1');
    expect(resetProgressAction.type).toBe(Ludo.ActionTypes.RestartProgress);
    expect(roomState.roundTimestamp).toBe(currentTime + Ludo.Config.RoundLength);
  });
  test('Player rolls 5 with 1 pawn on field', () => {
    let returnActions,
      roomState = createInitialRoomState();

    roomState.pawns[0].x = 0; // Move first pawn to first spawn field
    roomState.pawns[0].z = 4;

    currentTime = 1;
    returnActions = Ludo.ActionHandlers.Roll(action, player, roomState, 5);
    expect(roomState.rolled).toBe(true);
    expect(roomState.currentPlayerId).toBe(roomState.playerIds[0]);
    expect(returnActions.length).toBe(3);
    const rollAction = returnActions[0];
    const waitAction = returnActions[1];
    const stopProgressAction = returnActions[2];
    expect(rollAction.action.type).toBe(Ludo.ActionTypes.Roll);
    expect(rollAction.action.diceNumber).toBe(5);
    expect(waitAction.action.type).toBe(Ludo.ActionTypes.WaitForPlayer);
    expect(waitAction.timestamp).toBe(currentTime + Ludo.AnimationLengths.rollDice);
    expect(waitAction.action.expectedAction).toBe(Ludo.ActionTypes.PickPawn);
    expect(isFunction(waitAction.callback)).toBe(true);
    expect(stopProgressAction.action.type).toBe(Ludo.ActionTypes.StopProgress);

    currentTime++;
    const callbackActions = waitAction.callback();
    expect(roomState.rolled).toBe(true);
    expect(callbackActions.length).toBe(2);
    const selectPawnsAction = callbackActions[0].action;
    const resetProgressAction = callbackActions[1].action;

    expect(selectPawnsAction.type).toBe(Ludo.ActionTypes.SelectPawns);
    expect(selectPawnsAction.pawnIds).toEqual(["12"]);
    expect(selectPawnsAction.playerId).toBe('1');
    expect(resetProgressAction.type).toBe(Ludo.ActionTypes.RestartProgress);
    expect(roomState.roundTimestamp).toBe(currentTime + Ludo.Config.RoundLength);
  });
  test('Player rolls 3, can move and beat a pawn', () => {
    let returnActions,
      roomState = createInitialRoomState();

    roomState.pawns[0].x = 0; // Move first pawn to first spawn field
    roomState.pawns[0].z = 4;
    roomState.pawns[5].x = 3; // Move seconds player pawn 5 fields
    roomState.pawns[5].z = 4;

    currentTime = 1;
    returnActions = Ludo.ActionHandlers.Roll(action, player, roomState, 3);
    expect(roomState.rolled).toBe(true);
    expect(roomState.currentPlayerId).toBe(roomState.playerIds[0]);
    expect(returnActions.length).toBe(3);
    const rollAction = returnActions[0];
    const waitAction = returnActions[1];
    const stopProgressAction = returnActions[2];
    expect(rollAction.action.type).toBe(Ludo.ActionTypes.Roll);
    expect(rollAction.action.diceNumber).toBe(3);
    expect(waitAction.action.type).toBe(Ludo.ActionTypes.WaitForPlayer);
    expect(waitAction.timestamp).toBe(currentTime + Ludo.AnimationLengths.rollDice);
    expect(waitAction.action.expectedAction).toBe(Ludo.ActionTypes.PickPawn);
    expect(isFunction(waitAction.callback)).toBe(true);
    expect(stopProgressAction.action.type).toBe(Ludo.ActionTypes.StopProgress);

    currentTime++;
    const callbackActions = waitAction.callback();
    expect(roomState.rolled).toBe(true);
    expect(callbackActions.length).toBe(2);
    const selectPawnsAction = callbackActions[0].action;
    const resetProgressAction = callbackActions[1].action;

    expect(selectPawnsAction.type).toBe(Ludo.ActionTypes.SelectPawns);
    expect(selectPawnsAction.pawnIds).toEqual(["12"]);
    expect(selectPawnsAction.playerId).toBe('1');
    expect(resetProgressAction.type).toBe(Ludo.ActionTypes.RestartProgress);
    expect(roomState.roundTimestamp).toBe(currentTime + Ludo.Config.RoundLength);
  });
});

describe('TimeoutHandler', () => {
  test('2 players, both on spawn', () => {
    const roomState = createInitialRoomState();
    const actions = Ludo.ActionHandlers.Timeout(roomState);
    expect(actions[0].action.type).toBe(Ludo.ActionTypes.FinishGame);
    expect(actions[0].action.winnerId).toBe(roomState.playerIds[0]);
  });
  test('2 players, second has 1 pawn further', () => {
    const roomState = createInitialRoomState();
    roomState.pawns[4].x = 4;
    roomState.pawns[4].z = 4;
    const actions = Ludo.ActionHandlers.Timeout(roomState);
    expect(actions[0].action.type).toBe(Ludo.ActionTypes.FinishGame);
    expect(actions[0].action.winnerId).toBe(roomState.playerIds[1]);
  });
  test('2 players, second has pawns in goals', () => {
    const roomState = createInitialRoomState();
    roomState.pawns[4].x = 5;
    roomState.pawns[4].z = 1;
    roomState.pawns[5].x = 5;
    roomState.pawns[5].z = 2;
    roomState.pawns[6].x = 5;
    roomState.pawns[6].z = 3;
    roomState.pawns[7].x = 5;
    roomState.pawns[7].z = 4;
    const actions = Ludo.ActionHandlers.Timeout(roomState);
    expect(actions[0].action.type).toBe(Ludo.ActionTypes.FinishGame);
    expect(actions[0].action.winnerId).toBe(roomState.playerIds[1]);
  });
  test('2 players, first has 1 pawn in goal, second has 4 pawns in fields', () => {
    const roomState = createInitialRoomState();
    roomState.pawns[0].x = 1;
    roomState.pawns[0].z = 5;
  
    roomState.pawns[4].x = 5;
    roomState.pawns[4].z = 0;
    roomState.pawns[5].x = 4;
    roomState.pawns[5].z = 0;
    roomState.pawns[6].x = 4;
    roomState.pawns[6].z = 1;
    roomState.pawns[7].x = 4;
    roomState.pawns[7].z = 2;
    const actions = Ludo.ActionHandlers.Timeout(roomState);
    expect(actions[0].action.type).toBe(Ludo.ActionTypes.FinishGame);
    expect(actions[0].action.winnerId).toBe(roomState.playerIds[0]);
  });
});

describe('Round finish', () => {
  test('RoundEndHandler', () => {
    const roomState = createInitialRoomState();
    expect(roomState.roundTimestamp).toBe(null);
    const actions = Ludo.ActionHandlers.RoundEnd(roomState);
    expect(actions.length).toBe(3);
    expect(actions[0].action.type).toBe(Ludo.ActionTypes.SelectPawns);
    expect(actions[0].action.playerId).toBe(roomState.playerIds[0]);
    expect(actions[0].action.pawnIds.length).toBe(0);
    expect(actions[1].action.type).toBe(Ludo.ActionTypes.WaitForPlayer);
    expect(actions[1].action.playerId).toBe(roomState.playerIds[1]);
    expect(actions[1].action.expectedAction).toBe(Ludo.ActionTypes.Roll);
    expect(roomState.roundTimestamp).not.toBe(null);
    expect(actions[2].action.type).toBe(Ludo.ActionTypes.RestartProgress);
  });
});
