module.exports = function (options) {
  return {
    id: options.id,
    name: options.name,
    color: options.color || null,
    socket: options.socket || null,
    room: options.room || null,
    avatar: '/static/avatar' + parseInt(Math.random() * 6 + 1)+ '.jpg',
  };
};