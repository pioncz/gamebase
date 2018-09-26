const config = require('./config.js');
const mongoose = require('mongoose');
mongoose.connect(config.server.mongooseConnectionString);
mongoose.Promise = global.Promise;

module.exports = {
  Player: require('./players/player.model.js')
};