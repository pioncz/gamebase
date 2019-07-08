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
};

const getNextPlayerId = (playerIds, playerId) =>
  playerIds[(playerIds.indexOf(playerId) + 1) % playerIds.length];

const Disconnected = (playerId) => {
  return {type: ActionTypes.Disconnected, playerId,};
};

const FinishGame = (winnerId) => {
  return {type: ActionTypes.FinishGame, winnerId,};
};

const Game = {
  Actions: {
    Disconnected,
    FinishGame,
  },
  GameStates,
  Utils: {
    getNextPlayerId,
  },
};

module.exports = Game;