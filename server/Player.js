class Player {
  constructor({id, email, login, diceId, color, socketId, roomId, avatar, gameState, temporary = false,}) {
    this.id = id;
    this.login = login;
    this.email = email;
    this.color = color;
    this.socketId = socketId;
    this.roomId = roomId;
    this.avatar = avatar;
    this.diceId = diceId;
    this.temporary = temporary;
    this.gameState = gameState;
    this.lastRoll = null;
    this.previousRoll = null;
  }
}

module.exports=Player;