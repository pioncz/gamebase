import React, { Component } from 'react';
import GameComponent from 'components/gameComponent/';
import InitialPage from './initialPage';
import Modal from 'components/modal/index';
import Button from 'components/button/index';
import './index.sass';
import Timer from 'components/timer';
import Games from 'Games.js';

const Pages = {
  Initial: 'Initial',
  Queue: 'Queue',
  PickColor: 'PickColor',
  Game: 'Game',
  Win: 'Win',
  Loose: 'Loose',
  Disconnected: 'Disconnected',
  Winner: 'Winner',
};

class Progress extends Component {
  constructor(props) {
    super(props);
    
    this.update = this.update.bind(this);
    
    let interval = null;
  
    if (props.startTimestamp && props.endTimestamp) {
      interval = window.setInterval(this.update, 50);
    }
    
    this.state = {
      startTimestamp: props.startTimestamp,
      endTimestamp: props.endTimestamp,
      length: 0,
      interval: interval,
    };
  }
  componentWillReceiveProps(nextProps) {
    const { startTimestamp, endTimestamp } = this.props,
      timestampsChanged = startTimestamp !== nextProps.startTimestamp || endTimestamp !== nextProps.endTimestamp;
    
    if (timestampsChanged) {
      this.stop();
      
    }
  }
  stop() {
    const { interval } = this.state;
  
    interval && window.clearInterval(interval);
    this.setState({
      interval: null,
      startTimestamp: null,
      endTimestamp: null,
      length: 0,
    });
  }
  update() {
    const { startTimestamp, endTimestamp} = this.state;
    let length = (Date.now() - startTimestamp)/(endTimestamp - startTimestamp);
    if (length < 0) {
      window.clearInterval(this.state.interval);
    }
    length = Math.min(Math.max(Math.round((length*100)), 0), 1);
    
    this.setState({
      length,
    });
  }
  render() {
    const { length } = this.state;
    
    let progressStyle = {
      width: length + '%',
      background: '#fff',
    };
    
    return <div className="player-progress" style={progressStyle} />;
  }
}

export default class Ludo extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      menuOpened: false,
      page: Pages.Initial,
      yourPlayerId: null,
      // colors that players can pick from
      queueColors: [],
      currentPlayerId: null,
      gameId: null,
      players: [],
      pawns: [],
      winner: null,
      timestamp: null,
      nextRollTimestamp: null,
      nextRollLength: null,
      waitingForAction: null,
    };
    
    // this.state.currentPlayerId = '2';
    // this.state.page = 'Game';
    // this.state.pawns = [];
    // this.state.players = [
    //   {id:0, name: 'd1', avatar: null, color: ''},
    //   {id:1, name: 'd2', avatar: null, color: ''},
    //   {id:2, name: 'd3', avatar: null, color: ''},
    //   {id:3, name: 'd4', avatar: null, color: ''},
    // ];
    
    this.handleClick = this.handleClick.bind(this);
    this.joinQueue = this.joinQueue.bind(this);
    this.selectColor = this.selectColor.bind(this);
    this.roll = this.roll.bind(this);
    this.initSocketEvents = this.initSocketEvents.bind(this);
  
    this.timerComponent = null;
    this.connectorInstance = this.props.connectorInstance;
    
    this.props.setInGame();
  }
  componentDidMount() {
    if (this.connectorInstance) {
      this.connectorInstance = this.props.connectorInstance;
      this.initSocketEvents(this.connectorInstance);
    }
  }
  componentWillUnmount() {
    if (this.connectorInstance) {
      this.connectorInstance.leaveGame();
    }
    this.props.unsetInGame();
  }
  initSocketEvents(connectorInstance) {
    const handleAction = (newAction) => {
      if (newAction.type === Games.Ludo.ActionTypes.SelectedColor) {
        let queueColors = this.state.queueColors,
          queueColor = queueColors.find(color => color.color === newAction.value);
  
        if (queueColor) {
          queueColor.selected = true;
        }
  
        this.setState({
          queueColors: queueColors,
        });
      }
      if (newAction.type === Games.Ludo.ActionTypes.StartGame) {
        let roomState = newAction.roomState;
        
        this.setState({
          players: roomState.players,
          currentPlayerId: roomState.currentPlayerId,
          page: Pages.Game,
          pawns: roomState.pawns,
          timestamp: roomState.timestamp,
        });
        this.timerComponent.start(roomState.finishTimestamp - Date.now());
      }
      if (newAction.type === Games.Ludo.ActionTypes.WaitForPlayer) {
        this.setState({
          currentPlayerId: newAction.playerId,
        });
      }
      if (newAction.type === Games.Ludo.ActionTypes.Roll) {
        this.gameComponent.engine.board.dice.roll(newAction.diceNumber);
      }
      if (newAction.type === Games.Ludo.ActionTypes.MovePawn) {
        this.gameComponent.movePawn({pawnId: newAction.pawnId, fieldSequence: newAction.fieldSequence});
        this.gameComponent.engine.selectPawns([]);

        this.setState({
          waitingForAction: Games.Ludo.ActionTypes.Roll,
        });
      }
      if (newAction.type === Games.Ludo.ActionTypes.SelectPawns) {
        // highlight pawns only for current player
        if (this.state.player && newAction.playerId !== this.state.player.id) return;

        this.gameComponent.engine.selectPawns(newAction.pawnIds);
        
        this.setState({
          waitingForAction: Games.Ludo.ActionTypes.PickPawn,
        });
      }
      if (newAction.type === Games.Ludo.ActionTypes.FinishGame) {
        let roomState = newAction.roomState;
  
        this.setState({
          winnerId: roomState.winnerId,
          page: (roomState.winnerId?Pages.Winner:this.state.page),
        });
  
        this.timerComponent.stop();
      }
    };

    connectorInstance.socket.on('roomUpdate', (roomState) => {
      console.log('roomUpdate', roomState);
      if (roomState.roomState === 'pickColors') {
        this.setState({
          page: Pages.PickColor,
          queueColors: roomState.colorsQueue,
        });
      }
    });
    connectorInstance.socket.on('playerUpdate', (player) => {
      console.log('playerUpdate', player);
      this.setState({
        player,
      });
    });
    connectorInstance.socket.on('newAction', (newAction) => {
      console.log('newAction', newAction);
      if (newAction.startTimestamp && Date.now() < newAction.startTimestamp) {
        setTimeout(() => handleAction(newAction), Date.now() - newAction.startTimestamp);
      } else {
        handleAction(newAction);
      }
    });
    
    connectorInstance.socket.on('startGame', (gameState) => {
      connectorInstance.addMessage('startGame');
      connectorInstance.addMessage('currentPlayer: ' + gameState.currentPlayerId + (gameState.yourPlayerId == gameState.currentPlayerId?' it\'s You!':''));
      this.setState({
        players: gameState.players,
        currentPlayerId: gameState.currentPlayerId,
        yourPlayerId: gameState.yourPlayerId,
        page: Pages.Game,
        pawns: gameState.pawns,
        timestamp: gameState.timestamp,
      });
      this.timerComponent.start(gameState.timestamp - Date.now());
    });
    connectorInstance.socket.on('roll', ({diceNumber}) => {
      this.gameComponent.engine.board.dice.roll(diceNumber);
    });
    connectorInstance.socket.on('pawnMove', (pawnMove) => {
      connectorInstance.addMessage(`pawnMove length: ${pawnMove.length} diceNumber: ${pawnMove.diceNumber}`);
      this.gameComponent.movePawn(pawnMove);
    });
    connectorInstance.socket.on('updateGame', (newGameState) => {
      this.setState({
        currentPlayerId: newGameState.currentPlayerId,
        winnerId: newGameState.winnerId,
        page: (newGameState.winnerId?Pages.Winner:this.state.page),
        nextRollTimestamp: newGameState.nextRollTimestamp,
        nextRollLength: newGameState.nextRollLength,
      });
    });
    connectorInstance.socket.on('updatePlayers', (newPlayers) => {
      // Leave game when someone leaves
      connectorInstance.socket.emit('leaveGame');
      // Show modal that someone disconnected with cta: search new game
      this.setState({
        page: Pages.Disconnected,
      });
  });
  }
  selectColor(color) {
    this.connectorInstance.socket.emit('callAction', Games.Ludo.Actions.SelectColor(color));
  }
  roll() {
    this.connectorInstance.socket.emit('callAction', Games.Ludo.Actions.Roll());
  }
  handleClick(e) {
    if (this.state.waitingForAction === Games.Ludo.ActionTypes.PickPawn) {
      if (e && e.pawnIds && e.pawnIds.length) {
        let pawnId = e.pawnIds[0];

        this.connectorInstance.socket.emit('callAction', Games.Ludo.Actions.PickPawn(pawnId, this.state.yourPlayerId));
      }
    } else {
      this.roll();
    }
  }
  joinQueue() {
    this.connectorInstance.socket.emit('findRoom', {
      game: Games.Ludo.Name,
    });
    this.setState({page: Pages.Queue});
  }
  render() {
    let currentModal,
      {gameId, page, players, winnerId, pawns, timestamp, nextRollTimestamp, currentPlayerId, nextRollLength} = this.state,
      playersOverlay,
      profiles;
    
    if (page === Pages.Initial) {
      currentModal = <Modal open={true}>
        <h3>Znajdź grę</h3>
        <div className="buttons-container">
          <Button onClick={this.joinQueue}>START</Button>
        </div>
      </Modal>
    }
    
    if (page === Pages.Queue) {
      currentModal = <Modal open={true}>
        <h3>Szukanie graczy</h3>
        <p>Przewidywany czas 2min</p>
      </Modal>;
    }
    
    if (page === Pages.PickColor) {
      let colors = this.state.queueColors.map((queueColor) => {
        return <div
          className={"color" + (queueColor.selected ? " selected":"")}
          key={queueColor.color}
          style={{background: queueColor.color}}
          onClick={() => { this.selectColor(queueColor.color)}}
        ></div>
      });
      
      currentModal = <Modal open={true}>
        <h3>Wybierz kolor</h3>
        <div className="colors-container">{colors}</div>
      </Modal>;
    }
    
    if (page === Pages.Disconnected) {
      currentModal = <Modal open={true}>
        <h3>Gracz się rozłączył</h3>
        <Button onClick={this.joinQueue}>NOWA GRA</Button>
      </Modal>;
    }
    
    if (page === Pages.Winner) {
      let player = players.find(player => player.id === winnerId);
      
      currentModal = <Modal open={true}>
        <h3>Winner!</h3>
        <div key={player.id} className={"player"}>
          <img src={player.avatar} style={{
            borderRight: "3px solid " + player.color
          }} />
          <div className="player-name">
            {player.name}
          </div>
        </div>
        <Button onClick={this.joinQueue}>NOWA GRA</Button>
      </Modal>
    }
    
    if (players && players.length) {
      profiles = players;
    } else {
      profiles = [{id:0, name: '', avatar: null, color: ''},
        {id:1, name: '', avatar: null, color: ''},
        {id:2, name: '', avatar: null, color: ''},
        {id:3, name: '', avatar: null, color: ''}];
    }
  
    let playerProfiles = profiles.map((player, index) => {
      let startTimestamp = null,
        endTimestamp = null;
      
      if (nextRollTimestamp && player.id === currentPlayerId) {
        startTimestamp = nextRollTimestamp - nextRollLength;
        endTimestamp = nextRollTimestamp;
  
        startTimestamp = Date.now();
        endTimestamp = startTimestamp + 8000;
      }
      
      return <div key={index} className={"player player-" + index + (page !== Pages.Game?' player--hidden':'')}>
        <div className="player-name">
          {player.name}
          {player.id === currentPlayerId && <p className={'arrow ' + (index%2?'right':'left')}></p>}
          <Progress startTimestamp={startTimestamp} endTimestamp={endTimestamp} />
        </div>
        <img src={player.avatar} style={{
          [(index%2?'borderLeft':'borderRight')]: "3px solid " + player.color
        }} />
      </div>;
    });
  
    playersOverlay = <div className="player-profiles">
      {playerProfiles}
    </div>;
    
    return (<div className="ludo">
      <GameComponent
        ref={(element) => {this.gameComponent = element; }}
        onClick={this.handleClick}
        gameId={gameId}
        pawns={pawns}
        players={players}
      />
      {playersOverlay}
      {currentModal}
      {timestamp !== null && <Timer ref={(element) => { this.timerComponent = element; }}/>}
    </div>);
  }
}