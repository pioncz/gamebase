const Game = require('./game/index.js');
const Ludo = require('./ludo/index.js');
const Kira = require('./kira/index.js');

/**
 * Class which provides all games api
 */
const Games  = {
  Game,
  Ludo,
  Kira,
};

module.exports = Games;