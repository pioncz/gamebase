const Games = require('./../../games/Games.js');
const Bot = require('./bot.js');

let _log = (msg) => {
  const prefix = ['[bots-manager]: ',];
  console.log(Array.isArray(msg) ? [prefix,].concat(msg) : prefix + msg);
};

class BotsManager {
  // Create bots
  constructor({totalBots, roomQueueTimeout, randomDelays, }) {
    this.bots = [];
    this.roomQueueTimeout = roomQueueTimeout;
    this.randomDelays = randomDelays;

    for(let i = 0; i < totalBots; i++) {
      this.bots.push(new Bot(randomDelays));
    }
  }
  setRoomQueueTimeout(newTimeout) {
    let parsedTimeout = parseInt(newTimeout);
    if (!isNaN(parsedTimeout)) {
      this.roomQueueTimeout = parsedTimeout;
    }
  }
  updateQueue(now, room) {
    const freeBots = this.bots.filter(bot => !bot.roomId);

    if (!freeBots.length) return;

    // Bots joins queued room if this.roomQueueTimeout passed
    if (room.gameState.roomState === 'queue' &&
        room.queueTimestamp + this.roomQueueTimeout < now &&
        room.gameState.playerIds.length < room.minPlayers) {
      _log(`Bot: ${freeBots[0].login} joins room ${room.name}`);
      room.addPlayer(freeBots[0]);
    }
  }
}

module.exports=BotsManager;