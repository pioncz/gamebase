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
    this.rolled = options.rolled;
    this.gameState = {
      id: options.id,
      winnerId: null,
      gameName: options.gameName,
      roomState: RoomStates.queue,
      finishTimestamp: null,
      roundTimestamp: null,
      rolled: false,
      diceNumber: 0,
      queueColors: [],
      playerIds: [],
      players: [],
      spectatorIds: [],
      selectedPawns: [],
      currentPlayerId: null,
      actionExpirationTimestamp: null,
    };
    this.eta = options.eta || 5*60*60; //18000s
    this.actions = [];
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
    let actionHandler = Games[this.gameState.gameName].ActionHandlers[action.type],
      returnActions = [];

    try {
      returnActions = (actionHandler && actionHandler(action, player, this.gameState));
    } catch(e) {
      console.error(e.message ? e.message : e);
    }

    return returnActions;
  }
  handleUpdate(now) {
    if (this.gameState.roundTimestamp && now > this.gameState.roundTimestamp) {
      let returnActions = [];

      try {
        returnActions = Games[this.gameState.gameName].ActionHandlers.RoundEnd(this.gameState);
      } catch(e) {
        console.error(e.message ? e.message : e);
      }

      return returnActions;
    }

    if (this.gameState.finishTimestamp && now > this.gameState.finishTimestamp) {
      let returnActions = [];

      try {
        returnActions = Games[this.gameState.gameName].ActionHandlers.Timeout(this.gameState);
      } catch(e) {
        console.error(e.message ? e.message : e);
      }

      return returnActions;
    }
  }
}

module.exports = { Room, RoomStates, };