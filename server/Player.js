module.exports = function ({id, email, login, diceType, color, socketId, roomId, avatar }) {
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
  };
};