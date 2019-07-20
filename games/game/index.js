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

const ActionTypes = {
  FinishGame: 'FinishGame',
  Disconnected: 'Disconnected',
  MovePawn: 'MovePawn',
};

const getNextPlayerId = (players, playerId) => {
  let returnId;
  let i = 1;

  while(!returnId || (i > players.length + 1)) {
    const nextPlayer = players[(players.findIndex(player => player.id === playerId) + i) % players.length];

    if (!nextPlayer.disconnected) {
      returnId = nextPlayer.id;
    }
    i++;
  }

  return returnId;
}

const Disconnected = (playerId) => {
  return {type: ActionTypes.Disconnected, playerId,};
};

const FinishGame = (winnerId) => {
  return {type: ActionTypes.FinishGame, winnerId,};
};

const MovePawn = (pawnId, fieldSequence) => {
  return {type: ActionTypes.MovePawn, pawnId, fieldSequence,};
};

const Game = {
  Actions: {
    Disconnected,
    FinishGame,
    MovePawn,
  },
  ActionTypes,
  GameStates,
  Utils: {
    getNextPlayerId,
  },
};

module.exports = Game;