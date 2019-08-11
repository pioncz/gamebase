import React, { Component, } from 'react';
import GameComponent from 'components/gameComponent/';
import Modal from 'components/modal/index';
import Button from 'components/button/index';
import './index.sass';
import Timer from 'components/timer';
import Games from 'Games.js';
import Game from 'game/';
import PlayerProfiles from 'components/playerProfiles';
import { bindActionCreators, } from 'redux';
import { connect, } from 'react-redux';
import { selectors, } from 'shared/redux/api';
import SearchingRoom from 'modals/SearchingRoom';
import { withRouter, } from 'react-router-dom';
import RoomNonExistentModal from 'modals/roomNonExistent';
import Snackbar from 'components/snackbar';
import Dices from 'components/dices';

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
      roomName: null,
      gameName: null,
      players: [],
      pawns: [],
      winnerId: null,
      timestamp: null,
      nextRollTimestamp: null,
      nextRollLength: null,
      waitingForAction: null,
    };

    this.timerComponentRef = React.createRef();
    this.profilesComponentRef = React.createRef();
    this.gameComponentRef = React.createRef();
    this.snackbarComponentRef = React.createRef();
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
    const { roomName, } = this.state;
    if (this.connectorInstance) {
      if (this.connectorInstance.socket) {
        this.connectorInstance.socket.off('roomUpdate');
        this.connectorInstance.socket.off('newAction');
        this.connectorInstance.socket.off('socketError');
      }
      this.connectorInstance.leaveGame();
    }
    this.props.unsetInGame();
    document.removeEventListener('keypress', this.onKeyUp);
  }
  initSocketEvents = () => {
    const { dices,} = this.props;

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
        let gameState = newAction.gameState;

        for(let playerIndex in gameState.players) {
          let player = gameState.players[playerIndex],
            playerColor = gameState.playerColors.find(playerColor => playerColor.playerId === player.id);

          player.color = playerColor.color;
        }

        this.setState({
          roomId: gameState.id,
          players: gameState.players,
          playerColors: gameState.playerColors,
          currentPlayerId: gameState.currentPlayerId,
          page: Pages.Game,
          pawns: gameState.pawns,
          finishTimestamp: gameState.finishTimestamp,
        }, () => {
          this.gameComponentRef.current.initGame(newAction.animationLength);
        });
        this.timerComponentRef.current.start(gameState.finishTimestamp - Date.now());
        this.addMessage('Game started!');
      }
      if (newAction.type === Games.Ludo.ActionTypes.RestartProgress) {
        this.profilesComponentRef.current.restartProgress();
      }
      if (newAction.type === Games.Ludo.ActionTypes.StopProgress) {
        this.profilesComponentRef.current.stopProgress();
      }
      if (newAction.type === Games.Ludo.ActionTypes.WaitForPlayer) {
        const { players, currentPlayerId, } = this.state;
        const { player: currentPlayer, } = this.props;
        const player = players.find(player => player.id === newAction.playerId);

        if (currentPlayer.id === player.id) {
          let message;
          if (newAction.expectedAction === Games.Ludo.ActionTypes.Roll) {
            message = 'Your turn. Roll dice!';
          } else {
            message = 'Pick pawn!';
          }
          // Add message if player changed and expected action is roll
          if ((currentPlayerId !== newAction.playerId && newAction.expectedAction === Games.Ludo.ActionTypes.Roll) ||
        (newAction.playerId === currentPlayer.id)) {
            this.addMessage(message, player.color);
          }
        }
        this.setState({
          currentPlayerId: newAction.playerId,
          waitingForAction: newAction.expectedAction,
        });
      }
      if (newAction.type === Games.Ludo.ActionTypes.Rolled) {
        const { players, currentPlayerId, } = this.state;
        const { player: currentPlayer, } = this.props;
        let message;
        let color;
        let player = players.find(player => player.id === currentPlayerId);

        if (player) {
          color = player.color;
          if (currentPlayer.id === currentPlayerId) {
            message = `Rolled ${newAction.diceNumber}!`;
          } else {
            message = `Player ${player.login} rolled ${newAction.diceNumber}`;
          }
          this.addMessage(message, color);
        }
        let diceColors = (dices.find(dice => dice.id === player.diceId) || dices[0]).colors;

        this.gameComponentRef.current.engine.rollDice(newAction.diceNumber, diceColors);
      }
      if (newAction.type === Game.ActionTypes.MovePawn) {
        this.gameComponentRef.current.movePawn({pawnId: newAction.pawnId, fieldSequence: newAction.fieldSequence,});
      }
      if (newAction.type === Games.Ludo.ActionTypes.SelectPawns) {
        // highlight pawns only for current player
        if (this.props.player && newAction.playerId !== this.props.player.id) return;

        this.gameComponentRef.current.engine.selectPawns(newAction.pawnIds);
        this.profilesComponentRef.current.restartProgress();
      }
      if (newAction.type === Games.Ludo.ActionTypes.FinishGame) {
        let winnerId = newAction.winnerId;

        this.setState({
          winnerId,
          page: (winnerId?Pages.Winner:this.state.page),
        });
        this.timerComponentRef.current.stop();
      }
      if (newAction.type === Game.ActionTypes.Disconnected) {
        const players = this.state.players,
          playerIndex = players.findIndex(player => player.id === newAction.playerId);

        if (newAction.playerId && playerIndex > -1) {
          this.setState({
            players: players.map(player => player.id === newAction.playerId ? {...player, disconnected: true,} : player),
          });
        }
      }
      if (newAction.type === Games.Ludo.ActionTypes.PickColors) {
        this.setState({
          players: newAction.gameState.players,
          page: Pages.PickColor,
          queueColors: newAction.gameState.colorsQueue,
        });
      }
    };

    this.connectorInstance.socket.on('roomUpdate', (gameState) => {
      console.log('roomUpdate', gameState);

      let page = (gameState.roomState === 'pickColors') ? Pages.PickColor : Pages.Initial,
        state = gameState.roomState;

      if (state === 'pickColors') {
        page = Pages.PickColor;
      } else if (state === 'queue') {
        page = Pages.Queue;
      } else if (gameState.winnerId) {
        page = Pages.Winner;
      } else if (state === 'game') {
        page = Pages.Game;
      } else {
        page = Pages.Initial;
      }

      this.setState({
        page,
        players: gameState.players,
        queueColors: gameState.colorsQueue,
        gameName: gameState.gameName,
      });
    });
    this.connectorInstance.socket.on('newAction', (newAction) => {
      // Devide lag by 15 minutes, to handle different timezones
      console.log('newAction: ', newAction, ' lag: ', (Math.abs(Date.now() - newAction.timestamp) % (15 * 60 * 1000)));

      handleAction(newAction);
    });
    this.connectorInstance.socket.on('socketError', (e) => {
      if (e.code === 1) {
        this.setState({
          page: Pages.RoomNonExistent,
        });
      }
    });
  }
  addMessage = (message, color) => {
    if (this.snackbarComponentRef && this.snackbarComponentRef.current) {
      this.snackbarComponentRef.current.addMessage(message, color);
    }
  }
  selectColor = (color) => {
    this.connectorInstance.socket.emit('callAction', Games.Ludo.Actions.SelectColor(this.props.player.id, color));
  }
  handleDicesClick = () => {
    this.connectorInstance.socket.emit('callAction', Games.Ludo.Actions.Roll());
  }
  handleBoardClick = (e) => {
    const { pawns, } = this.state;
    const { player, } = this.props;

    if (this.state.waitingForAction === Games.Ludo.ActionTypes.PickPawn) {
      if (e && e.pawnIds && e.pawnIds.length) {
        const filteredPawnIds = e.pawnIds.filter(pawnId => {
          const pawn = pawns.find(pawn => pawn.id === pawnId);
          return pawn && pawn.playerId === player.id;
        });

        if (filteredPawnIds.length) {
          this.connectorInstance.socket.emit('callAction', Games.Ludo.Actions.PickPawn(filteredPawnIds[0], player.id));
        }
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
      {
        roomId,
        gameName,
        page,
        players,
        playerColors,
        winnerId,
        pawns,
        finishTimestamp,
        nextRollTimestamp,
        currentPlayerId,
        nextRollLength,
        waitingForAction,
      } = this.state,
      {player,} = this.props,
      playerColor = player && playerColors.find(playerColor => playerColor.playerId === player.id),
      color = playerColor && playerColor.color;

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
        ref={this.gameComponentRef}
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
        ref={this.profilesComponentRef}
      />
      {currentModal}
      <Dices
        visible={page === Pages.Game}
        active={player && player.id === currentPlayerId && waitingForAction === Games.Ludo.ActionTypes.Roll}
        onClick={this.handleDicesClick}
        color={color}
      />
      <Timer ref={this.timerComponentRef} />
      <Snackbar ref={this.snackbarComponentRef} />
    </div>);
  }
}

const {
  getCurrentPlayer,
  getCurrentDices,
} = selectors;

const mapStateToProps = state => ({
  player: getCurrentPlayer(state),
  dices: getCurrentDices(state),
});

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators({
  }, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(Room));