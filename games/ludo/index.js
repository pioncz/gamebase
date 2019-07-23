const BoardUtils = require('./BoardUtils.js');
const Board = require('./Board.js');
const { Fields, FieldTypes, } = require('./Fields.js');
const Game = require('./../game');

const InitialState = () => {
  return {
    pawns: [
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
    ],
  }
};

const Config = {
  Colors: [
    "#D50000",
    "#64DD17",
    "#1DE9B6",
    "#FFEA00",
    '#FFCCDD',
  ],
  MinPlayer: 4,
  // GameLength: (15 * 60 * 1000), //15 minutes
  GameLength: 2 * (15 * 60 * 1000), //30 minutes
  RoundLength: (10 * 1000), // Time for player to move
};

const ActionTypes = {
  SelectColor: 'SelectColor',
  SelectedColor: 'SelectedColor',
  StartGame: 'StartGame',
  Roll: 'Roll',
  Rolled: 'Rolled',
  WaitForPlayer: 'WaitForPlayer',
  PickPawn: 'PickPawn',
  SelectPawns: 'SelectPawns',
  FinishGame: 'FinishGame',
  StopProgress: 'StopProgress',
  RestartProgress: 'RestartProgress',
  PickColors: 'PickColors',
};

const AnimationLengths = {
  movePawn: 300,
  movePawnFromSpawn: 600,
  rollDice: 600,
};

const Roll = () => {
  return {type: ActionTypes.Roll, };
};

const Rolled = diceNumber => {
  return {type: ActionTypes.Rolled, diceNumber,};
};

const SelectColor = (playerId, color) => {
  return {type: ActionTypes.SelectColor, playerId, value: color,};
};

const StartGame = (gameState) => {
  return {type: ActionTypes.StartGame, gameState,};
};

const FinishGame = (winnerId) => {
  return {type: ActionTypes.FinishGame, winnerId,};
};

const WaitForPlayer = (gameState, expectedAction) => {
  return {type: ActionTypes.WaitForPlayer, playerId: gameState.currentPlayerId, expectedAction,};
};

const SelectPawns = (pawnIds, playerId) => {
  return {type: ActionTypes.SelectPawns, pawnIds, playerId,};
};

const PickPawn = (pawnId) => {
  return {type: ActionTypes.PickPawn, pawnId,};
};

const StopProgress = () => ({
  type: ActionTypes.StopProgress,
});

const RestartProgress = () => ({
  type: ActionTypes.RestartProgress,
});

const PickColors = (gameState) => {
  return { type: ActionTypes.PickColors, gameState, }
}

// For diceNumber 0 number will be generated randomly from 1 to 6
const RollHandler = (action, player, gameState, diceNumber = 0) => {
  let returnActions = [];

  if (player.id !== gameState.currentPlayerId) {
    throw new Error('its not this player turn');
  }

  if (gameState.rolled) {
    throw new Error('This player already rolled in this room. Pick pawn!');
  }
  //diceNumber=6;
  let generatedDiceNumber = diceNumber !== 0 &&
    (diceNumber > 0 && diceNumber < 7 && diceNumber)
    || Math.min(parseInt(Math.random()*6)+1,6), // 1-6
    moves = BoardUtils.checkMoves(gameState, generatedDiceNumber, player.id);

  gameState.rolled = true;
  gameState.diceNumber = generatedDiceNumber;

  returnActions.push({action: Rolled(generatedDiceNumber),});

  let waitForAction = ActionTypes.PickPawn;
  if (!moves.length) {
    // if player didnt just roll 6, switch player
    if (player.previousRoll !== 6 || player.lastRoll === 6) {
      player.lastRoll = 0;
      player.previousRoll = 0;
      gameState.currentPlayerId = Game.Utils.getNextPlayerId(gameState.players, gameState.currentPlayerId);
      waitForAction = ActionTypes.Roll;
    }
  }

  returnActions.push({
    action: WaitForPlayer(gameState, waitForAction),
    timestamp: Date.now() + AnimationLengths.rollDice,
    callback: () => {
      let returnActions = [];
      player.previousRoll = player.lastRoll;
      player.lastRoll = generatedDiceNumber;

      if (!moves.length) {
        gameState.rolled = false;
      } else {
        let pawnIds = moves.map(move => move.pawnId);
        gameState.selectedPawns = pawnIds;
        returnActions.push({action: SelectPawns(pawnIds, player.id),});
      }

      gameState.roundTimestamp = Date.now() + Config.RoundLength;
      returnActions.push({action: RestartProgress(),});

      return returnActions;
    },
  });

  returnActions.push({action: StopProgress(),});

  return returnActions;
};

const SelectColorHandler = (action, player, gameState) => {
  const returnActions = [];
  let playerColor = gameState.playerColors.find(playerColor => {
      return playerColor.playerId === player.id;
    }),
    valueColor = gameState.playerColors.find(playerColor => {
      return playerColor.color === action.value;
    }),
    queueColor = gameState.colorsQueue.find(queueColor =>
      queueColor.color === action.value
    );

  if (playerColor) {
    console.log('player already has a color');
    return;
  }

  if (valueColor || queueColor.selected) {
    console.log('this color is already taken');
    return;
  }

  gameState.playerColors.push({playerId: player.id, color: action.value,});
  player.color = action.value;
  gameState.colorsQueue = gameState.colorsQueue.map(color => color.color === action.value ? {...color, selected: true,} : color);

  returnActions.push({action: {type: ActionTypes.SelectedColor, playerId: player.id, value: action.value,},});

  return returnActions;
};

const PickPawnHandler = (action, player, gameState) => {
  let returnActions = [],
    animationLength;

  if (player.id !== gameState.currentPlayerId) {
    console.log(`its not this player turn`);
    return;
  }

  if (!gameState.rolled) {
    throw new Error('Dice not rolled');
  }

  let diceNumber = gameState.diceNumber,
    moves = BoardUtils.checkMoves(gameState, diceNumber, player.id);

  if (!moves.length) {
    console.log('Move not possible.');
    return;
  }

  if (gameState.selectedPawns.indexOf(action.pawnId) === -1) {
    console.log('This pawn is not selected. Pick correct pawn!');
    return;
  }

  console.log(`player ${player.login} picks pawn ${action.pawnId}`);

  let move = (moves.filter(move => move.pawnId === action.pawnId))[0],
    pawn = gameState.pawns.filter(pawn => pawn.id === move.pawnId)[0],
    lastField = move.fieldSequence[move.fieldSequence.length - 1],
    lastFieldPawns = gameState.pawns.filter(pawn => (
      pawn.x === lastField.x &&
      pawn.z === lastField.z &&
      pawn.playerId !== player.id
    )),
    lastFieldPawn = lastFieldPawns.length && lastFieldPawns[0];

  const playerIndex = gameState.players.findIndex(p => p.id === player.id);
  const spawnFields = BoardUtils.getSpawnFields(playerIndex);
  const wasPawnOnSpawn = (spawnFields.findIndex(
    spawnField => spawnField.x === pawn.x && spawnField.z === pawn.z
  )) > -1;

  pawn.x = lastField.x;
  pawn.z = lastField.z;

  if (wasPawnOnSpawn) {
    animationLength = Date.now() + AnimationLengths.movePawnFromSpawn + (AnimationLengths.movePawn * (move.fieldSequence.length - 1)) + 500;
  } else {
    animationLength = Date.now() + (AnimationLengths.movePawn * move.fieldSequence.length) + 500;
  }

  move.fieldSequence = move.fieldSequence.map(
    (sequence, i) => ({
      ...sequence,
      animationLength: (i===0 && wasPawnOnSpawn) ? AnimationLengths.movePawnFromSpawn : AnimationLengths.movePawn,
    }));

  gameState.selectedPawns = [];
  returnActions.push({action: SelectPawns([], gameState.currentPlayerId),});
  if (player.lastRoll !== 6 || player.previousRoll === 6) {
    player.lastRoll = 0;
    player.previousRoll = 0;
    gameState.currentPlayerId = Game.Utils.getNextPlayerId(gameState.players, gameState.currentPlayerId);
  }
  returnActions.push({action: Game.Actions.MovePawn(action.pawnId, move.fieldSequence),});

  // check if pawn moves on someone others pawn and move this pawn to spawn
  if (lastFieldPawn) {
    let playerIndex =  gameState.playerIds.findIndex(playerId => lastFieldPawn.playerId === playerId),
      spawnPosition = BoardUtils.getEmptySpawnFields(gameState.pawns, playerIndex)[0],
      fieldSequence = [{x: spawnPosition.x, z: spawnPosition.z,},];

    lastFieldPawn.x = spawnPosition.x;
    lastFieldPawn.z = spawnPosition.z;

    returnActions.push({
      action: Game.Actions.MovePawn(lastFieldPawn.id, fieldSequence),
      timestamp: animationLength - AnimationLengths.movePawn,
    });
  }

  //check win
  if (lastField.type === BoardUtils.FieldTypes.goal) {
    let playerPawns = gameState.pawns.filter(pawn => {
      return pawn.playerId === player.id;
    });
    if (BoardUtils.checkWin(playerPawns)) {
      console.log(`player ${player.login} wins!`);
      gameState.winnerId = player.id;
      gameState.roomState = Game.GameStates.finished;
      returnActions.push({action:FinishGame(player.id),});
    }
  }

  returnActions.push({
    action: WaitForPlayer(gameState, ActionTypes.Roll),
    timestamp: animationLength,
    callback: () => {
      gameState.rolled = false;
    },
  });
  gameState.roundTimestamp = null;
  returnActions.push({ action: StopProgress(), });
  returnActions.push({
    action: RestartProgress(),
    timestamp: animationLength,
    callback: () => {
      gameState.roundTimestamp = Date.now() + Config.RoundLength;
    },
  });

  return returnActions;
};

const DisconnectedHandler = (action, player, room) => {
  let returnActions = [],
    activePlayers,
    gameState = room.gameState,
    playerIndex = gameState.playerIds.indexOf(player.id),
    spawnFields = gameState.pawns && BoardUtils.getEmptySpawnFields(gameState.pawns, playerIndex),
    playerPawns = gameState.pawns && gameState.pawns.filter(pawn =>
      pawn.playerId === player.id &&
      BoardUtils.getFieldByPosition(pawn.x, pawn.z).type !== BoardUtils.FieldTypes.spawn
    );

  activePlayers = room.getActivePlayers();

  // set winner if there's only 1 player left
  if (activePlayers.length === 1) {
    room.gameState.winnerId = activePlayers[0].id;
    room.gameState.roomState = Game.GameStates.finished;
    returnActions.push({action:FinishGame(room.gameState.winnerId),})
  // if there is no winner, move player pawns to spawn
  } else if (playerPawns && activePlayers.length) {
    // for every player pawn which is not in goal
    for(let i = 0; i < playerPawns.length; i++) {
      let pawn = playerPawns[i],
        field = spawnFields[i];

      pawn.x = field.x;
      pawn.z = field.z;

      returnActions.push({action: Game.Actions.MovePawn(pawn.id, [{x: field.x, z: field.z,},]),});
    }
    // switch player if disconnected current
    if(gameState.currentPlayerId === player.id) {
      gameState.currentPlayerId = Game.Utils.getNextPlayerId(gameState.players, gameState.currentPlayerId);
      gameState.selectedPawns = [];
      gameState.rolled = false;
      returnActions.push({
        action: WaitForPlayer(gameState, ActionTypes.Roll),
      });
    }
  }

  // append Disconnected action to returnActions
  returnActions.push({action,});

  return returnActions;
};

const TimeoutHandler = (gameState) => {
  const winnerId = BoardUtils.getWinningPlayer(gameState);
  gameState.winnerId = winnerId;
  gameState.roomState = Game.GameStates.finished;
  return [{action:FinishGame(gameState.winnerId),},];
};

const RoundEndHandler = (gameState) => {
  const returnActions = [];
  returnActions.push({action: SelectPawns([], gameState.currentPlayerId),});
  gameState.currentPlayerId = Game.Utils.getNextPlayerId(gameState.players, gameState.currentPlayerId);
  gameState.roundTimestamp = Date.now() + Config.RoundLength;
  gameState.rolled = false;
  gameState.selectedPawns = [];

  returnActions.push({action: WaitForPlayer(gameState, ActionTypes.Roll),});
  returnActions.push({action: RestartProgress(),});
  return returnActions;
};

const StartGameHandler = (gameState) => {
  const returnActions = [];

  returnActions.push({action: StartGame(gameState),});

  return returnActions;
};

const PickColorsHandler = (gameState) => {
  const returnActions = [];

  gameState.roomState = Game.GameStates.pickColors;

  returnActions.push({action: PickColors(gameState),});

  return returnActions;
};

const Ludo = {
  Name: 'Ludo',
  Config,
  Actions: {
    SelectColor,
    Roll,
    StartGame,
    WaitForPlayer,
    PickPawn,
    FinishGame,
    PickColors,
  },
  ActionHandlers: {
    SelectColor: SelectColorHandler,
    Roll: RollHandler,
    PickPawn: PickPawnHandler,
    Disconnected: DisconnectedHandler,
    Timeout: TimeoutHandler,
    RoundEnd: RoundEndHandler,
    StartGame: StartGameHandler,
    PickColors: PickColorsHandler,
  },
  Board,
  BoardUtils,
  Fields,
  AnimationLengths,
  ActionTypes,
  InitialState,
};

module.exports = Ludo;