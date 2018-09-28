const config = require('./config.js');
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.connect(config.server.mongooseConnectionString, { useNewUrlParser: true });
mongoose.Promise = global.Promise;

module.exports = {
  Player: require('./players/player.model.js')
};