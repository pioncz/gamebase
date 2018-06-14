const InitialState = require('./../ludo/InitialState.js');

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
    this.state = {
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
    return this.state;
  }
  startGame() {
    this.state.roomState = RoomStates.pickColors;
    this.state.playerColors = [];
    this.state.colorsQueue = [];
    this.config.ludo.colors.forEach(color => {
      this.state.colorsQueue.push({
        color: color,
        selected: false,
      });
    });
    
    // let initialState = new InitialState();
    // this.state.pawns = initialState.pawns;
  }
  handleAction(action) {
    let returnAction;
    
    switch(action.name) {
      case 'pickColor':
        break;
      default:
        console.log('x');
    }
    
    return returnAction;
  }
}

module.exports = Room;