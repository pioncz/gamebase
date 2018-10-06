const config = require('./../config.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./../db.js');
const Player = db.Player;

module.exports = {
  authenticate,
  getAll,
  getById,
  create,
  update,
  delete: _delete
};

async function authenticate({ email, password }) {
  const player = await Player.findOne({ email });
  if (player && bcrypt.compareSync(password, player.hash)) {
    const { hash, ...playerWithoutHash } = player.toObject();
    const token = jwt.sign({ playerId: player.id }, config.server.jwtSecret);
    return {
      ...playerWithoutHash,
      token
    };
  }
}

async function getAll() {
  return await Player.find().select('-hash');
}

async function getById(id) {
  return await Player.findById(id).select('-hash');
}

async function create(playerParam) {
  // validate
  if (await Player.findOne({ email: playerParam.email })) {
    throw 'Email "' + playerParam.email + '" is already taken';
  }
  if (await Player.findOne({ login: playerParam.login })) {
    throw 'Login "' + playerParam.login + '" is already taken';
  }
  playerParam.avatar = '/static/avatar' + parseInt(Math.random() * 6 + 1)+ '.jpg';
  const player = new Player(playerParam);
  
  // hash password
  if (playerParam.password) {
    player.hash = bcrypt.hashSync(playerParam.password, 10);
  }
  
  const token = jwt.sign({ playerId: player.id }, config.server.jwtSecret);
  // save user
  await player.save();
  
  const { hash, ...playerWithoutHash } = player.toObject();
  return {
    ...playerWithoutHash,
    token
  };
}

async function update(id, playerParam) {
  const player = await Player.findById(id);
  
  // validate
  if (!player) throw 'User not found';
  if (player.username !== playerParam.username && await Player.findOne({ username: playerParam.username })) {
    throw 'Username "' + playerParam.username + '" is already taken';
  }
  
  // hash password if it was entered
  if (playerParam.password) {
    playerParam.hash = bcrypt.hashSync(playerParam.password, 10);
  }
  
  // copy userParam properties to user
  Object.assign(player, playerParam);
  
  await player.save();
}

async function _delete(id) {
  await Player.findByIdAndRemove(id);
}