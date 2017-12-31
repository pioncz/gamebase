module.exports = function (io) {
  const Games = ['ludo'],
    MinPlayers = 2, //per room to play
    players = {};
    
  let occupiedSocketIds = [],
    queues = {
      'ludo': [],
    },
    games = [],
    nextId = (() => {
      let lastId = 0;
      
      return () => {
        return lastId++;
      };
    })(),
    createRoom = ({socket, game}) => {
      let room = {
        name: '/room'+nextId(),
        players: [socket],
        eta: 5*60*60, //18000s
      };
      
      queues[game] = [room];
      
      // room.namespace = io.of(room.name);
      // room.namespace.on('connection', function(socket){
      //   console.log('someone connected to custom room');
      // });
      socket.join(room.name);
      socket.emit('foundRoom', room.name);
      
      return room;
    },
    isSocketOccupied = (socket) => {
      return occupiedSocketIds.indexOf(socket.id) > -1;
    },
    startGame = ({sockets, game}) => {
      let newGame = {
        clients: sockets,
        game,
      };
      
      games.push(newGame);

      for(let i = 0; i < sockets.length; i++) {
      
      }
      
      return newGame;
    },
    getTotalNumPlayers = () => {
      let clients = io.sockets.clients().connected;
      return Object.keys(clients).length
    };
  
  io.on('connection', function (socket) {
    players[socket.id] = {
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
      
      if (!game) return;
      
      if (isSocketOccupied(socket)) {
        socket.emit('console', 'user already in queue or game');
        return;
      }
      
      if (!queues[game].length) {
        room = createRoom({socket, game});
      } else {
        room = queues[game][0];
        room.players.push(socket);
      }
  
      socket.join(room.name);
      io.to(room.name).emit('console', 'player update: (' + room.players.length + '/2)');
      
      occupiedSocketIds.push(socket.id);
      
      if (room.players.length >= MinPlayers) {
        let players = room.players.slice(0, MinPlayers);
        room.players.splice(0, MinPlayers);

        startGame({sockets: [players], game});
      }
      // console.log(JSON.stringify(queues));
      socket.emit(
        'console',
        'user joins queue(' + room.players.length +
        '/2). queues for ' + game +
        ': ' + queues[game].length + '.'
      );
    });
  });
};