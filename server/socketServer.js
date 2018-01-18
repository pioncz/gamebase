const Player = require('./../Ludo/Player.js');
const InitialState = require('./../Ludo/InitialState.js');

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
        return lastId++;
      };
    })(),
    createRoom = ({socket, game}) => {
      let id = nextId(),
        room = {
          id: id,
          name: '/room'+id,
          game: game,
          players: [],
          currentPlayerId: 0,
          eta: 5*60*60, //18000s
        };
  
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
  
      // let id = nextId();
      // initialState.players.push(new Player({name: 'name' + id, id: id, color: config.ludo.colors[1]}));
      // id = nextId();
      // initialState.players.push(new Player({name: 'name' + id, id: id, color: config.ludo.colors[2]}));
      // id = nextId();
      // initialState.players.push(new Player({name: 'name' + id, id: id, color: config.ludo.colors[3]}));
      //
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
    getNextField = (fieldIndex) => {
      let field = fields[fieldIndex];
      
    },
    getPawnMove = (diceNumber, pawns) => {
      let fields = config.ludo.fields,
        length = 0;
      
      for(let i = 0; i < pawns.length; i++) {
        let pawn = pawns[i],
          fieldIndex,
          pawnField = fields.find((field, index) =>
            field.x == pawn.x &&
            field.z == pawn.z &&
            (fieldIndex = index)
          ),
          fieldType = pawnField.type,
          newField;
        
        for(let j = fieldIndex + 1;
            j < fields.length &&
            length < diceNumber; j++) {
          let field = fields[j];

          if (field.type === 'start' && field.player === pawnField.player) {
            length++;
            return {pawnId: pawn.id, length};
          } else if (!field.type || field.type === 'start') {
            length++;
          } else if (field.type === 'goal' && field.player === pawnField.player) {
            length++;
          }
        }
        for(let j = 0; j < fieldIndex + 1 && length < diceNumber; j++) {
          let field = fields[j];
  
          if (field.type === 'start' && field.player === pawnField.player) {
            length++;
            return {pawnId: pawn.id, length};
          } else if (!field.type || field.type === 'start') {
            length++;
          } else if (field.type === 'goal' && field.player === pawnField.player) {
            length++;
          }
        }
        return {pawnId: pawn.id, length };
        // if (fieldType === FieldType.spawn && diceNumber === 6) {
        //   return {pawnId: pawn.id, length: 1};
        // } else if (fieldType !== FieldType.spawn) {
        //   for(let j = fieldIndex + 1; j < fields.length; j++) {
        //     let field = fields[j];
        //     if (!field) {
        //       console.log('cannot find next field');
        //       break;
        //     }
            
        //     if (field.type !== FieldType.spawn) {
        //       newField = field;
        //       break;
        //     }
        //   }

        //   return {pawnId: pawn.id, field: newField, diceNumber: };
        // }
        break;
      }
    };
  
  io.on('connection', function (socket) {
    sockets[socket.id] = {
      socket: socket,
      player: null,
      room: null,
    };
    
    socket.emit('console', 'connected to socket server. currently ' + getTotalNumPlayers() + ' online.');

    socket.on('disconnect', function () {
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
  
      let playerId = nextId(),
        player = new Player({name: 'name' + playerId, id: playerId, socketId: socket.id});
      room.players.push(player);
      let socketData = sockets[socket.id];
      socketData.room = room;
      socketData.player = player;
      
      socket.join(room.name);
      io.to(room.name).emit('console', 'player update: (' + room.players.length + '/' + MinPlayers + ')');
      
      occupiedSocketIds.push(socket.id);
      
      if (room.players.length >= MinPlayers) {
        delete queues[game][room.id];
        games[game][room.id] = room;
        pickColor({room});
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
      //check if its this players turn
      if (room.currentPlayerId == player.id) {
        // look for first pawn he can move
        let playerPawns = room.pawns.filter((pawn) => {
          return pawn.playerId == player.id;
        });
        
        let diceNumber = parseInt(Math.random()*6)+1; // 1-6
        
        let pawnMove = getPawnMove(diceNumber, playerPawns);
        
        if (pawnMove) {
          io.to(room.name).emit('pawnMove', pawnMove);
          console.log(pawnMove);
        } else {
          console.log('player cant move');
          socket.emit('console', 'player roll\'d ' + diceNumber + ' and cant move');
        }
        //move his first pawn
        //emit updateGame event to this socket
      } else {
        console.log('not his turn');
      }
    });
  });
};