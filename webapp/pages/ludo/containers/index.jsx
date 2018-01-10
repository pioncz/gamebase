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
      player: {
        name: '',
      },
      queueColors: [],
      players: [],
    };
    
    this.handleClick = this.handleClick.bind(this);
    this.joinQueue = this.joinQueue.bind(this);
    this.selectColor = this.selectColor.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.connectorInstance && nextProps.connectorInstance) {
      nextProps.connectorInstance.socket.on('pickColor', (queueColors) => {
        this.setState({
          page: Pages.PickColor,
          queueColors
        });
      });
      nextProps.connectorInstance.socket.on('startGame', (gameState) => {
        console.log(gameState);
        this.setState({
          players: gameState.players,
          page: Pages.Game,
        });
      });
      nextProps.connectorInstance.socket.on('updateGame', () => {
      
      });
    }
  }
  selectColor(color) {
    this.props.connectorInstance.socket.emit('selectColor', color);
  }
  handleClick() {
    let a = parseInt(Math.random()*4)*4,
      b = Math.ceil(Math.random()*6);

    this.gameComponent.movePen(a, b);
  }
  joinQueue() {
    if (this.props.connectorInstance) {
      this.props.connectorInstance.joinQueue({
        game: 'ludo'
      });
    }
    if (this.initialModal) {
      this.initialModal.close();
    }
    this.setState({page: Pages.Queue});
  }
  render() {
    let currentModal,
      page = this.state.page,
      players = this.state.players,
      playersOverlay;
    
    if (page === Pages.Initial) {
      currentModal = <Modal ref={(element) => {this.initialModal = element;}}>
        <h3>Znajdź grę</h3>
        <div className="buttons-container">
          <Button onClick={this.joinQueue}>START</Button>
        </div>
      </Modal>
    }
    if (page === Pages.Queue) {
      currentModal = <Modal ref={(element) => {this.queueModal = element;}}>
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
      
      currentModal = <Modal ref={(element) => {this.queueModal = element;}}>
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