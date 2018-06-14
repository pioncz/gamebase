const Player = require('./../ludo/Player.js');
const InitialState = require('./../ludo/InitialState.js');
const Fields = require('./../ludo/Fields.js');
const BoardUtils = require('./../ludo/BoardUtils.js');
const Connection = require('./Connection.js');
const Room = require('./Room.js');

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
    const MinPlayers = 2; //per room to play
    let connections = {}, // [socket.id]: {roomId, playerId}
      rooms = {},
      players = {};
  
    let _getTotalNumPlayers = () => {
        let clients = io.sockets.clients().connected;
        return Object.keys(clients).length
      },
      // Remove player from room, update other sockets, remove connections room.
      _leaveGame = (socketId) => {
        let connection = connections[socketId],
          roomId = connection && connection.roomId,
          room = roomId && rooms[roomId],
          playerId = connection && connection.playerId;
      
        if (!room || !playerId) return;
      
        // Update room players
        if (room.playerIds.indexOf(playerId) > -1) {
          room.playerIds.splice(room.playerIds.indexOf(playerId), 1);
        }
        // Update connection
        connection.roomId = null;
      
        // Finish game if theres one or less players
        if (room.playerIds.length) {
          // Emit new room state
          io.to(room.name).emit('roomUpdate', room.getState());
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
        let id = nextId(),
          room = new Room({
            id: id,
            name: '/room' + id,
            gameName: gameName,
            playerIds: [],
            state: {
              rolled: false,
              currentPlayerId: 0,
              winnerId: null,
              nextRollTimestamp: null,
              eta: 5*60*60, //18000s
            },
          });
        
        return room;
      },
      _findRoom = (gameName) => {
        let matchingRooms = Object.keys(rooms).reduce((returnRooms, roomId) => {
          const room = rooms[roomId];
          let roomState = room.getState();
          
          if (room.gameName === gameName &&
            roomState.playerIds.length < MinPlayers) {
            return returnRooms.concat(room);
          }
          
          return returnRooms;
        }, []),
          room = matchingRooms.length && matchingRooms[0];
          
        return room;
      },
      _startGame = (roomId) => {
        let room = rooms[roomId];
        
        
      },
      _log = (msg) => {
        let messages = msg instanceof Array ? msg : null;
        //socket.emit('console', msg);
        if (messages) {
          console.log(messages);
        } else {
          console.log(msg);
        }
      };
  
    let nextId = (() => {
        let lastId = 0;
      
        return () => {
          return ''+(lastId++);
        };
      })(),
      createRoom = ({socket, game}) => {
        let id = nextId(),
          room = {
            id: id,
            name: '/room'+id,
            game: game,
            rolled: false,
            players: [],
            state: {
              currentPlayerId: 0,
              winner: null,
              nextRollTimestamp: null,
            },
            eta: 5*60*60, //18000s
          };
      
        console.log('created room: ' + room.name);
      
        return room;
      },
      isSocketOccupied = (socket) => {
        return occupiedSocketIds.indexOf(socket.id) > -1;
      },
      pickColor = ({room}) => {
        const queueColors = [],
          getColor = (color) => {
            for(let i = 0; i < queueColors.length; i++) {
              if (queueColors[i].color === color) {
                return queueColors[i];
              }
            }
          };
        config.ludo.colors.forEach((color) => {
          queueColors.push({
            color: color,
            selected: false,
          })
        });
        room.queueColors = queueColors;
      
        // Prepare players
        io.to(room.name).emit('pickColor', queueColors);
      },
      startGame = (room) => {
        let initialState = new InitialState(),// [Pawn]
          playersLength = room.players.length;
      
        room.pawns = initialState.pawns;
      
        initialState.players = room.players;
      
        initialState.players.forEach((player, index) => {
          for(var i = 0; i < 4; i++) {
            initialState.pawns[(index * 4 + i)].playerIndex = index;
            initialState.pawns[(index * 4 + i)].playerId = player.id;
            initialState.pawns[(index * 4 + i)].color = player.color;
          }
        });
      
        // Remove pawns for not connected players
        initialState.pawns.splice(playersLength * 4, (4 - playersLength) * 4);
        // initialState.pawns[4].playerIndex = 1;
        // initialState.pawns[4].playerId = '2222';
        // initialState.pawns[4].color = 'black';
      
        initialState.timestamp = Date.now() + 5 * 60 * 1000;
      
        room.state.currentPlayerId = room.players[0].id;
        initialState.currentPlayerId = room.state.currentPlayerId;
      
        room.players.forEach((player) => {
          let newInitialState = Object.assign({}, initialState);
          newInitialState.yourPlayerId = player.id;
        
          io.to(player.socketId).emit('startGame', newInitialState);
        });
      },
      findRoom = ({socket, game}) => {
        let room;
      
        if (!Object.keys(queues[game]).length) {
          room = createRoom({socket, game});
          queues[game][room.id] = room;
        } else {
          // Find room for player
          let roomId = Object.keys(queues[game])[0];
          room = queues[game][roomId];
        }
      
        return room;
      },
      queueColorsChanged = (room) => {
        let playersWithColor = room.players.reduce((previousValue, currentValue) => {
          return previousValue + (currentValue.color?1:0);
        }, 0);
      
        if (playersWithColor >= MinPlayers) {
          startGame(room);
        } else {
          io.to(room.name).emit('pickColor', room.queueColors);
        }
      },
      destroyRoom = (room) => {
        if (!room) return;
      
        for(let i = room.players.length -1; i > 0; i--) {
          let player = room.players[i],
            occupiedIndex = occupiedSocketIds.indexOf(player.socketId);
        
          if (occupiedIndex > -1) {
            occupiedSocketIds.splice(occupiedIndex, 1);
          }
        
          room.players.splice(i, 1);
        }
      
        delete games[room.game][room.id];
      
        console.log('destroyed room ' + room.name);
      },
      leaveGame = ({socketId}) => {
        let socketData = sockets[socketId],
          room = socketData.room;
      
        if (!room) return;
      
        // Remove socketId from occupiedSocketIds
        let index = occupiedSocketIds.indexOf(socketId);
        if (index > -1) {
          occupiedSocketIds.splice(index, 1);
        }
        // Update room players
        let playerIndex = room.players.findIndex(player => {
          return player.socketId === socketId;
        });
        playerIndex > -1 && room.players.splice(playerIndex, 1);
      
        // Finish game if theres one or less players
        if (room.players.length) {
          // Emit new player state
          io.to(room.name).emit('updatePlayers', room.players);
        } else {
          // Remove game without players
          destroyRoom(room);
        }
      },
      checkWin = (playerPawns) => {
        for(let pawnI in playerPawns) {
          let pawn = playerPawns[pawnI],
            field = BoardUtils.getFieldByPosition(pawn.x, pawn.z);
        
          if (field.type !== FieldType.goal) {
            return false;
          }
        }
      
        return true;
      },
      finishGame = (room, player) => {
        if (!room) return;
      
        room.state.winner = (player && player.id) || null;
        io.to(room.name).emit('updateGame', room.state);
      
        destroyRoom(room);
      };
  
    io.on('connection', function (socket) {
      let playerId = nextId(),
        newPlayer = new Player({name: 'name' + playerId, id: playerId, socketId: socket.id});
    
      players[playerId] = newPlayer;
      
      connections[socket.id] = new Connection({
        playerId: newPlayer.id,
        roomId: null,
      });
  
      _log('connected to socket server. currently ' + _getTotalNumPlayers() + ' online.');
    
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
      
        _log('Player requestes findRoom');

        if (!game || !connection || !player) {
          _log('Invalid data, cannot find room.');
          return;
        }
      
        if (connection.roomId) {
          console.log('user ' + player.name + ' already in queue or game');
          socket.emit('console', 'user already in queue or game');
          return;
        }
        
        room = _findRoom(game);
        if (!room) {
          _log('create new room');
          room = _createRoom(game);
          rooms[room.id] = room;
        }
        connection.roomId = room.id;
        room.playerIds.push(player.id);
        socket.join(room.name);
  
        io.to(room.name).emit('console', 'player update: (' + room.playerIds.length + '/' + MinPlayers + ')');
        console.log('user ' + player.name + ' joins queue(' + room.playerIds.length + '/' + MinPlayers + ') in ' + room.name);
        
        if (room.playerIds.length >= MinPlayers) {
          _startGame(room.id);
          console.log('game started in room: ' + room.name);
        } else {
          socket.emit(
            'console',
            'user joins queue(' + room.playerIds.length + '/' + MinPlayers + ')'
          );
        }
      });
  
      socket.on('getStats', function () {
        socket.emit('statsUpdate', {
          connections,
          rooms,
          players,
        });
      });
      
      // should be 'callAction'
      // socket.on('selectColor', function (color) {
      //   let socketData = sockets[socket.id],
      //     room = socketData.room,
      //     player = socketData.player,
      //     canChangeColor = room && room.queueColors && !player.color;
      //
      //   if (canChangeColor) {
      //     room.queueColors.forEach((queueColor) => {
      //       if (queueColor.color === color && !queueColor.selected) {
      //         queueColor.selected = true;
      //         player.color = color;
      //         queueColorsChanged(room);
      //         return;
      //       }
      //     });
      //   }
      // });
      //
      // socket.on('roll', function () {
      //   //get sockets room
      //   let room = sockets[socket.id].room,
      //     player = sockets[socket.id].player,
      //     playerIndex = sockets[socket.id].playerIndex;
      //
      //   if (!room) {
      //     console.log('not in a room');
      //   }
      //   //check if its this players turn
      //   else if (room.state.currentPlayerId === player.id &&
      //     !room.rolled &&
      //     (!room.state.nextRollTimestamp || Date.now() > room.state.nextRollTimestamp)) {
      //     // look for first pawn he can move
      //     let playerPawns = room.pawns.filter(pawn => {
      //       return pawn.playerId === player.id;
      //     });
      //  
      //     let diceNumber = parseInt(Math.random()*6)+1; // 1-6
      //     // diceNumber=1;
      //     let moves = BoardUtils.checkMoves(playerPawns, diceNumber, playerIndex);
      //  
      //     if (moves.length) {
      //       let move = moves[0],
      //         pawn = playerPawns.find(p => p.id === move.pawnId),
      //         lastField = move.fieldSequence[move.fieldSequence.length - 1],
      //         anotherPawns = room.pawns.filter(pawn =>
      //           pawn.playerId !== player.id &&
      //           pawn.x === lastField.x &&
      //           pawn.z === lastField.z
      //         ) || [];
      //    
      //       room.state.nextRollLength = Math.max(config.ludo.animations.movePawn * move.fieldSequence.length, config.ludo.animations.rollDice);
      //       room.state.nextRollTimestamp = Date.now() + room.state.nextRollLength;
      //       io.to(room.name).emit('pawnMove', move);
      //    
      //       pawn.x = lastField.x;
      //       pawn.z = lastField.z;
      //    
      //       if (anotherPawns.length) {
      //         let anotherPawn = anotherPawns[0],
      //           anotherPawnSpawnFields = BoardUtils.getSpawnFields(room.pawns, anotherPawn.playerIndex),
      //           spawnField = (anotherPawnSpawnFields && anotherPawnSpawnFields[0]) || null,
      //           anotherPawnMove = { pawnId: anotherPawn.id, fieldSequence: [spawnField] };
      //      
      //         if (anotherPawnMove) {
      //           anotherPawn.x = spawnField.x;
      //           anotherPawn.z = spawnField.z;
      //           io.to(room.name).emit('pawnMove', anotherPawnMove);
      //         }
      //       }
      //    
      //       if (lastField.type === FieldType.goal) {
      //         console.log('player win!');
      //         if (checkWin(playerPawns)) {
      //           finishGame(room, player);
      //         }
      //       }
      //     } else {
      //       room.state.nextRollTimestamp = Date.now() + config.ludo.animations.rollDice;
      //       console.log('player cant move');
      //       io.to(room.name).emit('console', 'player ' + player.name + ' roll\'d ' + diceNumber + ' and cant move');
      //     }
      //  
      //  
      //     let nextPlayerId = room.players[(playerIndex + 1) % room.players.length].id;
      //  
      //     io.to(room.name).emit('roll', {diceNumber: diceNumber});
      //  
      //     room.state.currentPlayerId = nextPlayerId;
      //     io.to(room.name).emit('updateGame', room.state);
      //   } else {
      //     console.log('not his turn');
      //   }
      // });
    });
  }
}

module.exports = WebsocketServer;