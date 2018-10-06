module.exports = function ({id, email, login, diceType, color, socketId, roomId, avatar, gameState, temporary = false }) {
  return {
    id,
    login,
    email,
    color,
    socketId,
    roomId,
    avatar,
    diceType: null,
    lastRoll: null,
    previousRoll: null,
    temporary,
    gameState: gameState,
  };
};