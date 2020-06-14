const Game = require('./game/index.js');
const Ludo = require('./ludo/index.js');
const Ludo2 = require('./ludo2/index.js');
const Kira = require('./kira/index.js');

/**
 * Class which provides all games api
 */
const Games  = {
  Game,
  Ludo,
  Ludo2,
  Kira,
};

module.exports = Games;