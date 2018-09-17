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
  emitActions(roomName, newActions, timestamp = 0) {
    if (!timestamp) {
      this._emitActions(roomName, newActions);
    } else {
      this.queue.push({roomName, newActions, timestamp});
    }
  }
  _emitActions(roomName, newActions) {
    for (let i = 0; i < newActions.length; i++) {
      this.io.to(roomName).emit('newAction', newActions[i]);
    }
  }
  _update() {
    let now = Date.now();
    
    if (!this.queue.length) return;
    
    for(let i = this.queue.length - 1; i > -1; i--) {
      let queueItem = this.queue[i];
      
      if (queueItem.timestamp < now) {
        this._emitActions(queueItem.roomName, queueItem.newActions);
        this.queue.splice(i, 1);
      }
    }
  }
}

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
  constructor (io, config) {
    const MinPlayers = Games.Ludo.Config.MinPlayer; //per room to play
    let connections = {}, // [socket.id]: {roomId, playerId}
      rooms = {},
      players = {},
      actionsStream = new ActionsStream(io);
  
    let _nextId = (() => {
      let lastId = 0;
  
      return () => {
        return ''+(lastId++);
      };
    })(),
      _log = (msg) => {
        console.log(msg);
      },
      _getTotalNumPlayers = () => {
        let clients = io.sockets.clients().connected;
        return Object.keys(clients).length
      },
      _emitRoomState = (room) => {
        io.to(room.name).emit('roomUpdate', room.getState());
      },
      _emitNewActions = (room, newActions) => {
        newActions.forEach(action => {
          _log(`newAction emitted: ${action.type}`);
          io.to(room.name).emit('newAction', action);
        });
      },
      _emitePlayerDisconnected = (room, playerId) => {
        io.to(room.name).emit('playerDisconnected', { playerId });
      },
      _leaveGame = (socketId) => {
        let connection = connections[socketId],
          roomId = connection && connection.roomId,
          room = roomId && rooms[roomId],
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
          returnActions = Games.Ludo.ActionHandlers.Disconnected(disconnectedAction, player, room);

        _log(`player ${player.name} disconnected`);
        _emitNewActions(room, returnActions);

        // if there's winnerId remove room
        if (room.gameState.winnerId) {
          delete rooms[roomId];
        }
      },
      // Leave connections room, remove connections player, remove from connections
      _destroyConnection = (socketId) => {
        let connection = connections[socketId];
      
        if (!connection) return;
      
        if (connection.roomId) {
          _leaveGame(socketId);
        }
              
        delete connections[socketId];
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
        let matchingRooms = Object.keys(rooms).reduce((returnRooms, roomId) => {
          const room = rooms[roomId];
          
          if (room.gameName === gameName &&
            room.gameState.players.length < MinPlayers) {
            return returnRooms.concat(room);
          }
          
          return returnRooms;
        }, []),
          room = matchingRooms.length && matchingRooms[0];
          
        return room;
      };
  
    io.on('connection', function (socket) {
      let playerId = _nextId(),
        newPlayer = new Player({name: 'name' + playerId, id: playerId, socketId: socket.id});
    
      players[playerId] = newPlayer;
      
      connections[socket.id] = new Connection({
        playerId: newPlayer.id,
        roomId: null,
      });
  
      _log('connected to socket server. currently ' + _getTotalNumPlayers() + ' online.');
    
      socket.emit('playerUpdate', newPlayer);
      
      socket.on('disconnect', () => {
        _destroyConnection(socket.id);
      });
    
      socket.on('leaveGame', () => {
        _leaveGame(socket.id);
      });
    
      socket.on('findRoom', function (options) {
        let game = options.game,
          room,
          connection = connections[socket.id],
          player = connection.playerId && players[connection.playerId];
      
        _log(`player ${player.name} requests findRoom`);

        if (!game || !connection || !player) {
          _log('Invalid data, cannot find room.');
          return;
        }
      
        if (connection.roomId) {
          console.log('user ' + player.name + ' already in queue or game');
          // socket.emit('console', 'user already in queue or game');
          return;
        }
        
        room = _findRoom(game);
        if (!room) {
          _log('create new room');
          room = _createRoom(Games.Ludo.Name);
          rooms[room.id] = room;
        }
        connection.roomId = room.id;
        room.gameState.playerIds.push(player.id);
        socket.join(room.name);
        player.roomId = room.id;
        
        console.log(`player ${player.name} joins queue(${room.gameState.playerIds.length}/${MinPlayers}) in ${room.name}`);
        
        if (room.gameState.playerIds.length >= MinPlayers) {
          let playersFromRoom = [];
  
          room.gameState.playerIds.forEach(playerId => {
            playersFromRoom.push(players[playerId]);
          });
          
          room.startGame(playersFromRoom);
          console.log('game started in room: ' + room.name);
        }
  
        _emitRoomState(room);
      });
      
      socket.on('callAction', action => {
        if (!action || !action.type) {
          _log('Invalid action');
          return;
        }
  
        let connection = connections[socket.id],
          player = connection.playerId && players[connection.playerId],
          room = connection.roomId && rooms[connection.roomId],
          finishTimestampsSub,
          startTimestampsSub;
          
        if (!connection || !player || !room) {
          _log('player is not in a room.');
          return;
        }
  
        finishTimestampsSub = room.gameState.finishTimestamp && 
          (room.gameState.finishTimestamp - Date.now()) || 0;
        
        if (finishTimestampsSub > 0) {
          _log(`actions are blocked for ${parseInt(finishTimestampsSub/100)/10}s`);
          return;
        }

        startTimestampsSub = room.gameState.startTimestamp && 
          (room.gameState.startTimestamp - Date.now()) || 0;
        
        if (startTimestampsSub > 0) {
          _log(`actions are blocked for ${parseInt(startTimestampsSub/100)/10}s`);
          return;
        }
        
        _log(`player ${player.name} calls action: ${action.type}`);
        
        let newActions = room.handleAction(action, player);

        if (newActions) {
          room.actions = room.actions.concat(newActions);
          _emitNewActions(room, newActions);
        }
        
        if (room.getState().winnerId) {
          _leaveGame(socket.id);
        }
        
      });
  
      socket.on('getStats', function () {
        let roomsFiltered = {};
        for (let roomId in rooms) {
          roomsFiltered[roomId] = rooms[roomId].getState();
        }
        socket.emit('statsUpdate', {
          connections,
          rooms: roomsFiltered,
          players,
        });
      });
    });
  }
}

module.exports = WebsocketServer;