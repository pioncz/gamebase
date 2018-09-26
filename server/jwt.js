const config = require('./config.js');
const expressJwt = require('express-jwt');
const playerService = require('./players/player.service');

module.exports = jwt;

function jwt() {
  const secret = config.server.jwtSecret;
  
  return expressJwt({ secret, isRevoked }).unless({
    path: [
      // public routes that don't require authentication
      '/players/authenticate',
      '/players/register'
    ]
  });
}

async function isRevoked(req, payload, done) {
  const player = await playerService.getById(payload.sub);
  
  // revoke token if user no longer exists
  if (!player) {
    return done(null, true);
  }
  
  done();
};