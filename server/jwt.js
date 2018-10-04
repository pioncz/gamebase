const config = require('./config.js');
const expressJwt = require('express-jwt');
const playerService = require('./players/player.service');

module.exports = jwt;

function jwt() {
  const secret = config.server.jwtSecret;
  
  return expressJwt({ 
    secret, 
    isRevoked,
    getToken: (req) => {
      const { token } = req.cookies;
      
      return token;
    },
    credentialsRequired: false });
}

async function isRevoked(req, payload, done) {
  const player = await playerService.getById(payload.sub);

  // revoke token if user no longer exists
  if (!player) {
    return done(null, true);
  }
  
  done();
};