const Player = require('./Player.js');
const Fields = require('./../games/ludo/Fields.js');
const Connection = require('./Connection.js');
const { Room } = require('./Room.js');
const Games = require('./../games/Games.js');

let fields = Fields;

const FieldType = {
  spawn: 'spawn',
  start: 'start',
  goal: 'goal',
};

class ActionsStream {
  constructor(io) {
    this.io = io;
    this.queue = [];
  
    setInterval(this._update.bind(this), 60);
  }
  // timestamp when action should be emitted, 
  // 0 means as soon as possible
  emitActions(roomName, newActions, timestamp = 0, callback) {
    if (!timestamp) {
      this._emitActions(roomName, newActions, callback);
    } else {
      this.queue.push({roomName, newActions, timestamp, callback});
    }
  }
  _emitActions(roomName, newActions, callback) {
    for (let i = 0; i < newActions.length; i++) {
      callback && callback();
      // run action callback
      this.io.to(roomName).emit('newAction', newActions[i]);
    }
  }
  _update() {
    let now = Date.now();
    
    if (!this.queue.length) return;
    
    for(let i = this.queue.length - 1; i > -1; i--) {
      let queueItem = this.queue[i];
      
      if (queueItem.timestamp < now) {
        this._emitActions(queueItem.roomName, queueItem.newActions, queueItem.callback);
        this.queue.splice(i, 1);
      }
    }
  }
}

const _nextId = (() => {
  let lastId = 0;
  
  return () => {
    return ''+(lastId++);
  };
})();

/**
 * Represents a conntector between io and WebsocketServer.
 * Validates api options.
 *
 * Emits:
 *   `console` - server sends log messages
 *   `roomUpdate` - sends current room state
 *   `gameUpdate` - sends current game state
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
    const MinPlayers = Games.Ludo.Config.MinPlayer; //per room to play
  
    this.connections = {}, // [socket.id]: {roomId, playerId}
    this.rooms = {};
    this.players = {};
    this.actionsStream = new ActionsStream(io);
    this.io = io;
    
    let _log = (msg) => {
        console.log(msg);
      },
      _getTotalNumPlayers = () => {
        let clients = io.sockets.clients().connected;
        return Object.keys(clients).length
      },
      _emitRoomState = (room) => {
        // copy player states to return state
        let roomState = room.getState();
  
        roomState.players = [];
        for(let i = 0; i < roomState.playerIds.length; i++) {
          let playerId = roomState.playerIds[i],
            player = playerId && this.players[playerId];

          roomState.players.push({...player});
        }
        
        io.to(room.name).emit('roomUpdate', roomState);
      },
      _emitNewActions = (room, newActions) => {
        newActions.forEach(action => {
          _log(`newAction emitted: ${action.type}`);
          io.to(room.name).emit('newAction', action);
        });
      },
      _emitPlayerDisconnected = (room, playerId) => {
        io.to(room.name).emit('playerDisconnected', { playerId });
      },
      _leaveGame = (socketId) => {
        let connection = this.connections[socketId],
          roomId = connection && connection.roomId,
          room = roomId && this.rooms[roomId],
          playerId = connection && connection.playerId,
          playerIndex = room && room.gameState.players.findIndex(player => player.id === playerId),
          player = room && room.gameState.players[playerIndex],
          activePlayers = room && room.getActivePlayers(),
          activePlayersLength = activePlayers && activePlayers.length;

        if (!room || !player) {
          console.log('no room or player');
          return;
        }
      
        let disconnectedAction = Games.Ludo.Actions.Disconnected(player.id),
          streamActions = Games.Ludo.ActionHandlers.Disconnected(disconnectedAction, player, room),
          returnActions = streamActions.map(streamAction => streamAction.action);
  
        _emitNewActions(room, returnActions);

        // if there's winnerId remove room
        if (room.gameState.winnerId) {
          delete this.rooms[roomId];
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
          });
        
        return room;
      },
      _findRoom = (gameName) => {
        let matchingRooms = Object.keys(this.rooms).reduce((returnRooms, roomId) => {
          const room = this.rooms[roomId];
          
          if (room.gameName === gameName &&
            room.gameState.players.length < MinPlayers) {
            return returnRooms.concat(room);
          }
          
          return returnRooms;
        }, []),
          room = matchingRooms.length && matchingRooms[0];
          
        return room;
      };
  
    // Authorization
    io.use((socket, next) => {
      let handshakeData = socket.request,
        regex = /token=([^;]*)/g,
        cookie = handshakeData.headers.cookie,
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
  
      const createTempPlayer = () => {
        const nextId = _nextId(),
          tempPlayer = new Player({id : nextId, temporary: true, login: `Name ${nextId}`, socketId: socket.id});
  
        connection.playerId = tempPlayer.id;
        console.log(`Unauthorized. Created temporary player '${tempPlayer.login}'`);
        this.updatePlayer(socket.id, tempPlayer);
      };
      
      if (token) {
        const playerPromise = playerService.verify({token});
        
        playerPromise
          .then(playerId => {
            playerService.getById(playerId)
              .then(player => {
                player.socketId = socket.id;
  
                console.log(`Authorized as ${player.login}`);
                this.updatePlayer(socket.id, player);
              }, createTempPlayer);
          })
          .catch(createTempPlayer);
      } else {
        createTempPlayer();
      }
    
      next();
    });
  
    io.on('connection', (socket) => {
      _log(`New connection (sockeId: ${socket.id}). currently ${_getTotalNumPlayers()} online.`);
      
      socket.on('disconnect', () => {
        _destroyConnection(socket.id);
      });
    
      socket.on('leaveGame', () => {
        _leaveGame(socket.id);
      });
    
      socket.on('findRoom', (options) => {
        let game = options.game,
          room,
          connection = this.connections[socket.id],
          player = connection.playerId && this.players[connection.playerId];

        _log(`player ${player.login} requests findRoom`);

        if (!game || !connection || !player) {
          _log('Invalid data, cannot find room.');
          return;
        }
      
        if (connection.roomId) {
          console.log('user ' + player.login + ' already in queue or game');
          return;
        }
        
        room = _findRoom(game);
        if (!room) {
          _log('create new room');
          room = _createRoom(Games.Ludo.Name);
          this.rooms[room.id] = room;
        }
        connection.roomId = room.id;
        room.gameState.playerIds.push(player.id);
        socket.join(room.name);
        player.roomId = room.id;
        
        console.log(`player ${player.login} joins queue(${room.gameState.playerIds.length}/${MinPlayers}) in ${room.name}`);
        
        if (room.gameState.playerIds.length >= MinPlayers) {
          let playersFromRoom = [];
  
          room.gameState.playerIds.forEach(playerId => {
            playersFromRoom.push(playerId);
          });
          
          room.startGame();
          console.log('game started in room: ' + room.name);
        }
  
        _emitRoomState(room);
      });
      
      socket.on('callAction', action => {
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
        
        _log(`player ${player.login} calls action: ${action.type}`);
        
        let streamActions = room.handleAction(action, player) || [],  
          newActions = [];

        if (streamActions.length) {
          //if action has timestamp, emit it separatedly
          let delayedActions = streamActions.filter(streamAction => streamAction.timestamp),
            newActionsFiltered = streamActions
              .filter(streamAction => !streamAction.timestamp)
              .map(streamAction => streamAction.action);
  
          room.actions = room.actions.concat(streamActions);
  
          if (delayedActions.length) {
            for(let i in delayedActions) {
              let streamAction = delayedActions[i];
              this.actionsStream.emitActions(room.name, [streamAction.action], streamAction.timestamp, streamAction.callback);
            }
          }
          if (newActionsFiltered.length) {
            this.actionsStream.emitActions(room.name, newActionsFiltered, 0);
          }
        }
        
        if (room.getState().winnerId) {
          _leaveGame(socket.id);
        }
        
      });
  
      socket.on('getStats', () => {
        let roomsFiltered = {};
        for (let roomId in this.rooms) {
          roomsFiltered[roomId] = this.rooms[roomId].getState();
        }
        socket.emit('statsUpdate', {
          connections: this.connections,
          rooms: roomsFiltered,
          players: this.players,
        });
      });
    });
    
    this.updatePlayer = this.updatePlayer.bind(this); 
  }
  // When user is authorized, his player should be updated
  updatePlayer(socketId, player) {
    const connection = this.connections[socketId],
      temporaryPlayer = connection && connection.playerId && this.players[connection.playerId];
  
    if (temporaryPlayer) {
      delete this.players[connection.playerId];
    }
    
    this.players[player.id] = player;
    connection.playerId = player.id;
    
    this.io.to(socketId).emit('playerUpdate', player);
  }
}

module.exports = WebsocketServer;