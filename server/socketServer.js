const Player = require('./../Ludo/Player.js');

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
          eta: 5*60*60, //18000s
        };
  
      occupiedSocketIds.push(socket.id);
      
      return room;
    },
    isSocketOccupied = (socket) => {
      return occupiedSocketIds.indexOf(socket.id) > -1;
    },
    startGame = ({room}) => {
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
    queueColorsChanged = (room) => {
      let playersWithColor = room.players.reduce((previousValue, currentValue) => {
        return previousValue + (currentValue.color?1:0);
      }, 0);

    console.log('playersWithColor:' + playersWithColor);
      if (playersWithColor >= MinPlayers) {
        io.to(room.name).emit('startGame');
      } else {
        io.to(room.name).emit('pickColor', room.queueColors);
      }
    },
    getTotalNumPlayers = () => {
      let clients = io.sockets.clients().connected;
      return Object.keys(clients).length
    };
  
  io.on('connection', function (socket) {
    sockets[socket.id] = {
      socket: socket,
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
      
      if (!queues[game].length) {
        room = createRoom({socket, game});
        queues[game][room.id] = room;
      } else {
        // Find room for player
        room = queues[game][queues[game].length - 1];
      }
  
      let playerId = nextId(),
        player = new Player({name: 'name' + playerId, id: playerId, socket, roomId: room.id});
      room.players.push(player);
      sockets[socket.id].room = room;
      
      socket.join(room.name);
      io.to(room.name).emit('console', 'player update: (' + room.players.length + '/' + MinPlayers + ')');
  
      socket.on('selectColor', (room) => {
        return (color) => {
          console.log('x');
          let foundColor = getColor(color);
          if (foundColor && !foundColor.selected) {
            foundColor.selected = true;
            io.to(room.name).emit('pickColor', queueColors);
          }
        }
      });
      
      occupiedSocketIds.push(socket.id);
      
      if (room.players.length >= MinPlayers) {
        delete queues[game][room.id];
        games[game][room.id] = room;
        startGame({room});
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
      let room = sockets[socket.id].room,
        player = room.players.find((player) => { return player.socket.id === socket.id; }),
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
  });
};