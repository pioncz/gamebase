import React, { Component } from 'react';
import GameComponent from 'components/gameComponent/index.jsx';
import InitialPage from './initialPage.jsx';
import Modal from 'components/modal/index.jsx';
import Button from 'components/button/index.jsx';
import './index.sass';

const Pages = {
  Initial: 'Initial',
  Queue: 'Queue',
  PickColor: 'PickColor',
  Game: 'Game',
  Win: 'Win',
  Loose: 'Loose',
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
    };
    
    this.handleClick = this.handleClick.bind(this);
    this.joinQueue = this.joinQueue.bind(this);
    this.selectColor = this.selectColor.bind(this);
    this.roll = this.roll.bind(this);
    this.initSocketEvents = this.initSocketEvents.bind(this);
    
    if (this.props.connectorInstance) {
      this.initSocketEvents(this.props.connectorInstance);
    }
    
    this.props.setInGame();
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.connectorInstance && nextProps.connectorInstance) {
      this.initSocketEvents(nextProps.connectorInstance);
    }
  }
  componentWillUnmount() {
    if (this.connectorInstance) {
      this.connectorInstance.leaveGame();
    }
    this.props.unsetInGame();
  }
  initSocketEvents(connectorInstance) {
    this.connectorInstance = connectorInstance;
    connectorInstance.socket.on('pickColor', (queueColors) => {
      this.setState({
        page: Pages.PickColor,
        queueColors,
      });
    });
    connectorInstance.socket.on('startGame', (gameState) => {
      connectorInstance.addMessage('startGame');
      console.log(gameState);
      connectorInstance.addMessage('currentPlayer: ' + gameState.currentPlayerId + (gameState.yourPlayerId == gameState.currentPlayerId?' it\'s You!':''));
      this.setState({
        players: gameState.players,
        currentPlayerId: gameState.currentPlayerId,
        yourPlayerId: gameState.yourPlayerId,
        page: Pages.Game,
      });
    });
    connectorInstance.socket.on('pawnMove', (pawnMove) => {
      connectorInstance.addMessage(`pawnMove length: ${pawnMove.length} diceNumber: ${pawnMove.diceNumber}`);
      this.gameComponent.movePawn(pawnMove);
    });
    connectorInstance.socket.on('updateGame', (newGameState) => {
      console.log(newGameState);
      this.setState({
        currentPlayerId: newGameState.currentPlayerId
      });
    });
    connectorInstance.socket.on('updatePlayers', (newPlayers) => {
      console.log(newPlayers);
    });
  }
  selectColor(color) {
    this.props.connectorInstance.socket.emit('selectColor', color);
  }
  roll() {
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
      page = this.state.page,
      players = this.state.players,
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
    
    if (players && players.length) {
      let playerProfiles = players.map((player, index) => {
        return <div key={player.id} className={"player player-" + index}>
          <div className="player-name">{player.name}</div>
          <img src={player.avatar} style={{
            border: "3px solid " + player.color
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
        pawns={this.props.pawns}
        players={this.props.player}
      />
      {playersOverlay}
      {currentModal}
    </div>);
  }
}