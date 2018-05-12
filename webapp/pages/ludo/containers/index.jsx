import React, { Component } from 'react';
import GameComponent from 'components/gameComponent/';
import InitialPage from './initialPage';
import Modal from 'components/modal/index';
import Button from 'components/button/index';
import './index.sass';
import Timer from 'components/timer';

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

export default class Ludo extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      menuOpened: false,
      page: Pages.Initial,
      yourPlayerId: null,
      queueColors: [],
      currentPlayerId: null,
      players: [],
      pawns: [],
      winner: null,
      timestamp: null,
    };
    
    this.handleClick = this.handleClick.bind(this);
    this.joinQueue = this.joinQueue.bind(this);
    this.selectColor = this.selectColor.bind(this);
    this.roll = this.roll.bind(this);
    this.initSocketEvents = this.initSocketEvents.bind(this);
  
    this.timerComponent = null;
    
    this.props.setInGame();
  }
  componentDidMount() {
    if (this.props.connectorInstance) {
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
    connectorInstance.socket.on('pickColor', (queueColors) => {
      this.setState({
        page: Pages.PickColor,
        queueColors,
      });
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
        winner: newGameState.winner,
        page: (newGameState.winner?Pages.Winner:this.state.page),
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
    this.props.connectorInstance.socket.emit('selectColor', color);
  }
  roll() {
    //this.gameComponent.engine.board.dice.roll(1);
    this.props.connectorInstance.socket.emit('roll');
  }
  handleClick() {
    this.roll();
  }
  joinQueue() {
    if (this.props.connectorInstance) {
      this.props.connectorInstance.joinQueue({
        game: 'ludo'
      });
    }
    this.setState({page: Pages.Queue});
  }
  render() {
    let currentModal,
      {page, players, winner, pawns, timestamp} = this.state,
      playersOverlay;
    
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
      let player = players.find(player => player.id === winner);
      
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
      let playerProfiles = players.map((player, index) => {
        return <div key={player.id} className={"player player-" + index}>
          <div className="player-name">
            {player.name}
            {player.id === this.state.currentPlayerId && <p className={'arrow ' + (index%2?'right':'left')}></p>}
          </div>
          <img src={player.avatar} style={{
            [(index%2?'borderLeft':'borderRight')]: "3px solid " + player.color
          }} />
        </div>;
      });
  
      playersOverlay = <div className="player-profiles">
        {playerProfiles}
      </div>;
    }
    
    return (<div className="ludo">
      <GameComponent
        ref={(element) => {this.gameComponent = element; }}
        onClick={this.handleClick}
        pawns={pawns}
        players={players}
      />
      {playersOverlay}
      {currentModal}
      {timestamp !== null && <Timer ref={(element) => { this.timerComponent = element; }}/>}
    </div>);
  }
}