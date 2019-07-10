const Games = require('./../games/Games.js');
const Game = require('./../games/game');

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
    if (options.id !== 0 && !options.id) throw new Error('Room constructor requires id');
    this.id = options.id;
    this.name = '/room' + options.id;
    this.rolled = options.rolled;
    this.queueTimestamp = options.queueTimestamp;
    this.gameState = {
      id: options.id,
      winnerId: null,
      gameName: options.gameName,
      roomState: RoomStates.queue,
      finishTimestamp: null,
      roundTimestamp: null,
      rolled: false,
      diceNumber: 0,
      queueColors: options.queueColors,
      playerIds: [],
      players: [],
      spectatorIds: [],
      selectedPawns: [],
      currentPlayerId: null,
    };
    this.eta = options.eta || 5*60*60; //18000s
    this.actions = [];
  }
  addPlayer(player) {
    const { players, playerIds, gameName, } = this.gameState;

    players.push(player);
    playerIds.push(player.id);
    player.roomId = this.id;
  }
  getActivePlayers() {
    const players = this.gameState.players;
    return players.filter(player => !player.disconnected && !player.bot);
  }
  getBots() {
    return this.gameState.players.filter(player => player.bot);
  }
  pickColors() {
    console.log('game started in room: ' + this.name);
    const game = Games[this.gameState.gameName];
    this.gameState.roomState = RoomStates.pickColors;
    this.gameState.playerColors = [];
    this.gameState.colorsQueue = [];

    game.Config.Colors.forEach(color => {
      this.gameState.colorsQueue.push({
        color: color,
        selected: false,
      });
    });
  }
  playerDisconnected(playerId) {
    const gameState = this.gameState;
    const player = gameState.players.find(player => player.id === playerId);

    if (player) {
      const playerIndex = this.gameState.playerIds.indexOf(player.id);
      if (playerIndex > -1) {
        this.gameState.playerIds.splice(playerIndex, 1);
      }

      // mark player as disconnected
      player.disconnected = true;
    }
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
    const { gameName, roundTimestamp, finishTimestamp,roomState, playerIds,} = this.gameState;
    const game = Games[gameName];
    const minPlayers = game.Config.MinPlayer;
    let returnActions = [];

    // room is out of time
    if (finishTimestamp && now > finishTimestamp) {
      let returnActions = [];

      try {
        returnActions = game.ActionHandlers.Timeout(this.gameState);
      } catch(e) {
        console.error(e.message ? e.message : e);
      }

      return returnActions;
    }

    // room is queued and there are enough players
    if (roomState === RoomStates.queue &&
      playerIds.length >= minPlayers) {
      this.pickColors();
      returnActions = returnActions.concat(game.ActionHandlers.PickColors(this.gameState));
    }

    if (roundTimestamp && now > roundTimestamp) {
      try {
        returnActions = returnActions.concat(game.ActionHandlers.RoundEnd(this.gameState));
      } catch(e) {
        console.error(e.message ? e.message : e);
      }
    }

    return returnActions;
  }
}

module.exports = { Room, RoomStates, };