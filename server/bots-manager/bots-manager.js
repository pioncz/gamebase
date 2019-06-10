const Games = require('./../../games/Games.js');
const Bot = require('./bot.js');

class BotsManager {
  // Create bots
  constructor({totalBots, roomTimeout,}) {
    this.bots = [];
    this.roomTimeout = roomTimeout;

    for(let i = 0; i < totalBots; i++) {
      this.bots.push(new Bot());
    }
  }
  updateQueue(now, room) {
    const minPlayers = Games[room.gameState.gameName].Config.MinPlayer;
    const freeBots = this.bots.filter(bot => !bot.roomId);

    if (!freeBots.length) return;

    if (room.gameState.roomState === 'queue' &&
        room.queueTimestamp + this.roomTimeout < now &&
        room.gameState.playerIds.length < minPlayers) {
      console.log('flood room with bots');
      room.addPlayer(freeBots[0]);
    }
  }
  // Check if room is waiting for player too long
  // and handle bots actions
  updateRoom(now, room) {
    const minPlayers = Games[room.gameState.gameName].Config.MinPlayer;
    const freeBots = this.bots.filter(bot => !bot.roomId);

    // get bots from this room
    // check if room is waiting for bot move
    // handle pick colors
    // handle other actions
  }
}

module.exports=BotsManager;