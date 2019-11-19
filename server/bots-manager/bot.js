const Player = require('./../Player.js');
const Games = require('./../../games/Games.js');

let nextId = 1;

let _log = (msg) => {
  const prefix = ['[bots]: ',];
  console.log(Array.isArray(msg) ? [prefix,].concat(msg) : prefix + msg);
};

class Bot extends Player {
  constructor(randomDelays) {
    const id = 'bot ' + (nextId++);
    super({
      id,
      login: id,
      avatar: '/static/avatar1.jpg',
    });
    this.randomDelays = randomDelays;
    this.bot = true;
  }
  // returns stream action
  handleAction(room, action) {
    const game = Games[room.gameState.gameName];
    let streamActions = [];

    const addRandomDelays = (arr) => {
      const randomDelay = parseInt(Math.random() * (this.randomDelays[1] - this.randomDelays[0]) + this.randomDelays[0]);

      if (!arr) {
        return [];
      }

      for(let arrAction of arr) {
        arrAction.timestamp = action.timestamp + randomDelay;
      }

      return arr;
    };

    if (
      action.type === game.ActionTypes.WaitForPlayer &&
      action.playerId === this.id
    ) {
      if (action.expectedAction === game.ActionTypes.Roll) {
        streamActions = streamActions.concat(
          addRandomDelays(room.handleAction(game.Actions.Roll(), this)));
      } else if (action.expectedAction === game.ActionTypes.PickPawn) {
        const moves = game.BoardUtils.checkMoves(room.gameState, room.gameState.diceNumber, this.id);
        if (moves.length) {
          // check if is there any beating move
          let resultMove;

          for(let i = 0; i < moves.length; i++) {
            const move = moves[i];
            const lastField = move.fieldSequence[move.fieldSequence.length - 1];
            const lastFieldPawns = room.gameState.pawns.filter(pawn => (
              pawn.x === lastField.x &&
              pawn.z === lastField.z &&
              pawn.playerId !== this.id
            ));
            const lastFieldPawn = lastFieldPawns.length && lastFieldPawns[0];

            if (lastFieldPawn) {
              resultMove = moves[i];
              break;
            }
          }
          if (!resultMove) {
            resultMove = moves[parseInt(Math.random() * moves.length)];
          }
          streamActions = streamActions.concat(
            addRandomDelays(room.handleAction(game.Actions.PickPawn(resultMove.pawnId), this)));
        }
      }
    }

    for(let action of streamActions) {
      _log(`${this.login}: calls action: ${JSON.stringify(action)}`);
    }

    return streamActions;
  }
}

module.exports=Bot;