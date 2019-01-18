const Games = require('./../games/Games.js');

/**
 * Enum representing room states.
 *
 * @enum
 */
const RoomStates = {
  queue: 'queue',
  pickColors: 'pickColors',
  game: 'game',
  finished: 'finished',
};

/**
 * Room class
 *
 */
class Room {
  constructor(options) {
    this.id = options.id;
    this.config = options.config;
    this.name = '/room' + options.id;
    this.gameName = options.gameName;
    this.rolled = options.rolled;
    this.gameState = {
      id: options.id,
      winnerId: null,
      roomState: RoomStates.queue,
      finishTimestamp: null,
      rolled: false,
      diceNumber: 0,
      queueColors: [],
      playerIds: [],
      players: [],
      selectedPawns: [],
      currentPlayerId: null,
      actionExpirationTimestamp: null,
    };
    this.eta = options.eta || 5*60*60; //18000s
    this.actions = [];
  }
  /**
   * Returns this.state
   */
  getState() {
    const gameState = this.gameState;

    let returnState = {
      currentPlayerId: gameState.currentPlayerId,
      winnerId: gameState.winnerId,
      roomState: gameState.roomState,
      finishTimestamp: gameState.finishTimestamp,
    };

    gameState.playerColors && (returnState.playerColors = gameState.playerColors);
    gameState.colorsQueue && (returnState.colorsQueue = gameState.colorsQueue);
    gameState.pawns && (returnState.pawns = gameState.pawns);
    gameState.players && (returnState.players = gameState.players);

    return gameState;
  }
  getActivePlayers() {
    const players = this.gameState.players;
    return players.filter(player => !player.disconnected);
  }
  startGame() {
    this.gameState.roomState = RoomStates.pickColors;
    this.gameState.playerColors = [];
    this.gameState.colorsQueue = [];
    this.config.ludo.colors.forEach(color => {
      this.gameState.colorsQueue.push({
        color: color,
        selected: false,
      });
    });
  }
  handleAction(action, player) {
    let actionHandler = Games.Ludo.ActionHandlers[action.type],
      returnActions = [];

    try {
      returnActions = (actionHandler && actionHandler(action, player, this.gameState));
    } catch(e) {
      console.error(e);
    }

    return returnActions;
  }
}

module.exports = { Room, RoomStates };