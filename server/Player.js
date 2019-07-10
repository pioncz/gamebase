module.exports = function ({id, email, login, diceId, color, socketId, roomId, avatar, gameState, temporary = false, }) {
  return {
    id,
    login,
    email,
    color,
    socketId,
    roomId,
    avatar,
    diceId,
    lastRoll: null,
    previousRoll: null,
    temporary,
    gameState: gameState,
  };
};