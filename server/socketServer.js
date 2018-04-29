const Player = require('./../ludo/Player.js');
const InitialState = require('./../ludo/InitialState.js');
const Fields = require('./../ludo/Fields.js');
const BoardUtils = require('./../ludo/BoardUtils.js');

let fields = Fields;

const FieldType = {
  spawn: 'spawn',
  start: 'start',
  goal: 'goal',
};

module.exports = function (io, config) {
  const MinPlayers = 1, //per room to play
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
          state: {
            currentPlayerId: 0,
            winner: null,
          },
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
      let initialState = new InitialState(),
        playersLength = room.players.length;
  
      room.pawns = initialState.pawns;
      
      initialState.players = room.players;
      
      initialState.players.forEach((player, index) => {
        for(var i = 0; i < 4; i++) {
          initialState.pawns[(index * 4 + i)].playerId = player.id;
          initialState.pawns[(index * 4 + i)].color = player.color;
        }
      });

      // Remove pawns for not connected players
      initialState.pawns.splice(playersLength * 4, (4 - playersLength) * 4);
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
    getTotalNumPlayers = () => {
      let clients = io.sockets.clients().connected;
      return Object.keys(clients).length
    },
    destroyRoom = (room) => {
      if (!room) return;
            
      delete games[room.game][room.id];
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
    let playerId = nextId();
    
    sockets[socket.id] = {
      socket: socket,
      player: new Player({name: 'name' + playerId, id: playerId, socketId: socket.id}),
      playerIndex: null,
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
      
      socketData.playerIndex = room.players.push(socketData.player) - 1;
      // var playerId = nextId();
      // room.players.push(new Player({name: 'name' + playerId, id: playerId, socketId: socket.id, color: 'black'}));
      // playerId = nextId();
      // room.players.push(new Player({name: 'name' + playerId, id: playerId, socketId: socket.id, color: 'tomato'}));
      // playerId = nextId();
      // room.players.push(new Player({name: 'name' + playerId, id: playerId, socketId: socket.id, color: 'purple'}));
      //
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
        player = sockets[socket.id].player,
        playerIndex = sockets[socket.id].playerIndex;
  
      if (!room) {
        console.log('not in a room');
      }
      //check if its this players turn
      else if (room.state.currentPlayerId === player.id &&
        !room.rolled) {
        // look for first pawn he can move
        let playerPawns = room.pawns.filter((pawn) => {
          return pawn.playerId === player.id;
        });
        
        let diceNumber = parseInt(Math.random()*6)+1; // 1-6
        let moves = BoardUtils.checkMoves(playerPawns, diceNumber, playerIndex);

        if (moves.length) {
          let move = moves[0],
            pawn = playerPawns.find(p => p.id === move.pawnId),
            lastField = move.fieldSequence[move.fieldSequence.length - 1];
            
          io.to(room.name).emit('pawnMove', move);
          pawn.x = lastField.x;
          pawn.z = lastField.z;
          
          if (lastField.type === FieldType.goal) {
            console.log('player win!');
            if (checkWin(playerPawns)) {
              finishGame(room, player);
            }
          }
        } else {
          console.log('player cant move');
          io.to(room.name).emit('console', 'player ' + player.name + ' roll\'d ' + diceNumber + ' and cant move');
        }

        let nextPlayerId = room.players[(playerIndex + 1) % room.players.length].id;

        io.to(room.name).emit('roll', {diceNumber: diceNumber});

        room.state.currentPlayerId = nextPlayerId;
        io.to(room.name).emit('updateGame', room.state);
      } else {
        console.log('not his turn');
      }
    });
  });
};