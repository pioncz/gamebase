import Bot from './bot.js';
import Logger from './../Logger.js';

const logger = new Logger({
  className: 'bots-manager',
});
const _log = logger.log;

class BotsManager {
  // Create bots
  constructor({ totalBots, roomQueueTimeout, randomDelays }) {
    this.bots = [];
    this.roomQueueTimeout = roomQueueTimeout;
    this.randomDelays = randomDelays;

    for (let i = 0; i < totalBots; i++) {
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
    const freeBots = this.bots.filter((bot) => !bot.roomId);

    if (!freeBots.length) return;

    // Bots joins queued room if this.roomQueueTimeout passed
    if (
      room.gameState.roomState === 'queue' &&
      room.queueTimestamp + this.roomQueueTimeout < now &&
      room.gameState.playerIds.length < room.minPlayers
    ) {
      _log(`Bot: ${freeBots[0].login} joins room ${room.name}`);
      room.addPlayer(freeBots[0]);
    }
  }
}

export default BotsManager;
