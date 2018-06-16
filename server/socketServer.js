const Player = require('./../ludo/Player.js');
const InitialState = require('./../ludo/InitialState.js');
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
      players = {};
  
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
      // Remove player from room, update other sockets, remove connections room.
      _leaveGame = (socketId) => {
        let connection = connections[socketId],
          roomId = connection && connection.roomId,
          room = roomId && rooms[roomId],
          playerId = connection && connection.playerId;
      
        if (!room || !playerId) return;
      
        // Update room players
        if (room.playerIds && room.gameState.playerIds.indexOf(playerId) > -1) {
          room.gameState.playerIds.splice(room.playerIds.indexOf(playerId), 1);
        }
        // Update connection
        connection.roomId = null;
      
        // Finish game if theres one or less players
        if (room.gameState.playerIds.length) {
          // Emit new room state
          _emitRoomState(room);
        } else {
          // Remove game without players
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
      
        if (connection.playerId) {
          delete players[connection.playerId];
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
            room.gameState.playerIds.length < MinPlayers) {
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
          room = connection.roomId && rooms[connection.roomId];
          
        if (!connection || !player || !room) {
          _log('player is not in a room.');
          return;
        }
  
        _log(`player ${player.name} calls action: ${action.type}`);
        
        let newActions = room.handleAction(action, player);

        if (newActions) {
          room.actions = room.actions.concat(newActions);
          _emitNewActions(room, newActions);
        }
      });
  
      socket.on('getStats', function () {
        socket.emit('statsUpdate', {
          connections,
          rooms,
          players,
        });
      });
    });
  }
}

module.exports = WebsocketServer;