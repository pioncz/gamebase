import React, { Component } from 'react';
import GameComponent from 'components/gameComponent/';
import Modal from 'components/modal/index';
import Button from 'components/button/index';
import './index.sass';
import Timer from 'components/timer';
import Games from 'Games.js';
import ClassNames from 'classnames';
import DicesImage from 'dices.svg';
import PlayerProfiles from 'components/PlayerProfiles';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { selectors } from 'shared/redux/api';

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

const filterPlayers = (players, firstPlayerId) => {
  let playerIndex = players && players.findIndex(player => player.id === firstPlayerId),
    parsedPlayers = players && players.slice(0, players.length);
  
  if (!firstPlayerId || !players || playerIndex === -1) {
    return [];
  }
  
  if (playerIndex === 0) {
    return players;
  }
  
  while (parsedPlayers.length < 4) {
    parsedPlayers.push({name: '', avatar: null, color: ''});
  }

  parsedPlayers = parsedPlayers.slice(playerIndex,parsedPlayers.length).concat(parsedPlayers.slice(0,playerIndex));

  return parsedPlayers;
};

class Ludo extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      menuOpened: false,
      page: Pages.Initial,
      // colors that players can pick from
      queueColors: [],
      playerColors: [],
      currentPlayerId: null,
      gameId: null,
      players: [],
      pawns: [],
      winnerId: null,
      timestamp: null,
      nextRollTimestamp: null,
      nextRollLength: null,
      waitingForAction: null,
    };
        
    this.handleBoardClick = this.handleBoardClick.bind(this);
    this.handleDicesClick = this.handleDicesClick.bind(this);
    this.joinQueue = this.joinQueue.bind(this);
    this.selectColor = this.selectColor.bind(this);
    this.initSocketEvents = this.initSocketEvents.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  
    this.timerComponent = null;
    this.connectorInstance = this.props.connectorInstance;
    
    this.props.setInGame();
  }
  componentDidMount() {
    if (this.connectorInstance) {
      this.connectorInstance = this.props.connectorInstance;
      this.initSocketEvents(this.connectorInstance);
    }
    document.addEventListener('keypress', this.onKeyUp);
  }
  componentWillUnmount() {
    if (this.connectorInstance) {
      this.connectorInstance.leaveGame();
    }
    this.props.unsetInGame();
    document.removeEventListener('keypress', this.onKeyUp);
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

        for(let playerIndex in roomState.players) {
          let player = roomState.players[playerIndex],
            playerColor = roomState.playerColors.find(playerColor => playerColor.playerId === player.id);
          
          player.color = playerColor.color;
        }
        
        this.setState({
          gameId: roomState.id,
          players: roomState.players,
          playerColors: roomState.playerColors,
          currentPlayerId: roomState.currentPlayerId,
          page: Pages.Game,
          pawns: roomState.pawns,
          finishTimestamp: roomState.finishTimestamp,
          waitingForAction: Games.Ludo.ActionTypes.Roll,
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
        if (this.props.player && newAction.playerId !== this.props.player.id) return;

        this.gameComponent.engine.selectPawns(newAction.pawnIds);
        
        this.setState({
          waitingForAction: Games.Ludo.ActionTypes.PickPawn,
        });
      }
      if (newAction.type === Games.Ludo.ActionTypes.FinishGame) {
        let winnerId = newAction.winnerId;
  
        this.setState({
          winnerId,
          page: (winnerId?Pages.Winner:this.state.page),
        });
  
        this.timerComponent.stop();
      }
      if (newAction.type === Games.Ludo.ActionTypes.Disconnected) {
        const players = this.state.players,
          playerIndex = players.findIndex(player => player.id === newAction.playerId);
      
        if (newAction.playerId && playerIndex > -1) {
          this.setState({
            players: players.map(player => player.id === newAction.playerId ? {...player, disconnected: true} : player),
          });
        }
      }
    };

    connectorInstance.socket.on('roomUpdate', (roomState) => {
      console.log('roomUpdate', roomState);
      
      let page = (roomState.roomState === 'pickColors') ? Pages.PickColor : Pages.Initial,
        state = roomState.roomState;
      
      if (state === 'pickColors') {
        page = Pages.PickColor;
      } else if (state === 'queue') {
        page = Pages.Queue;
      } else if (roomState.winnerId) {
        page = Pages.Winner;
      } else {
        page = Pages.Initial;
      }
      
      this.setState({
        page,
        players: roomState.players,
        queueColors: roomState.colorsQueue,
      });
    });
    connectorInstance.socket.on('newAction', (newAction) => {
      console.log('newAction', newAction);
      handleAction(newAction);
    });
    connectorInstance.socket.on('playerDisconnected', (e) => {
      console.log('playerDisconnected', e.playerId);
    });
  }
  selectColor(color) {
    this.connectorInstance.socket.emit('callAction', Games.Ludo.Actions.SelectColor(this.props.player.id, color));
  }
  handleDicesClick() {
    this.connectorInstance.socket.emit('callAction', Games.Ludo.Actions.Roll());
  }
  handleBoardClick(e) {
    if (this.state.waitingForAction === Games.Ludo.ActionTypes.PickPawn) {
      if (e && e.pawnIds && e.pawnIds.length) {
        let pawnId = e.pawnIds[0];

        this.connectorInstance.socket.emit('callAction', Games.Ludo.Actions.PickPawn(pawnId, this.props.player.id));
      }
    }
  }
  joinQueue() {
    this.connectorInstance.socket.emit('findRoom', {
      game: Games.Ludo.Name,
    });
    this.setState({page: Pages.Queue});
  }
  onKeyUp(e) {
    if (e.key && e.key === ' ') {
      this.connectorInstance.socket.emit('callAction', Games.Ludo.Actions.Roll());
    }
  }
  render() {
    let currentModal,
      {gameId, page, players, playerColors, winnerId, pawns, finishTimestamp, nextRollTimestamp, currentPlayerId, nextRollLength, waitingForAction} = this.state,
      {player} = this.props,
      diceContainerClass = ClassNames({
        'dices-container': true,
        'dices-container--visible': page === Pages.Game,
        'dices-container--active': player && player.id === currentPlayerId && waitingForAction === Games.Ludo.ActionTypes.Roll,
      }),
      playerColor = player && playerColors.find(playerColor => playerColor.playerId === player.id),
      diceContainerStyle = playerColor && { 
        boxShadow: `inset 0 0 10px ${playerColor.color}`,
    };

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
      let winnerPlayer = players.find(player => player.id === winnerId);
      
      currentModal = <Modal open={true}>
        <h3>Winner!</h3>
        <div className={"player"}>
          <img src={winnerPlayer.avatar} style={{
            border: "6px solid " + winnerPlayer.color
          }} />
          <div className="player-name">
            {winnerPlayer.login}
          </div>
        </div>
        <Button onClick={this.joinQueue}>NOWA GRA</Button>
      </Modal>
    }
        
    return (<div className="ludo">
      <GameComponent
        ref={(element) => {this.gameComponent = element; }}
        onClick={this.handleBoardClick}
        gameId={gameId}
        pawns={pawns}
        players={players}
        firstPlayerId={player.id}
      />
      <PlayerProfiles 
        players={players} 
        firstPlayerId={player.id}
        currentPlayerId={currentPlayerId}
        hidden={page !== Pages.Game}
      />
      {currentModal}
      <div 
        className={diceContainerClass} 
        style={diceContainerStyle}
        onClick={this.handleDicesClick}
      >
        <DicesImage />
      </div>
      {finishTimestamp && <Timer ref={(element) => { this.timerComponent = element; }}/>}
    </div>);
  }
}

const {
  getCurrentPlayer,
} = selectors;

const mapStateToProps = state => ({
  player: getCurrentPlayer(state),
});

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators({
  }, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Ludo);