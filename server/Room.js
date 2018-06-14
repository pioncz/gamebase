const InitialState = require('./../ludo/InitialState.js');
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
    this.playerIds = [];
    this.rolled = options.rolled;
    this.gameState = {
      currentPlayerId: null,
      winnerId: null,
      roomState: RoomStates.queue,
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
    };
  
    gameState.playerColors && (returnState.playerColors = gameState.playerColors);
    gameState.colorsQueue && (returnState.colorsQueue = gameState.colorsQueue);
    gameState.pawns && (returnState.pawns = gameState.pawns);
    this.players && (returnState.players = this.players);
    
    return returnState;
  }
  startGame(players) {
    this.players = players;
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
    let returnActions = [],
      actionHandler = Games.Ludo.ActionHandlers[action.type],
      roomState = this.getState(),
      handleAction = null;
      
    if (actionHandler) {
      handleAction = actionHandler(action, player, roomState);
  
      returnActions.push(handleAction);
      
      if (this.gameState.playerColors.length >= Games.Ludo.Config.MinPlayer) {
        this.gameState.roomState = RoomStates.game;
        delete this.gameState.colorsQueue;
        let initialState = new InitialState(); // [Pawns]
        
        this.gameState.pawns = initialState.pawns;
        this.players.forEach((player, index) => {
          player.color = this.gameState.playerColors.find(color => color.playerId === player.id).color;
          
          for(var i = 0; i < 4; i++) {
            initialState.pawns[(index * 4 + i)].playerIndex = index;
            initialState.pawns[(index * 4 + i)].playerId = player.id;
            initialState.pawns[(index * 4 + i)].color = player.color;
          }
        });
  
        // Remove pawns for extra players
        initialState.pawns.splice(this.players.length * 4, (4 - this.players.length) * 4);
  
        let roomState = this.getState(),
          startGameAction = Games.Ludo.ActionHandlers[Games.Ludo.ActionTypes.StartGame](roomState);
        returnActions.push(startGameAction);
      }
    }
    
    return returnActions;
  }
}

module.exports = Room;