import React, { Component, } from 'react';
import GameComponent from 'components/gameComponent/';
import Modal from 'components/modal/index';
import Button from 'components/button/index';
import './index.sass';
import Timer from 'components/timer';
import Games from 'Games.js';
import ClassNames from 'classnames';
import DicesImage from 'dices.svg';
import PlayerProfiles from 'components/playerProfiles';
import { bindActionCreators, } from 'redux';
import { connect, } from 'react-redux';
import { selectors, } from 'shared/redux/api';
import SearchingRoom from 'modals/SearchingRoom';
import { withRouter, } from 'react-router-dom';
import RoomNonExistentModal from 'modals/roomNonExistent';

const Pages = {
  Initial: 'Initial',
  Queue: 'Queue',
  PickColor: 'PickColor',
  Game: 'Game',
  Win: 'Win',
  Loose: 'Loose',
  Disconnected: 'Disconnected',
  Winner: 'Winner',
  RoomNonExistent: 'RoomNonExistent',
};

class Room extends Component {
  constructor(props) {
    super(props);

    const roomId = props.match.params.roomId;

    this.state = {
      menuOpened: false,
      page: roomId ? Pages.Queue : Pages.Initial,
      // colors that players can pick from
      queueColors: [],
      playerColors: [],
      currentPlayerId: null,
      roomId: null,
      gameName: null,
      players: [],
      pawns: [],
      winnerId: null,
      timestamp: null,
      nextRollTimestamp: null,
      nextRollLength: null,
      waitingForAction: null,
    };

    this.timerComponent = null;
    this.connectorInstance = this.props.connectorInstance;

    this.props.setInGame();
    if (roomId) {
      this.joinRoom(roomId);
    }
  }
  componentDidMount() {
    if (this.connectorInstance) {
      this.initSocketEvents();
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
  initSocketEvents = () => {
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
          roomId: roomState.id,
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
      if (newAction.type === Games.Ludo.ActionTypes.RestartProgress) {
        this.profilesComponent.restartProgress();
      }
      if (newAction.type === Games.Ludo.ActionTypes.StopProgress) {
        this.profilesComponent.stopProgress();
      }
      if (newAction.type === Games.Ludo.ActionTypes.WaitForPlayer) {
        this.setState({
          currentPlayerId: newAction.playerId,
          waitingForAction: newAction.expectedAction,
        });
      }
      if (newAction.type === Games.Ludo.ActionTypes.Roll) {
        this.gameComponent.engine.board.dice.roll(newAction.diceNumber);
      }
      if (newAction.type === Games.Ludo.ActionTypes.MovePawn) {
        this.gameComponent.movePawn({pawnId: newAction.pawnId, fieldSequence: newAction.fieldSequence,});
      }
      if (newAction.type === Games.Ludo.ActionTypes.SelectPawns) {
        // highlight pawns only for current player
        if (this.props.player && newAction.playerId !== this.props.player.id) return;

        this.gameComponent.engine.selectPawns(newAction.pawnIds);
        this.profilesComponent.restartProgress();
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
            players: players.map(player => player.id === newAction.playerId ? {...player, disconnected: true,} : player),
          });
        }
      }
    };

    this.connectorInstance.socket.on('roomUpdate', (roomState) => {
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
        gameName: roomState.gameName,
      });
    });
    this.connectorInstance.socket.on('newAction', (newAction) => {
      console.log('newAction', newAction);
      handleAction(newAction);
    });
    this.connectorInstance.socket.on('playerDisconnected', (e) => {
      console.log('playerDisconnected', e.playerId);
    });
    this.connectorInstance.socket.on('socketError', (e) => {
      if (e.code === 1) {
        this.setState({
          page: Pages.RoomNonExistent,
        })
      }
    });
  }
  selectColor = (color) => {
    this.connectorInstance.socket.emit('callAction', Games.Ludo.Actions.SelectColor(this.props.player.id, color));
  }
  handleDicesClick = () => {
    this.connectorInstance.socket.emit('callAction', Games.Ludo.Actions.Roll());
  }
  handleBoardClick = (e) => {
    if (this.state.waitingForAction === Games.Ludo.ActionTypes.PickPawn) {
      if (e && e.pawnIds && e.pawnIds.length) {
        let pawnId = e.pawnIds[0];

        this.connectorInstance.socket.emit('callAction', Games.Ludo.Actions.PickPawn(pawnId, this.props.player.id));
      }
    }
  }
  joinQueue = () => {
    const gameName = Games.Ludo.Name;

    this.connectorInstance.socket.emit('findRoom', {
      game: gameName,
    });
    this.setState({
      page: Pages.Queue,
      gameName: gameName,
    });
  }
  joinRoom = (roomId) => {
    this.connectorInstance.socket.emit('joinRoom', {
      roomId,
    });
    this.setState({
      page: Pages.Queue,
      roomId: roomId,
    })
  }
  onKeyUp = (e) => {
    if (e.key && e.key === ' ') {
      this.connectorInstance.socket.emit('callAction', Games.Ludo.Actions.Roll());
    }
  }
  render() {
    let currentModal,
      {roomId, gameName, page, players, playerColors, winnerId, pawns, finishTimestamp, nextRollTimestamp, currentPlayerId, nextRollLength, waitingForAction, } = this.state,
      {player,} = this.props,
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
      currentModal = <SearchingRoom />
    }

    if (page === Pages.PickColor) {
      let colors = this.state.queueColors.map((queueColor) => {
        return <div
          className={"color" + (queueColor.selected ? " selected":"")}
          key={queueColor.color}
          style={{background: queueColor.color,}}
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
            border: "6px solid " + winnerPlayer.color,
          }} />
          <div className="player-name">
            {winnerPlayer.login}
          </div>
        </div>
        <Button onClick={this.joinQueue}>NOWA GRA</Button>
      </Modal>
    }

    if (page === Pages.RoomNonExistent) {
      currentModal = <RoomNonExistentModal />
    }

    return (<div className="room">
      <GameComponent
        ref={(element) => {this.gameComponent = element; }}
        onClick={this.handleBoardClick}
        gameId={roomId}
        gameName={gameName}
        pawns={pawns}
        players={players}
        firstPlayerId={player.id}
      />
      <PlayerProfiles
        players={players}
        firstPlayerId={player.id}
        currentPlayerId={currentPlayerId}
        hidden={page !== Pages.Game}
        roundLength={Games.Ludo.Config.RoundLength}
        ref={(element) => {this.profilesComponent = element; }}
      />
      {currentModal}
      <div
        className={diceContainerClass}
        style={diceContainerStyle}
        onClick={this.handleDicesClick}
      >
        <DicesImage />
      </div>
      <Timer ref={(element) => { this.timerComponent = element; }}/>
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
)(withRouter(Room));