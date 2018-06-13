/**
 * Enum representing room states.
 *
 * @enum
 */
const RoomStates = {
  queue: 'queue',
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
    this.name = options.name;
    this.gameName = options.gameName;
    this.playerIds = options.playerIds;
    
    this.rolled = options.rolled;
    this.state = {
      currentPlayerId: null,
      winnerId: null,
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
  
  }
}

module.exports = Room;