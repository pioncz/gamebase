const config = require('./config.js');
const expressJwt = require('express-jwt');
const playerService = require('./players/player.service');

async function isRevoked(req, payload, done) {
  const player = await playerService.getById(payload.playerId);
  // revoke token if user no longer exists
  if (!player) {
    console.error('Player token revoked - user no longer exists.')
    return done(null, true);
  }

  done();
};

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

module.exports = jwt;