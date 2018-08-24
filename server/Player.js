module.exports = function (options) {
  return {
    id: options.id,
    name: options.name,
    color: options.color || null,
    socketId: options.socketId || null,
    roomId: options.roomId || null,
    avatar: '/static/avatar' + parseInt(Math.random() * 6 + 1)+ '.jpg',
  };
};