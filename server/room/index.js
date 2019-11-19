const Games = require('./../../games/Games.js');
const Game = require('./../../games/game');
const _Logger = require('./../Logger');
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
    this.colors = options.colors;
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
    this.gameState.roomState = RoomStates.pickColors;
    this.gameState.playerColors = [];
    this.gameState.colorsQueue = [];

    this.colors.forEach((color, i) => {
      this.gameState.colorsQueue.push({
        color: color,
        selected: i > 5 ? true : false,
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
    this.gameState.rolled = true;
    this.gameState.finishTimestamp = Date.now() + game.Config.GameLength;
    let startGameAction = game.Actions.StartGame(this.gameState),
      waitForPlayer = game.Actions.WaitForPlayer(this.gameState, game.ActionTypes.Roll);

    returnActions.push({action: startGameAction,});
    returnActions.push({
      action: waitForPlayer,
      timestamp: Date.now() + game.AnimationLengths.startGameBase,
      callback: () => {
        let returnActions = [];

        this.gameState.rolled = false;
        this.gameState.roundTimestamp = Date.now() + game.Config.RoundLength;

        returnActions.push({action: game.Actions.RestartProgress(),});
        return returnActions;
      },
    });

    return returnActions;
  }
  playerDisconnected(playerId) {
    const gameState = this.gameState;
    const game = Games[gameState.gameName];
    const player = gameState.players.find(player => player.id === playerId);

    if (player) {
      player.disconnected = true;
    }

    const connectedPlayers = gameState.players.filter(player => !player.disconnected);
    const playerIndex = gameState.players.findIndex(player => player.id === playerId);
    const spawnFields = gameState.pawns && game.BoardUtils.getEmptySpawnFields(gameState.pawns, playerIndex);
    const playerPawns = gameState.pawns && gameState.pawns.filter(pawn =>
      pawn.playerId === player.id &&
      game.BoardUtils.getFieldByPosition(pawn.x, pawn.z).type !== game.BoardUtils.FieldTypes.spawn
    );
    let returnActions = [];

    // set winner if there's only 1 player left
    if (connectedPlayers.length === 1) {
      gameState.winnerId = connectedPlayers[0].id;
      gameState.roomState = Game.GameStates.finished;
      returnActions.push({action: game.Actions.FinishGame(gameState.winnerId),})
      // if there is no winner, move player pawns to spawn
    } else if (playerPawns && connectedPlayers.length) {
    // for every player pawn which is not in goal
      for(let i = 0; i < playerPawns.length; i++) {
        let pawn = playerPawns[i],
          field = spawnFields[i];

        if (field) {
          pawn.x = field.x;
          pawn.z = field.z;

          returnActions.push({action: Game.Actions.MovePawn(pawn.id, [{x: field.x, z: field.z,},]),});
        }
      }
      // switch player if disconnected current
      if(gameState.currentPlayerId === player.id) {
        gameState.currentPlayerId = Game.Utils.getNextPlayerId(gameState.players, gameState.currentPlayerId);
        gameState.selectedPawns = [];
        gameState.rolled = false;
        returnActions.push({
          action: game.Actions.WaitForPlayer(gameState, game.ActionTypes.Roll),
        });
      }
    }

    // append Disconnected action to returnActions
    returnActions.push({action: Game.Actions.Disconnected(playerId),});

    return returnActions;
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

    // not every player picked color and passed time for that
    if (roomState === RoomStates.pickColors &&
      (this.gameState.playerColors.length < this.gameState.players.length &&
      (selectedColorsByPlayers.length + bots.length >= this.minPlayers ||
      this.pickColorsTimestamp + game.Config.SelectColorLength < now))) {
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

    // every player picked color
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