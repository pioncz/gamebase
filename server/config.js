var configFile;

if (process.env.NODE_ENV === 'production') {
  configFile = './../config/production.json';
} else {
  configFile = './../config/develop.json';
}

var config = require(configFile);

module.exports = config;