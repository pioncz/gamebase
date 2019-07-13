const Games = require('./../games/Games.js');
const Game = require('./../games/game');
const _Logger = require('./Logger');
const Logger = new _Logger({className: 'Room',});
const _log = Logger.log;
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
    this.botSelectColorTimeout = options.botSelectColorTimeout;
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
      playerColors: [],
      spectatorIds: [],
      selectedPawns: [],
      currentPlayerId: null,
    };
    this.minPlayers = +options.minPlayers || 4;
    this.eta = options.eta || 5*60*60; //18000s
    this.actions = [];
  }
  addPlayer(player) {
    const { players, playerIds, } = this.gameState;

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
    _log('picking colors in room ' + this.name);
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
  startGame() {
    _log('game started in ' + this.name);

    const returnActions = [];
    const bots = this.getBots();
    const game = Games[this.gameState.gameName];

    let initialState = game.InitialState(); // {Pawns}

    this.gameState.roomState = Game.GameStates.game;
    delete this.gameState.colorsQueue;

    this.gameState.pawns = initialState.pawns;
    // Connect pawns and players
    this.gameState.playerIds.forEach((playerId, i) => {
      let playerColor = this.gameState.playerColors.find(playerColor => playerColor.playerId === playerId);

      for(let j = 0; j < 4; j++) {
        initialState.pawns[(i * 4 + j)].playerId = playerColor.playerId;
        initialState.pawns[(i * 4 + j)].color = playerColor.color;
      }
    });
    // Remove pawns for extra players
    initialState.pawns.splice(this.gameState.playerIds.length * 4, (4 - this.gameState.playerIds.length) * 4);

    this.gameState.currentPlayerId = this.gameState.playerIds[0];
    this.gameState.finishTimestamp = Date.now() + game.Config.GameLength;
    this.gameState.roundTimestamp = Date.now() + game.Config.RoundLength;
    let startGameAction = game.Actions.StartGame(this.gameState),
      waitForPlayer = game.Actions.WaitForPlayer(this.gameState, game.ActionTypes.Roll);

    returnActions.push({action: startGameAction,});
    returnActions.push({
      action: waitForPlayer,
      timestamp: Date.now() + 1000,
      callback: () => {
        this.gameState.rolled = false;
      },
    });

    return returnActions;
  }
  playerDisconnected(playerId) {
    const gameState = this.gameState;
    const player = gameState.players.find(player => player.id === playerId);

    if (player) {
      const playerIndex = this.gameState.playerIds.indexOf(player.id);
      if (playerIndex > -1) {
        this.gameState.playerIds.splice(playerIndex, 1);
      }
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
    const minPlayers = this.minPlayers;
    const bots = this.getBots();
    let returnActions = [];

    const selectedColorsByPlayers = this.gameState.playerColors.filter(playerColor =>
      this.gameState.players.find(player => player.id === playerColor.playerId)
    );

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
      this.pickColorsTimestamp = now;
      returnActions = returnActions.concat(game.ActionHandlers.PickColors(this.gameState));
    }

    // Add autoSelectColors if:
    // its pickColorsState and
    //  not all players selected color and
    //    all players not disconnected selected colors or
    //    timestamp passed
    if (roomState === RoomStates.pickColors &&
      (this.gameState.playerColors.length < this.gameState.players.length &&
      (selectedColorsByPlayers.length + bots.length >= this.minPlayers ||
      this.pickColorsTimestamp + this.botSelectColorTimeout < now))) {
      const playersWithoutColor = this.gameState.players.filter(player =>
        !this.gameState.playerColors.find(playerColor =>
          player.id === playerColor.playerId
        )
      );
      // Take random player to pick color
      const playerToPickColor = playersWithoutColor[parseInt(Math.random() * playersWithoutColor.length)];
      if (playerToPickColor) {
        const freeColors = this.gameState.colorsQueue.filter(color => !color.selected);
        const freeColor = freeColors[parseInt(Math.random() * freeColors.length)];
        freeColor.selected = true;
        playerToPickColor.color = freeColor.color;
        this.gameState.playerColors.push({playerId: playerToPickColor.id, color: freeColor.color,});
      }
    }

    if (roomState === RoomStates.pickColors &&
      this.gameState.playerColors.length >= minPlayers) {
      returnActions = returnActions.concat(this.startGame());
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