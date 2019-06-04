const Player = require('./Player.js');
const Connection = require('./Connection.js');
const { Room, RoomStates, } = require('./Room.js');
const Games = require('../games/Games.js');
const ActionsStream = require('./actions-stream');
const BotsManager = require('./bots-manager');

const _nextId = (() => {
  let lastId = 0;

  return () => {
    return ''+(lastId++);
  };
})();

const RoomTimeout = 3000;

/**
 * Represents a conntector between io and WebsocketServer.
 * Validates api options.
 *
 * Emits:
 *   `console` - server sends log messages
 *   `roomUpdate` - sends current room state
 *   `gameUpdate` - sends current game state
 *   `socketError` - sends various errors when action could not be completed
 *    { code: Number, message: String }
 *     code 1 - room doesnt exist
 *  Receives:
 *   `console` - server receives log messages
 *   `findRoom` - with options {gameName: {String}}
 *   `doAction` -
 *   `leaveGame` -
 *
 * @constructor
 * @param {object} io - io instance
 * @param {object} config - Config json
 */
class WebsocketServer {
  constructor (io, playerService, config) {
    this.connections = {}, // [socket.id]: {roomId, playerId}
    this.rooms = {};
    this.players = {};
    this.actionsStream = new ActionsStream();
    this.io = io;
    this.botsManager = new BotsManager({
      totalBots: 1,
      roomTimeout: RoomTimeout,
    });

    let _log = (msg) => {
        const prefix = ['[ws]: ',];
        console.log(Array.isArray(msg) ? [prefix,].concat(msg) : prefix + msg);
      },
      _getTotalNumPlayers = () => {
        let clients = io.sockets.clients().connected;
        return Object.keys(clients).length
      },
      _emitRoomState = (room, socket) => {
        if (socket) {
          socket.emit('roomUpdate', room.gameState);
        } else {
          io.to(room.name).emit('roomUpdate', room.gameState);
        }
      },
      _emitError = (room, socket, error) => {
        if (socket) {
          socket.emit('socketError', error);
        } else {
          io.to(room.name).emit('socketError', error);
        }
      },
      _emitNewActions = (room, newActions) => {
        newActions.forEach(action => {
          _log(`newAction emitted: ${action.type}`);
          _log(JSON.stringify(action));
          io.to(room.name).emit('newAction', action);
        });
      },
      // set connected connections roomIds to null, delete room
      _leaveGame = (socketId) => {
        let connection = this.connections[socketId],
          roomId = connection && connection.roomId,
          room = roomId && this.rooms[roomId],
          playerId = connection && connection.playerId,
          playerIndex = room && room.gameState.players.findIndex(player => player.id === playerId),
          player = room && room.gameState.players[playerIndex];

        if (!room || !player) {
          console.log('no room or player');
          return;
        }

        connection.roomId = null;

        let disconnectedAction = Games[room.gameState.gameName].Actions.Disconnected(player.id),
          streamActions = Games[room.gameState.gameName].ActionHandlers.Disconnected(disconnectedAction, player, room),
          returnActions = streamActions.map(streamAction => streamAction.action);

        _emitNewActions(room, returnActions);

        // if there's winnerId remove room
        if (!room.gameState.playerIds.length || room.gameState.roomState === RoomStates.finished) {
          this.closeRoom(room.id);
        }
      },
      // Leave connections room, remove connections player, remove from connections
      _destroyConnection = (socketId) => {
        let connection = this.connections[socketId],
          player = connection.playerId && this.players[connection.playerId];

        if (!connection) return;

        if (connection.roomId) {
          _leaveGame(socketId);
        }

        if (player) {
          _log(`player ${player.login} disconnected`);
          delete this.players[connection.playerId];
        }

        delete this.connections[socketId];
      },
      _createRoom = (gameName) => {
        let id = _nextId(),
          room = new Room({
            id: id,
            config: config,
            gameName: gameName,
            queueTimestamp: Date.now(),
          });

        return room;
      },
      _findRoom = (gameName) => {
        const minPlayers = Games[gameName].Config.MinPlayer;
        const matchingRooms = Object.keys(this.rooms).reduce((returnRooms, roomId) => {
          const room = this.rooms[roomId];

          if (room.gameState.gameName === gameName &&
            room.gameState.players.length < minPlayers) {
            return returnRooms.concat(room);
          }

          return returnRooms;
        }, []);

        return matchingRooms.length && matchingRooms[0];
      };

    // Io handlers
    const _handleDisconnect = socket => () => {
      _destroyConnection(socket.id);
    };
    const _handleLeaveGame = socket => () => {
      _leaveGame(socket.id);
    };
    const _handleFindRoom = socket => options => {
      let gameName = options.game,
        room,
        connection = this.connections[socket.id],
        player = connection.playerId && this.players[connection.playerId];

      _log(`player ${player.login} requests findRoom`);

      if (!gameName) {
        _log('Invalid data, cannot find room.');
        return;
      }

      if (connection.roomId) {
        _log('user ' + player.login + ' already in queue or game');
        return;
      }

      room = _findRoom(gameName);
      if (!room) {
        _log('create new room');
        room = _createRoom(gameName);
        this.rooms[room.id] = room;
      }
      connection.roomId = room.id;
      room.gameState.playerIds.push(player.id);
      room.gameState.players.push(player);
      socket.join(room.name);
      player.roomId = room.id;

      console.log(`player ${player.login} joins queue(${room.gameState.playerIds.length}/${minPlayers}) in ${room.name}`);
      _emitRoomState(room);
    };
    const _handleCallAction = socket => action => {
      if (!action || !action.type) {
        _log('Invalid action');
        return;
      }

      let connection = this.connections[socket.id],
        player = connection.playerId && this.players[connection.playerId],
        room = connection.roomId && this.rooms[connection.roomId];

      if (!connection || !player || !room) {
        _log('player is not in a room.');
        return;
      }

      if (room.gameState.actionExpirationTimestamp && (Date.now() > room.gameState.actionExpirationTimestamp)) {
        _log(`time has expired for this action`);
        return;
      }

      _log(`Player: ${player.login} calls action: ${JSON.stringify(action)}`);

      let streamActions = room.handleAction(action, player) || [];

      room.actions = room.actions.concat(streamActions);
      this.emitRoomActions(room.name, streamActions);

      if (!room.gameState.playerIds.length || room.gameState.roomState === RoomStates.finished) {
        this.closeRoom(room.id);
      }
    };
    const _handleGetStats = socket => () => {
      let roomsFiltered = {};
      for (let roomId in this.rooms) {
        roomsFiltered[roomId] = this.rooms[roomId];
      }
      socket.emit('statsUpdate', {
        connections: this.connections,
        rooms: roomsFiltered,
        players: this.players,
        bots: this.botsManager.bots,
      });
    };
    // jezeli gracz jest w tym pokoju, wyslij mu stan pokoju
    // jezeli gracz jest w innym pokoju, dodaj go jako spectatora
    // jezeli pokoj nie istnieje to wyslij error
    const _handleJoinRoom = socket => (options) => {
      let connection = this.connections[socket.id],
        player = connection.playerId && this.players[connection.playerId],
        room = connection.roomId && this.rooms[connection.roomId];
      const { roomId, } = options;

      if (!connection || !player) {
        _log('Failed to join room. No connection or player.');
        return;
      }

      if (!roomId) {
        _log('Cannot join room without roomId');
      }

      if (room) {
        if (room.id === roomId) {
          _log('Player tried to join same room second time, roomState emitted');
          _emitRoomState(room);
        } else {
          room.gameState.spectatorIds.push(player.id);
          _emitRoomState(room);
        }
      } else {
        _emitError(null, socket, {code: 1, message: 'room doesn\'t exist',});
      }

    };

    // Authorization
    io.use((socket, next) => {
      let regex = /token=([^;]*)/g,
        cookie = socket.request.headers.cookie,
        match = cookie && cookie.match(regex),
        str = match && match[0],
        token = str && str.slice(str.indexOf('=') + 1, str.length),
        connection = this.connections[socket.id];

      if (!connection) {
        this.connections[socket.id] = new Connection({
          playerId: null,
          roomId: null,
        });
        connection = this.connections[socket.id];
      }

      const updatePlayer = (player) => {
        if (this.players[player.id]) { return; }
        player.socketId = socket.id;
        this.players[player.id] = player;
        connection.playerId = player.id;
        next();
      };
      const createTempPlayer = () => {
        const nextId = _nextId();
        const tempPlayer = new Player({
          id : nextId,
          temporary: true,
          login: `Name ${nextId}`,
          socketId: socket.id,
          avatar: `/static/avatar${Math.floor(Math.random()*6)+1}.jpg`,
        });
        updatePlayer(tempPlayer);
        return tempPlayer;
      };

      if (token) {
        const playerPromise = playerService.verify({token,});

        playerPromise
          .then(playerId => {
            return playerService.getById(playerId)
              .then(player => {
                updatePlayer(player);
              }, createTempPlayer);
          })
          .catch(createTempPlayer);
      } else {
        createTempPlayer();
      }
    });

    io.on('connection', (socket) => {
      const player = this.players[this.connections[socket.id].playerId];
      _log(`New connection {sockeId: ${socket.id}, legin: ${player.login}, temp: ${player.temporary}}. currently ${_getTotalNumPlayers()} online.`);

      socket.emit('playerUpdate', player);

      socket.on('disconnect', _handleDisconnect(socket));

      socket.on('leaveGame', _handleLeaveGame(socket));

      socket.on('findRoom', _handleFindRoom(socket));

      socket.on('callAction', _handleCallAction(socket));

      socket.on('getStats', _handleGetStats(socket));

      socket.on('joinRoom', _handleJoinRoom(socket));
    });

    this.update = this.update.bind(this);
    setInterval(this.update.bind(this), 60);
  }
  // Runs to:
  // update action stream
  // finish game if time is up,
  // remove empty rooms,
  // reset room search if it takes too long,
  update() {
    this.actionsStream.update();

    const now = Date.now();
    for (let roomIndex in this.rooms) {
      const room = this.rooms[roomIndex];
      this.botsManager.updateQueue(now, room);
      this.botsManager.updateRoom(now, room);
      const streamActions = room.handleUpdate(now);

      this.emitRoomActions(room.name, streamActions);

      if (!room.gameState.playerIds.length || room.gameState.roomState === RoomStates.finished) {
        this.closeRoom(room.id);
      }
    }
  }
  closeRoom(roomId) {
    const room = this.rooms[roomId];

    if (!room) return;

    const socketIds = room.gameState.players.map(player => player.socketId);
    for (let i = 0; i < socketIds.length; i++) {
      const socketId = socketIds[i];

      this.connections[socketId].roomId = null;
    }

    delete this.rooms[roomId];
  }
  emitRoomActions(roomName, streamActions) {
    if (!roomName || !streamActions) return;
    let room;

    for (const roomId in this.rooms) {
      if (this.rooms.hasOwnProperty(roomId) && this.rooms[roomId].name === roomName) {
        room = this.rooms[roomId];
      }
    }
    if (!room) return;

    for(let i = 0; i < streamActions.length; i++) {
      const { timestamp, callback, action, } = streamActions[i];
      this.actionsStream.addAction(() => {
        let callbackActions = (callback && callback()) || [];

        room.actions = room.actions.concat(callbackActions);
        this.emitRoomActions(roomName, callbackActions);

        this.io.to(roomName).emit('newAction', action);
      }, timestamp);
    }
  }
}

module.exports = WebsocketServer;