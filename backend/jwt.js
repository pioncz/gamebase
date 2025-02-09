import config from './config.js';
import { expressjwt } from 'express-jwt';
import playerService from './players/player.service.js';

async function isRevoked(req, payload, done) {
  const player = await playerService.getById(payload.playerId);
  // revoke token if user no longer exists
  if (!player) {
    console.error('Player token revoked - user no longer exists.');
    return done(null, true);
  }

  done();
}

function jwt() {
  const secret = config.jwtSecret;

  return expressjwt({
    secret,
    isRevoked,
    getToken: (req) => {
      const { token } = req.cookies;

      return token;
    },
    credentialsRequired: false,
    algorithms: ['HS256'],
  });
}

export default jwt;
