const Games = require('./../../games/Games.js');
const Bot = require('./bot.js');

let _log = (msg) => {
  const prefix = ['[bots-manager]: ',];
  console.log(Array.isArray(msg) ? [prefix,].concat(msg) : prefix + msg);
};

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
      _log(`Bot: ${freeBots[0].login} joins room ${room.name}`);
      room.addPlayer(freeBots[0]);
    }
  }
  // Check if room is waiting for player too long
  // and handle bots actions
  updateRoom(now, room) {
    let returnActions = [];
    if (room.gameState.roomState === 'game') {
      const currentPlayer = room.gameState.players.find(player => player.id === room.gameState.currentPlayerId);
      const game = Games[room.gameState.gameName];
      if (currentPlayer.bot) {
        if (room.gameState.rolled && room.gameState.selectedPawns.length) {
          const moves = game.BoardUtils.checkMoves(room.gameState, room.gameState.diceNumber, currentPlayer.id);
          if (moves.length) {
            returnActions = returnActions.concat(room.handleAction(game.Actions.PickPawn(moves[parseInt(Math.random() * moves.length)].pawnId), currentPlayer));
          }
        } else if (!room.gameState.rolled) {
          returnActions = returnActions.concat(room.handleAction(game.Actions.Roll(), currentPlayer));
        }
      }
    }
    returnActions.forEach(action => {
      _log(`Bot:  calls action: ${JSON.stringify(action)}`);
    });
    return returnActions;
  }
}

module.exports=BotsManager;