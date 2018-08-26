const BoardUtils = require('./BoardUtils.js');

const getNextPlayerId = (playerIds, playerId) => {
  return playerIds[(playerIds.indexOf(playerId) + 1) % playerIds.length];
};

const InitialState = () => {
  return {
    pawns: [
      {id: '12', x: 0, z: 0}, // first player
      {id: '13', x: 1, z: 0}, // first player
      {id: '14', x: 0, z: 4}, // first player
      {id: '15', x: 1, z: 1}, // first player
      {id: '4', x: 9, z: 0}, // second player
      {id: '5', x: 10, z: 0}, // second player
      {id: '6', x: 9, z: 1}, // second player
      {id: '7', x: 10, z: 1}, // second player
      {id: '8', x: 0, z: 9}, // third player
      {id: '9', x: 1, z: 9}, // third player
      {id: '10', x: 0, z: 10}, // third player
      {id: '11', x: 1, z: 10}, // third player
      {id: '0', x: 9, z: 10}, // fourth player
      {id: '1', x: 10, z: 10}, // fourth player
      {id: '2', x: 9, z: 9}, // fourth player
      {id: '3', x: 10, z: 9}, // fourth player
    ]
  }
};

const Config = {
  MinPlayer: 2,
};

const ActionTypes = {
  SelectColor: 'SelectColor',
  SelectedColor: 'SelectedColor',
  StartGame: 'StartGame',
  Roll: 'Roll',
  MovePawn: 'MovePawn',
  WaitForPlayer: 'WaitForPlayer',
  PickPawn: 'PickPawn',
  SelectPawns: 'SelectPawns',
  FinishGame: 'FinishGame'
};

const AnimationLengths = {
  movePawn: 1000,
  rollDice: 800,
};

/**
 * Enum representing game states.
 *
 * @enum
 */
const GameStates = {
  queue: 'queue',
  pickColors: 'pickColors',
  game: 'game',
  finished: 'finished',
};

const Roll = (diceNumber) => {
  return {type: ActionTypes.Roll, diceNumber};
};

const MovePawn = (pawnId, fieldSequence, finishTimestamp) => {
  return {type: ActionTypes.MovePawn, pawnId, fieldSequence};
};

const SelectColor = (color) => {
  return {type: ActionTypes.SelectColor, value: color};
};

const StartGame = (roomState) => {
  return {type: ActionTypes.StartGame, roomState: roomState};
};

const FinishGame = (roomState) => {
  return {type: ActionTypes.FinishGame, roomState: roomState};
};

const WaitForPlayer = (roomState, startTimestamp, finishTimestamp) => {
  return {type: ActionTypes.WaitForPlayer, playerId: roomState.currentPlayerId, startTimestamp, finishTimestamp};
};

const SelectPawns = (pawnIds, playerId, startTimestamp, finishTimestamp) => {
  return {type: ActionTypes.SelectPawns, pawnIds, playerId, finishTimestamp};
};

const PickPawn = (pawnId, playerId) => {
  return {type: ActionTypes.PickPawn, pawnId, playerId};
};

const RollHandler = (action, player, roomState) => {
  let rollPossible = (roomState.currentPlayerId === player.id &&
    !!roomState.waitingForAction),
    returnActions = [],
    animationLength = 0,
    rollDiceDelay = AnimationLengths.rollDice + 500;

  roomState.waitingForAction = true;

  if (!rollPossible) {
    console.log('This player cant roll in this room');
    return;
  }

  if (roomState.rolled) {
    console.log('This player already rolled in this room. Pick pawn!');
    return;
  }
  
  let playerPawns = roomState.pawns.filter(pawn => {
      return pawn.playerId === player.id;
    }),
    diceNumber = parseInt(Math.random()*6)+1, // 1-6
    // diceNumber=6;
    moves = BoardUtils.checkMoves(roomState, diceNumber, player.id);

  console.log(`player ${player.name} rolled ${diceNumber}`);
  
  roomState.diceNumber = diceNumber;

  returnActions.push(Roll(diceNumber));

  // no available moves, switch player
  if (!moves.length) {
    animationLength = Date.now() + rollDiceDelay;
    roomState.currentPlayerId = getNextPlayerId(roomState.playerIds, roomState.currentPlayerId);
    roomState.rolled = false;
    returnActions.push(WaitForPlayer(roomState, 0, animationLength));
  } else {
    let pawnIds = moves.map(move => move.pawnId);
    animationLength = Date.now() + AnimationLengths.rollDice + 500;
    roomState.rolled = true;
    roomState.selectedPawns = pawnIds;
    returnActions.push(SelectPawns(pawnIds, player.id, 0, animationLength));
  }
    
  return returnActions;
  // //check if its this players turn
  // else if (room.state.currentPlayerId === player.id &&
  //   !room.rolled &&
  //   (!room.state.nextRollTimestamp || Date.now() > room.state.nextRollTimestamp)) {
  //   // look for first pawn he can move
  //
  //
  //   if (moves.length) {
  //     let move = moves[0],
  //       pawn = playerPawns.find(p => p.id === move.pawnId),
  //       lastField = move.fieldSequence[move.fieldSequence.length - 1],
  //       anotherPawns = room.pawns.filter(pawn =>
  //         pawn.playerId !== player.id &&
  //         pawn.x === lastField.x &&
  //         pawn.z === lastField.z
  //       ) || [];
  //
  //     room.state.nextRollLength = Math.max(config.ludo.animations.movePawn * move.fieldSequence.length, config.ludo.animations.rollDice);
  //     room.state.nextRollTimestamp = Date.now() + room.state.nextRollLength;
  //     io.to(room.name).emit('pawnMove', move);
  //
  //     pawn.x = lastField.x;
  //     pawn.z = lastField.z;
  //
  //     if (anotherPawns.length) {
  //       let anotherPawn = anotherPawns[0],
  //         anotherPawnSpawnFields = BoardUtils.getSpawnFields(room.pawns, anotherPawn.playerIndex),
  //         spawnField = (anotherPawnSpawnFields && anotherPawnSpawnFields[0]) || null,
  //         anotherPawnMove = { pawnId: anotherPawn.id, fieldSequence: [spawnField] };
  //
  //       if (anotherPawnMove) {
  //         anotherPawn.x = spawnField.x;
  //         anotherPawn.z = spawnField.z;
  //         io.to(room.name).emit('pawnMove', anotherPawnMove);
  //       }
  //     }
  //
  //     if (lastField.type === FieldType.goal) {
  //       console.log('player win!');
  //       if (checkWin(playerPawns)) {
  //         finishGame(room, player);
  //       }
  //     }
  //   } else {
  //     room.state.nextRollTimestamp = Date.now() + config.ludo.animations.rollDice;
  //     console.log('player cant move');
  //     io.to(room.name).emit('console', 'player ' + player.name + ' roll\'d ' + diceNumber + ' and cant move');
  //   }
  //
  //
  //   let nextPlayerId = room.players[(playerIndex + 1) % room.players.length].id;
  //
  //   io.to(room.name).emit('roll', {diceNumber: diceNumber});
  //
  //   room.state.currentPlayerId = nextPlayerId;
  //   io.to(room.name).emit('updateGame', room.state);
  // } else {
  //   console.log('not his turn');
  // }
};

const SelectColorHandler = (action, player, roomState) => {
  const returnActions = [];
  let playerColor = roomState.playerColors.find(playerColor => {
    return playerColor.playerId === player.id;
  }),
    valueColor = roomState.playerColors.find(playerColor => {
      return playerColor.color === action.value;
    });
  
  if (playerColor) {
    console.log('player already has a color');
    return;
  }
  
  if (valueColor) {
    console.log('this color is already taken');
    return;
  }
  
  roomState.playerColors.push({playerId: player.id, color: action.value});
  player.color = action.value;
  
  returnActions.push({type: ActionTypes.SelectedColor, value: action.value});
  
  if (roomState.playerColors.length >= Config.MinPlayer && roomState.roomId !== GameStates.game) {
    let initialState = InitialState(); // [Pawns]
    
    roomState.roomState = GameStates.game;
    delete roomState.colorsQueue;

    roomState.pawns = initialState.pawns;
    // Connect pawns and players
    roomState.playerIds.forEach((playerId, i) => {
      playerColor = roomState.playerColors.find(playerColor => playerColor.playerId === playerId);

      for(let j = 0; j < 4; j++) {
        initialState.pawns[(i * 4 + j)].playerId = playerColor.playerId;
        initialState.pawns[(i * 4 + j)].color = playerColor.color;
      }
    });
    // Remove pawns for extra players
    initialState.pawns.splice(roomState.playerIds.length * 4, (4 - roomState.playerIds.length) * 4);

    roomState.currentPlayerId = roomState.playerIds[0];
    roomState.waitingForAction = true;

    let startGameAction = StartGame(roomState),
      waitForPlayer = WaitForPlayer(roomState, Date.now() + 1000);

    returnActions.push(startGameAction);
    returnActions.push(waitForPlayer);
  }
  
  return returnActions;
};

const PickPawnHandler = (action, player, roomState) => {
  let pickPawnPossible = (
      roomState.currentPlayerId === player.id &&
      !!roomState.waitingForAction
    ),
    returnActions = [];

  if (!pickPawnPossible) {
    console.log('This player cant pick pawn in this room');
    return;
  }

  let diceNumber = roomState.diceNumber,
    moves = BoardUtils.checkMoves(roomState, diceNumber, player.id);
  
  if (!moves.length) {
    console.log('Move not possible.');
    return; 
  }

  if (roomState.selectedPawns.indexOf(action.pawnId) === -1) {
    console.log('This pawn is not selected. Pick correct pawn!');
    return; 
  }

  console.log(`player ${player.name} picks pawn ${action.pawnId}`);

  let move = (moves.filter(move => move.pawnId === action.pawnId))[0],
    pawn = roomState.pawns.filter(pawn => pawn.id === move.pawnId)[0],
    lastField = move.fieldSequence[move.fieldSequence.length - 1],
    lastFieldPawns = roomState.pawns.filter(pawn => ( 
      pawn.x === lastField.x &&
      pawn.z === lastField.z &&
      pawn.playerId !== player.id
    )),
    lastFieldPawn = lastFieldPawns.length && lastFieldPawns[0];
  
  pawn.x = lastField.x;
  pawn.z = lastField.z;
  
  animationLength = Date.now() + (AnimationLengths.movePawn * move.fieldSequence.length) + 500;
  roomState.rolled = false;
  roomState.selectedPawns = [];
  roomState.currentPlayerId = getNextPlayerId(roomState.playerIds, roomState.currentPlayerId);
  returnActions.push(MovePawn(action.pawnId, move.fieldSequence));
  
  // check if pawn moves on someone others pawn and move this pawn to spawn
  if (lastFieldPawn) {
    let playerIndex =  roomState.playerIds.findIndex(playerId => lastFieldPawn.playerId === playerId),
      spawnPosition = BoardUtils.getSpawnFields(roomState.pawns, playerIndex)[0],
      fieldSequence = [{x: spawnPosition.x, z: spawnPosition.z}];
    
    lastFieldPawn.x = spawnPosition.x;
    lastFieldPawn.z = spawnPosition.z;
    
    returnActions.push(MovePawn(lastFieldPawn.id, fieldSequence));
  }
  //check win
  if (lastField.type === BoardUtils.FieldTypes.goal) {
    let playerPawns = roomState.pawns.filter(pawn => {
      return pawn.playerId === player.id;
    });
    if (BoardUtils.checkWin(playerPawns)) {
      
      console.log(`player ${player.name} wins!`);
      roomState.winnerId = player.id;
      returnActions.push(FinishGame(roomState));
    }
  }
  returnActions.push(WaitForPlayer(roomState, 0, animationLength));

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
  },
  ActionHandlers: {
    SelectColor: SelectColorHandler,
    Roll: RollHandler,
    PickPawn: PickPawnHandler,
  },
  AnimationLengths,
  ActionTypes,
  InitialState,
};

module.exports = Ludo;