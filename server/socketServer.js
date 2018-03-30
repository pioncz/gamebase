const Player = require('./../ludo/Player.js');
const InitialState = require('./../ludo/InitialState.js');

const FieldType = {
  spawn: 'spawn',
  start: 'start',
  goal: 'goal',
};

module.exports = function (io, config) {
  const MinPlayers = 2, //per room to play
    sockets = {};
  
  let occupiedSocketIds = [],
    queues = {
      'ludo': {},
    },
    games = {
      'ludo': {},
    },
    nextId = (() => {
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
          currentPlayerId: 0,
          eta: 5*60*60, //18000s
        };
      
      console.log('created room: ' + room.name);
  
      occupiedSocketIds.push(socket.id);
      
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
      let initialState = new InitialState();
      room.pawns = initialState.pawns;
      
      initialState.players = room.players;
      
      initialState.players.forEach((player, index) => {
        for(var i = 0; i < 4; i++) {
          initialState.pawns[(index * 4 + i)].playerId = player.id;
          initialState.pawns[(index * 4 + i)].color = player.color;
        }
      });

      room.currentPlayerId = room.players[0].id;
      initialState.currentPlayerId = room.currentPlayerId;
  
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
    getTotalNumPlayers = () => {
      let clients = io.sockets.clients().connected;
      return Object.keys(clients).length
    },
    checkField = ({startField, endField, diceNumber, pawn}) => {
      if (endField.type === FieldType.goal && endField.playerId !== pawn.playerId) {
        return false;
      }
      if (endField.type === FieldType.spawn) {
        return false;
      }
  
      return true;
    },
    movePawn = ({pawns, diceNumber}) => {
      let fields = config.ludo.fields,
        endField,
        length = 0,
        pawn = pawns[0],
        areFieldsEqual = (fieldA, fieldB) => {
          return fieldA.x == fieldB.x &&
            fieldA.z == fieldB.z;
        },
        startFieldIndex = fields.findIndex((field)=> areFieldsEqual(field, pawn)),
        startField = startFieldIndex > -1 && fields[startFieldIndex];

        if (!startField) return;
        
        // For every pawn
        
        // Search twice cause when: startFieldIndex = fields.length-1
        // => search fields from start
        for(let i = startFieldIndex + 1; i < fields.length * 2 && !endField; i++) {
          let fieldIndex = i % fields.length,
            field = fields[fieldIndex];
  
          if (startField.type === FieldType.spawn) {
            if (diceNumber === 6) {
              if (field.type === FieldType.start) {
                length++;
                endField = field;
                break;
              }
            } else {
              return;
            }
          } else {
            if(checkField({startField, endField: field, diceNumber, pawn})) {
              length++;
            }
          }
  
          if (length >= diceNumber) {
            endField = field;
          }
        }
        // endField = fields[startFieldIndex + length];
        pawn.z = endField.z;
        pawn.x = endField.x;
        
        return { pawnId: pawn.id, endField, length};
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
        delete games[room.game][room.id];
      }
    };
    
  io.on('connection', function (socket) {
    let playerId = nextId();
    
    sockets[socket.id] = {
      socket: socket,
      player: new Player({name: 'name' + playerId, id: playerId, socketId: socket.id}),
      room: null,
    };
    
    socket.emit('console', 'connected to socket server. currently ' + getTotalNumPlayers() + ' online.');

    socket.emit('player', sockets[socket.id].player);
    
    socket.on('disconnect', () => {
      // Check if player was playing
      // Disconnect from current game
      leaveGame({socketId: socket.id});
    });
    
    socket.on('leaveGame', () => {
      leaveGame({socketId: socket.id});
    });
    
    socket.on('console', function (msg) {
      console.log('console: ' + msg);
    });
    
    socket.on('joinQueue', function (options) {
      let game = options.game,
        room;
      
      if (!game) {
        socket.emit('console', 'no game specified');
        return;
      }
      
      if (isSocketOccupied(socket)) {
        socket.emit('console', 'user already in queue or game');
        return;
      }
      
      room = findRoom({socket, game});
      
      let socketData = sockets[socket.id];
      socketData.room = room;
      
      room.players.push(socketData.player);
      
      socket.join(room.name);
      io.to(room.name).emit('console', 'player update: (' + room.players.length + '/' + MinPlayers + ')');
      
      occupiedSocketIds.push(socket.id);
      
      if (room.players.length >= MinPlayers) {
        delete queues[game][room.id];
        games[game][room.id] = room;
        pickColor({room});
        console.log('pickColor in room: ' + room.name);
      } else {
        socket.emit(
          'console',
          'user joins queue(' + room.players.length +
          '/2). queues for ' + game +
          ': ' + Object.keys(queues[game]).length + '.'
        );
      }
    });
    
    socket.on('selectColor', function (color) {
      let socketData = sockets[socket.id],
        room = socketData.room,
        player = socketData.player,
        canChangeColor = room && room.queueColors && !player.color;
  
      if (canChangeColor) {
        room.queueColors.forEach((queueColor) => {
          if (queueColor.color === color && !queueColor.selected) {
            queueColor.selected = true;
            player.color = color;
            queueColorsChanged(room);
            return;
          }
        });
      }
    });
  
    socket.on('roll', function () {
      //get sockets room
      let room = sockets[socket.id].room,
        player = sockets[socket.id].player;

      if (!room) {
        console.log('not in a room');
      }
      //check if its this players turn
      else if (room && room.currentPlayerId === player.id &&
        !room.rolled) {
        // look for first pawn he can move
        let playerPawns = room.pawns.filter((pawn) => {
          return pawn.playerId === player.id;
        });
        
        let diceNumber = parseInt(Math.random()*6)+1; // 1-6
        
        let pawnMove = movePawn({diceNumber, pawns: playerPawns});
        
        if (pawnMove) {
          pawnMove.diceNumber = diceNumber;
          io.to(room.name).emit('pawnMove', pawnMove);
        } else {
          console.log('player cant move');
          io.to(room.name).emit('console', 'player ' + player.name + ' roll\'d ' + diceNumber + ' and cant move');
        }
  
        let index = room.players.findIndex((player) => {
          return player.id === room.currentPlayerId;
        });
        let nextPlayerId = room.players[(index + 1) % room.players.length].id;

        room.currentPlayerId = nextPlayerId;
        io.to(room.name).emit('updateGame', {currentPlayerId: nextPlayerId});
      } else {
        console.log('not his turn');
      }
    });
  });
};