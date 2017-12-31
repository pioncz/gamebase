module.exports = function (io) {
  const Games = ['ludo'],
    MinPlayers = 2; //per room to play
  
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
    createRoom = ({socketId, game}) => {
      let room = {
        room: nextId(),
        players: [socketId],
        eta: 5*60*60, //18000s
      };
      
      queues[game] = [room];
      
      return room;
    },
    isSocketIdOccupied = (socketId) => {
      return occupiedSocketIds.indexOf(socketId) > -1;
    },
    startGame = ({sockedIds, game}) => {
      let newGame = {
        clients: sockedIds,
        game,
      };
      
      games.push(newGame);
      return newGame;
    },
    getTotalNumPlayers = () => {
      let clients = io.sockets.clients().connected;
      return Object.keys(clients).length
    };
  
  io.on('connection', function (socket) {
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
      
      if (isSocketIdOccupied(socket.id)) {
        socket.emit('console', 'user already in queue or game');
        return;
      }
      
      if (!queues[game].length) {
        room = createRoom({socketId: socket.id, game});
      } else {
        room = queues[game][0];
        room.players.push(socket.id);
      }
      
      occupiedSocketIds.push(socket.id);
      
      if (room.players.length >= MinPlayers) {
        let players = room.players.slice(0, MinPlayers);
        room.players.splice(0, MinPlayers);
        console.log(players);
        startGame({sockedIds: [players], game});
      }
      console.log(JSON.stringify(queues));
      socket.emit(
        'console',
        'user joins queue(' + room.players.length +
        '/2). queues for ' + game +
        ': ' + queues[game].length + '.'
      );
    });
  });
};