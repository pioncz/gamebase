const BoardUtils = require('./BoardUtils.js');

const InitialState = () => {
  return {
    pawns: [
      {id: '12', x: 0, z: 0}, // first player
      {id: '13', x: 1, z: 0}, // first player
      {id: '14', x: 0, z: 1}, // first player
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
  MinPlayer: 1,
};

const ActionTypes = {
  SelectColor: 'SelectColor',
  SelectedColor: 'SelectedColor',
  StartGame: 'StartGame',
  Roll: 'Roll',
  MovePawn: 'MovePawn',
  WaitForPlayer: 'WaitForPlayer',
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

const MovePawn = (pawnId, fieldSequence) => {
  return {type: ActionTypes.MovePawn, pawnId, fieldSequence};
};

const SelectColor = (color) => {
  return {type: ActionTypes.SelectColor, value: color};
};

const StartGame = (roomState) => {
  return {type: ActionTypes.StartGame, roomState: roomState};
};

const WaitForPlayer = (roomState, finishTimestamp) => {
  return {type: ActionTypes.WaitForPlayer, playerId: roomState.currentPlayerId, finishTimestamp};
};

const RollHandler = (action, player, roomState) => {
  let rollPossible = (roomState.currentPlayerId === player.id &&
    !!roomState.waitingForAction),
    returnActions = [],
    getNextPlayerId = (playerIds, playerId) => {
      return playerIds[(playerIds.indexOf(playerId) + 1) % playerIds.length];
    },
    animationLength = 0,
    rollDiceDelay = AnimationLengths.rollDice + 500;

  if (!rollPossible) {
    console.log('this player cant roll in that room');
    return;
  }
  
  let playerPawns = roomState.pawns.filter(pawn => {
    return pawn.playerId === player.id;
  }),
    diceNumber = parseInt(Math.random()*6)+1, // 1-6
    // diceNumber=6;
//diceNumber=1;
    moves = BoardUtils.checkMoves(roomState.pawns, diceNumber, roomState.playerIds.indexOf(player.id));

  console.log(`player ${player.name} rolled ${diceNumber}`);
  
  diceNumber = parseInt(Math.random()*3)+4;
  returnActions.push(Roll(diceNumber));
  
  roomState.waitingForAction = true;
  console.log('--------');
  console.log(roomState.pawns.length, diceNumber, player.id);
  console.log(moves.length);
  
  // no available moves, switch player
  if (!moves.length) {
    animationLength = Date.now() + rollDiceDelay;
    roomState.currentPlayerId = getNextPlayerId(roomState.playerIds, roomState.currentPlayerId);
  // available moves, call first move, switch player
  } else {
    roomState.currentPlayerId = getNextPlayerId(roomState.playerIds, roomState.currentPlayerId);
    animationLength = Date.now() + rollDiceDelay;
    let move = moves[0],
      pawn = playerPawns.find(p => p.id === move.pawnId),
      lastField = move.fieldSequence[move.fieldSequence.length - 1],
      anotherPawns = roomState.pawns.filter(pawn =>
        pawn.playerId !== player.id &&
        pawn.x === lastField.x &&
        pawn.z === lastField.z
      ) || [];
  
    let nextRollLength = AnimationLengths.movePawn * move.fieldSequence.length;
  
    pawn.x = lastField.x;
    pawn.z = lastField.z;
    
    returnActions.push(MovePawn(move.pawnId, move.fieldSequence, nextRollLength));
    // if there are another pawns on last field, move them to their spawns
    // if (anotherPawns.length) {
    //   let anotherPawn = anotherPawns[0],
    //     anotherPawnSpawnFields = BoardUtils.getSpawnFields(room.pawns, anotherPawn.playerIndex),
    //     spawnField = (anotherPawnSpawnFields && anotherPawnSpawnFields[0]) || null,
    //     anotherPawnMove = { pawnId: anotherPawn.id, fieldSequence: [spawnField] };
    //
    //   if (anotherPawnMove) {
    //     anotherPawn.x = spawnField.x;
    //     anotherPawn.z = spawnField.z;
    //     io.to(room.name).emit('pawnMove', anotherPawnMove);
    //   }
    // }
  }
  
  returnActions.push(WaitForPlayer(roomState, animationLength));
  
  /////

  
  // if (lastField.type === FieldType.goal) {
  //   console.log('player win!');
  //   if (checkWin(playerPawns)) {
  //     finishGame(room, player);
  //   }
  // }
  
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
      waitForPlayer = WaitForPlayer(roomState);

    returnActions.push(startGameAction);
    returnActions.push(waitForPlayer);
  }
  
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
  },
  ActionHandlers: {
    SelectColor: SelectColorHandler,
    Roll: RollHandler,
  },
  AnimationLengths,
  ActionTypes,
};

module.exports = Ludo;