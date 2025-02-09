import Game from './../game';
import Ludo from './index.js';

let currentTime = 1;
Date.now = () => {
  return currentTime;
};

const colors = ['blue', 'red', 'yellow', 'green'];

const createInitialGameState = () => {
  const playerIds = ['1', '2'],
    players = [
      { id: '1', name: 'Player 1' },
      { id: '2', name: 'Player 2' },
    ],
    playerColors = [
      { playerId: '1', color: 'red' },
      { playerId: '2', color: 'blue' },
    ];
  let pawns = Ludo.InitialState().pawns;

  playerIds.forEach((playerId, i) => {
    let playerColor = playerColors.find(
      (playerColor) => playerColor.playerId === playerId,
    );

    for (let j = 0; j < 4; j++) {
      pawns[i * 4 + j].playerId = playerColor.playerId;
      pawns[i * 4 + j].color = playerColor.color;
    }
  });

  return {
    roomId: '0',
    currentPlayerId: '1',
    rolled: false,
    players,
    playerIds,
    playerColors,
    pawns,
    roundTimestamp: null,
  };
};

const isFunction = (functionToCheck) =>
  !!(
    functionToCheck &&
    {}.toString.call(functionToCheck) === '[object Function]'
  );

let action = Ludo.Actions.Roll(),
  player,
  anotherPlayer;

describe('User make full move', () => {
  beforeEach(() => {
    player = { id: '1', login: 'player 1' };
    anotherPlayer = { id: '2', login: 'player 2' };
  });
  test('Current player picks pawn', () => {
    let errorMessage,
      initialRoomState = createInitialGameState(),
      pawnId = initialRoomState.pawns.find(
        (pawn) => pawn.playerId === initialRoomState.currentPlayerId,
      );

    try {
      Ludo.ActionHandlers.PickPawn(
        Ludo.Actions.PickPawn(pawnId),
        player,
        initialRoomState,
      );
    } catch (e) {
      errorMessage = e.message;
    }

    expect(errorMessage).toBe('Dice not rolled');
  });
  test('Wrong player rolls', () => {
    let errorMessage,
      initialRoomState = createInitialGameState();

    try {
      Ludo.ActionHandlers.Roll(
        action,
        anotherPlayer,
        initialRoomState,
      );
    } catch (e) {
      errorMessage = e.message;
    }

    expect(errorMessage).toBe('its not this player turn');
  });
  test('Player already rolled in this turn', () => {
    let errorMessage,
      gameState = createInitialGameState();

    gameState.rolled = true;
    try {
      Ludo.ActionHandlers.Roll(action, player, gameState);
    } catch (e) {
      errorMessage = e.message;
    }
    expect(errorMessage).toBe(
      'This player already rolled in this room. Pick pawn!',
    );
  });
  test('Player rolls 5 with pawns on spawn', () => {
    let returnActions,
      gameState = createInitialGameState();

    currentTime = 1;
    returnActions = Ludo.ActionHandlers.Roll(
      action,
      player,
      gameState,
      5,
    );
    expect(gameState.rolled).toBe(true);
    expect(gameState.currentPlayerId).toBe(gameState.playerIds[1]);
    expect(returnActions.length).toBe(3);
    const rollAction = returnActions[0];
    const waitAction = returnActions[1];
    const stopProgressAction = returnActions[2];
    expect(rollAction.action.type).toBe(Ludo.ActionTypes.Rolled);
    expect(rollAction.action.diceNumber).toBe(5);
    expect(waitAction.action.type).toBe(
      Ludo.ActionTypes.WaitForPlayer,
    );
    expect(waitAction.action.playerId).toBe(gameState.playerIds[1]);
    expect(waitAction.action.expectedAction).toBe(
      Ludo.ActionTypes.Roll,
    );
    expect(waitAction.timestamp).toBe(
      currentTime + Ludo.AnimationLengths.rollDice,
    );
    expect(isFunction(waitAction.callback)).toBe(true);
    expect(stopProgressAction.action.type).toBe(
      Ludo.ActionTypes.StopProgress,
    );

    currentTime++;
    const callbackActions = waitAction.callback();
    expect(gameState.rolled).toBe(false);
    expect(gameState.currentPlayerId).toBe(gameState.playerIds[1]);
    expect(callbackActions.length).toBe(1);
    const resetProgressAction = callbackActions[0].action;
    expect(resetProgressAction.type).toBe(
      Ludo.ActionTypes.RestartProgress,
    );
    expect(gameState.roundTimestamp).toBe(
      currentTime + Ludo.Config.RoundLength,
    );
  });
  test('Player rolls 6 with pawns on spawn', () => {
    let returnActions,
      gameState = createInitialGameState();

    currentTime = 1;
    returnActions = Ludo.ActionHandlers.Roll(
      action,
      player,
      gameState,
      6,
    );
    expect(gameState.rolled).toBe(true);
    expect(gameState.currentPlayerId).toBe(gameState.playerIds[0]);
    expect(returnActions.length).toBe(3);
    const rollAction = returnActions[0];
    const waitAction = returnActions[1];
    const stopProgressAction = returnActions[2];
    expect(rollAction.action.type).toBe(Ludo.ActionTypes.Rolled);
    expect(rollAction.action.diceNumber).toBe(6);
    expect(waitAction.action.type).toBe(
      Ludo.ActionTypes.WaitForPlayer,
    );
    expect(waitAction.timestamp).toBe(
      currentTime + Ludo.AnimationLengths.rollDice,
    );
    expect(waitAction.action.expectedAction).toBe(
      Ludo.ActionTypes.PickPawn,
    );
    expect(isFunction(waitAction.callback)).toBe(true);
    expect(stopProgressAction.action.type).toBe(
      Ludo.ActionTypes.StopProgress,
    );

    currentTime++;
    const callbackActions = waitAction.callback();
    expect(gameState.rolled).toBe(true);
    expect(callbackActions.length).toBe(2);
    const selectPawnsAction = callbackActions[0].action;
    const resetProgressAction = callbackActions[1].action;
    expect(selectPawnsAction.type).toBe(Ludo.ActionTypes.SelectPawns);
    expect(selectPawnsAction.pawnIds).toEqual([
      '12',
      '13',
      '14',
      '15',
    ]);
    expect(selectPawnsAction.playerId).toBe('1');
    expect(resetProgressAction.type).toBe(
      Ludo.ActionTypes.RestartProgress,
    );
    expect(gameState.roundTimestamp).toBe(
      currentTime + Ludo.Config.RoundLength,
    );
  });
  test('Player rolls 5 with 1 pawn on field', () => {
    let returnActions,
      gameState = createInitialGameState();

    gameState.pawns[0].x = 0; // Move first pawn to first spawn field
    gameState.pawns[0].z = 4;

    currentTime = 1;
    returnActions = Ludo.ActionHandlers.Roll(
      action,
      player,
      gameState,
      5,
    );
    expect(gameState.rolled).toBe(true);
    expect(gameState.currentPlayerId).toBe(gameState.playerIds[0]);
    expect(returnActions.length).toBe(3);
    const rollAction = returnActions[0];
    const waitAction = returnActions[1];
    const stopProgressAction = returnActions[2];
    expect(rollAction.action.type).toBe(Ludo.ActionTypes.Rolled);
    expect(rollAction.action.diceNumber).toBe(5);
    expect(waitAction.action.type).toBe(
      Ludo.ActionTypes.WaitForPlayer,
    );
    expect(waitAction.timestamp).toBe(
      currentTime + Ludo.AnimationLengths.rollDice,
    );
    expect(waitAction.action.expectedAction).toBe(
      Ludo.ActionTypes.PickPawn,
    );
    expect(isFunction(waitAction.callback)).toBe(true);
    expect(stopProgressAction.action.type).toBe(
      Ludo.ActionTypes.StopProgress,
    );

    currentTime++;
    const callbackActions = waitAction.callback();
    expect(gameState.rolled).toBe(true);
    expect(callbackActions.length).toBe(2);
    const selectPawnsAction = callbackActions[0].action;
    const resetProgressAction = callbackActions[1].action;

    expect(selectPawnsAction.type).toBe(Ludo.ActionTypes.SelectPawns);
    expect(selectPawnsAction.pawnIds).toEqual(['12']);
    expect(selectPawnsAction.playerId).toBe('1');
    expect(resetProgressAction.type).toBe(
      Ludo.ActionTypes.RestartProgress,
    );
    expect(gameState.roundTimestamp).toBe(
      currentTime + Ludo.Config.RoundLength,
    );
  });
  test('Player rolls 3, can move and beat a pawn', () => {
    let returnActions,
      gameState = createInitialGameState();

    gameState.pawns[0].x = 0; // Move first pawn to first spawn field
    gameState.pawns[0].z = 4;
    gameState.pawns[5].x = 3; // Move seconds player pawn 5 fields
    gameState.pawns[5].z = 4;

    currentTime = 1;
    returnActions = Ludo.ActionHandlers.Roll(
      action,
      player,
      gameState,
      3,
    );
    expect(gameState.rolled).toBe(true);
    expect(gameState.currentPlayerId).toBe(gameState.playerIds[0]);
    expect(returnActions.length).toBe(3);
    const rollAction = returnActions[0];
    const waitAction = returnActions[1];
    const stopProgressAction = returnActions[2];
    expect(rollAction).toMatchObject({
      action: {
        type: Ludo.ActionTypes.Rolled,
        diceNumber: 3,
      },
    });
    expect(waitAction).toMatchObject({
      action: {
        type: Ludo.ActionTypes.WaitForPlayer,
        expectedAction: Ludo.ActionTypes.PickPawn,
        playerId: gameState.playerIds[0],
      },
      timestamp: currentTime + Ludo.AnimationLengths.rollDice,
      callback: waitAction.callback,
    });
    expect(isFunction(waitAction.callback)).toBe(true);
    expect(stopProgressAction).toMatchObject({
      action: {
        type: Ludo.ActionTypes.StopProgress,
      },
    });

    currentTime++;
    const callbackActions = waitAction.callback();
    expect(gameState.rolled).toBe(true);
    expect(callbackActions.length).toBe(2);
    const selectPawnsAction = callbackActions[0];
    const resetProgressAction = callbackActions[1];

    expect(selectPawnsAction).toMatchObject({
      action: {
        type: Ludo.ActionTypes.SelectPawns,
        pawnIds: ['12'],
        playerId: gameState.playerIds[0],
      },
    });
    expect(resetProgressAction).toMatchObject({
      action: {
        type: Ludo.ActionTypes.RestartProgress,
      },
    });
    expect(gameState.roundTimestamp).toBe(
      currentTime + Ludo.Config.RoundLength,
    );
  });

  test('Player 1 rolls 6 6 6', () => {
    let returnActions,
      gameState = createInitialGameState(),
      player1Pawns = gameState.pawns.filter(
        (pawn) => pawn.playerId === player.id,
      );

    // Roll 6
    returnActions = Ludo.ActionHandlers.Roll(
      action,
      player,
      gameState,
      6,
    );
    expect(gameState.currentPlayerId).toBe(gameState.playerIds[0]);
    expect(returnActions.length).toBe(3);
    let waitForPlayerAction = returnActions[1];
    expect(waitForPlayerAction).toMatchObject({
      action: {
        type: Ludo.ActionTypes.WaitForPlayer,
        expectedAction: Ludo.ActionTypes.PickPawn,
        playerId: gameState.playerIds[0],
      },
    });
    let [selectPawnAction, _] = waitForPlayerAction.callback();
    expect(selectPawnAction).toMatchObject({
      action: {
        type: Ludo.ActionTypes.SelectPawns,
        pawnIds: player1Pawns.map((pawn) => pawn.id),
        playerId: player.id,
      },
    });
    console.log('room.rolled ', gameState.diceNumber);
    // Pick first pawn
    returnActions = Ludo.ActionHandlers.PickPawn(
      Ludo.Actions.PickPawn(player1Pawns[0].id),
      player,
      gameState,
    );
    expect(returnActions.length).toBe(5);
    selectPawnAction = returnActions[0];
    let movePawnAction = returnActions[1];
    waitForPlayerAction = returnActions[2];
    expect(selectPawnAction).toMatchObject({
      action: {
        type: Ludo.ActionTypes.SelectPawns,
        pawnIds: [],
        playerId: player.id,
      },
    });
    expect(movePawnAction).toMatchObject({
      action: {
        type: Game.ActionTypes.MovePawn,
        pawnId: player1Pawns[0].id,
        fieldSequence: [
          { x: 0, z: 4, playerIndex: 0, color: '', type: 'start' },
        ],
      },
    });
    expect(waitForPlayerAction).toMatchObject({
      action: {
        type: Ludo.ActionTypes.WaitForPlayer,
        expectedAction: Ludo.ActionTypes.Roll,
        playerId: gameState.playerIds[0],
      },
    });
    waitForPlayerAction.callback();

    // Roll second time
    returnActions = Ludo.ActionHandlers.Roll(
      action,
      player,
      gameState,
      6,
    );
    expect(returnActions.length).toBe(3);
    waitForPlayerAction = returnActions[1];
    expect(waitForPlayerAction).toMatchObject({
      action: {
        type: Ludo.ActionTypes.WaitForPlayer,
        expectedAction: Ludo.ActionTypes.PickPawn,
        playerId: gameState.playerIds[0],
      },
    });
    returnActions = waitForPlayerAction.callback();
    expect(returnActions[0]).toMatchObject({
      action: {
        type: Ludo.ActionTypes.SelectPawns,
        pawnIds: [player1Pawns[0].id],
        playerId: player.id,
      },
    });

    // Pick second pawn
    returnActions = Ludo.ActionHandlers.PickPawn(
      Ludo.Actions.PickPawn(player1Pawns[0].id),
      player,
      gameState,
    );
    expect(returnActions.length).toBe(5);
    expect(returnActions[1].action.type).toBe(
      Game.ActionTypes.MovePawn,
    );
    expect(returnActions[1].action.pawnId).toBe(player1Pawns[0].id);
    expect(returnActions[2].action.type).toBe(
      Ludo.ActionTypes.WaitForPlayer,
    );
    expect(returnActions[2].action.playerId).toBe(anotherPlayer.id);
    expect(returnActions[2].action.expectedAction).toBe(
      Ludo.ActionTypes.Roll,
    );
    returnActions[2].callback();

    // Second player rolls 3
    returnActions = Ludo.ActionHandlers.Roll(
      action,
      anotherPlayer,
      gameState,
      3,
    );
    expect(returnActions.length).toBe(3);
    returnActions[1].callback();

    // First player rolls 6
    returnActions = Ludo.ActionHandlers.Roll(
      action,
      player,
      gameState,
      6,
    );
    expect(returnActions.length).toBe(3);
    returnActions[1].callback();

    // First player picks pawn
    returnActions = Ludo.ActionHandlers.PickPawn(
      Ludo.Actions.PickPawn(player1Pawns[0].id),
      player,
      gameState,
    );
    expect(returnActions.length).toBe(5);
    expect(returnActions[2].action.type).toBe(
      Ludo.ActionTypes.WaitForPlayer,
    );
    expect(returnActions[2].action.expectedAction).toBe(
      Ludo.ActionTypes.Roll,
    );
    expect(returnActions[2].action.playerId).toBe(player.id);
    expect(player.lastRoll).toBe(6);
    expect(player.previousRoll).toBe(0);
    returnActions = waitForPlayerAction.callback();
  });
});

describe('TimeoutHandler', () => {
  test('2 players, both on spawn', () => {
    const gameState = createInitialGameState();
    const actions = Ludo.ActionHandlers.Timeout(gameState);
    expect(actions[0].action.type).toBe(Ludo.ActionTypes.FinishGame);
    expect(actions[0].action.winnerId).toBe(gameState.playerIds[0]);
  });
  test('2 players, second has 1 pawn further', () => {
    const gameState = createInitialGameState();
    gameState.pawns[4].x = 4;
    gameState.pawns[4].z = 4;
    const actions = Ludo.ActionHandlers.Timeout(gameState);
    expect(actions[0].action.type).toBe(Ludo.ActionTypes.FinishGame);
    expect(actions[0].action.winnerId).toBe(gameState.playerIds[1]);
  });
  test('2 players, second has pawns in goals', () => {
    const gameState = createInitialGameState();
    gameState.pawns[4].x = 5;
    gameState.pawns[4].z = 1;
    gameState.pawns[5].x = 5;
    gameState.pawns[5].z = 2;
    gameState.pawns[6].x = 5;
    gameState.pawns[6].z = 3;
    gameState.pawns[7].x = 5;
    gameState.pawns[7].z = 4;
    const actions = Ludo.ActionHandlers.Timeout(gameState);
    expect(actions[0].action.type).toBe(Ludo.ActionTypes.FinishGame);
    expect(actions[0].action.winnerId).toBe(gameState.playerIds[1]);
  });
  test('2 players, first has 1 pawn in goal, second has 4 pawns in fields', () => {
    const gameState = createInitialGameState();
    gameState.pawns[0].x = 1;
    gameState.pawns[0].z = 5;

    gameState.pawns[4].x = 5;
    gameState.pawns[4].z = 0;
    gameState.pawns[5].x = 4;
    gameState.pawns[5].z = 0;
    gameState.pawns[6].x = 4;
    gameState.pawns[6].z = 1;
    gameState.pawns[7].x = 4;
    gameState.pawns[7].z = 2;
    const actions = Ludo.ActionHandlers.Timeout(gameState);
    expect(actions[0].action.type).toBe(Ludo.ActionTypes.FinishGame);
    expect(actions[0].action.winnerId).toBe(gameState.playerIds[0]);
  });
});

describe('Round finish', () => {
  test('RoundEndHandler', () => {
    const gameState = createInitialGameState();
    expect(gameState.roundTimestamp).toBe(null);
    const actions = Ludo.ActionHandlers.RoundEnd(gameState);
    expect(actions.length).toBe(3);
    expect(actions[0].action.type).toBe(Ludo.ActionTypes.SelectPawns);
    expect(actions[0].action.playerId).toBe(gameState.playerIds[0]);
    expect(actions[0].action.pawnIds.length).toBe(0);
    expect(actions[1].action.type).toBe(
      Ludo.ActionTypes.WaitForPlayer,
    );
    expect(actions[1].action.playerId).toBe(gameState.playerIds[1]);
    expect(actions[1].action.expectedAction).toBe(
      Ludo.ActionTypes.Roll,
    );
    expect(gameState.roundTimestamp).not.toBe(null);
    expect(actions[2].action.type).toBe(
      Ludo.ActionTypes.RestartProgress,
    );
  });
});
