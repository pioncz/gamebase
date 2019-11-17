import React, { useState, useRef, useCallback, useEffect, } from 'react';
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

const Room = ({
  player, connectorInstance, setInGame, unsetInGame, match, dices,
}) => {
  const [players, setPlayers,] = useState([]);
  const [playerColors, setPlayerColors,] = useState([]);
  const [roomId, setRoomId,] = useState(match.params.roomId);
  const [page, setPage,] = useState(roomId ? Pages.Queue : Pages.Initial);
  const [winnerId, setWinnerId,] = useState();
  const [gameName, setGameName,] = useState();
  const [pawns, setPawns,] = useState();
  const [activeDice, setActiveDice,] = useState();
  const [currentPlayerId, setCurrentPlayerId,] = useState();
  const [waitingForAction, setWaitingForAction,] = useState();
  const [queueColors, setQueueColors,] = useState([]);
  const gameComponentRef = useRef();
  const timerComponentRef = useRef();
  const profilesComponentRef = useRef();

  const handleBoardClick = useCallback((e) => {
    if (waitingForAction === Games.Ludo.ActionTypes.PickPawn) {
      if (e && e.pawnIds && e.pawnIds.length) {
        const filteredPawnIds = e.pawnIds.filter(pawnId => {
          const pawn = pawns.find(pawn => pawn.id === pawnId);
          return pawn && pawn.playerId === player.id;
        });

        if (filteredPawnIds.length) {
          connectorInstance.socket.emit('callAction', Games.Ludo.Actions.PickPawn(filteredPawnIds[0], player.id));
        }
      }
    }
  }, [pawns, player.id, waitingForAction, connectorInstance,]);

  const handleDicesClick = useCallback(() => {
    connectorInstance.socket.emit('callAction', Games.Ludo.Actions.Roll());
    setActiveDice(false);
  }, [connectorInstance,]);

  const onKeyUp = (e) => {
    if (e.key && e.key === ' ') {
      connectorInstance.socket.emit('callAction', Games.Ludo.Actions.Roll());
      setActiveDice(false);
    }
  };

  const joinRoom = useCallback((newRoomId) => {
    connectorInstance.socket.emit('joinRoom', {
      roomId: newRoomId,
    });
    if (roomId !== newRoomId) {
      setRoomId(roomId);
      setPage(Pages.Queue);
    }
  }, [connectorInstance, roomId,]);

  useEffect(() => {
    const handleAction = (newAction) => {
      // Devide lag by 15 minutes, to handle different timezones
      console.log('newAction: ', newAction, ' lag: ', (Math.abs(Date.now() - newAction.timestamp) % (15 * 60 * 1000)));

      if (newAction.type === Games.Ludo.ActionTypes.SelectedColor) {
        setQueueColors(
          queueColors.map(queueColor => queueColor.color === newAction.value ? { ...queueColor, selected: true,} : queueColor)
        );
      }

      if (newAction.type === Games.Ludo.ActionTypes.StartGame) {
        let gameState = newAction.gameState;

        for(let playerIndex in gameState.players) {
          let player = gameState.players[playerIndex],
            playerColor = gameState.playerColors.find(playerColor => playerColor.playerId === player.id);

          player.color = playerColor.color;
        }

        setRoomId(gameState.id);
        setPlayers(gameState.players);
        setPlayerColors(gameState.playerColors);
        setCurrentPlayerId(gameState.currentPlayerId);
        setPage(Pages.Game);
        setPawns(gameState.pawns);

        gameComponentRef.current.initGame(newAction.animationLength);
        timerComponentRef.current.start(gameState.finishTimestamp - Date.now());
      }
      if (newAction.type === Games.Ludo.ActionTypes.RestartProgress) {
        profilesComponentRef.current.restartProgress();
      }
      if (newAction.type === Games.Ludo.ActionTypes.StopProgress) {
        profilesComponentRef.current.stopProgress();
      }
      if (newAction.type === Games.Ludo.ActionTypes.WaitForPlayer) {
        const waitingPlayer = players.find(player => player.id === newAction.playerId);
        const activeDice = player.id === waitingPlayer.id && newAction.expectedAction === Games.Ludo.ActionTypes.Roll;

        setCurrentPlayerId(newAction.playerId);
        setWaitingForAction(newAction.expectedAction);
        setActiveDice(activeDice);
      }
      if (newAction.type === Games.Ludo.ActionTypes.Rolled) {
        let rollPlayer = players.find(player => player.id === currentPlayerId);
        let diceColors = (dices.find(dice => dice.id === rollPlayer.diceId) || dices[0]).colors;

        gameComponentRef.current.engine.rollDice(newAction.diceNumber, diceColors);
      }
      if (newAction.type === Game.ActionTypes.MovePawn) {
        gameComponentRef.current.movePawn({pawnId: newAction.pawnId, fieldSequence: newAction.fieldSequence,});
      }
      if (newAction.type === Games.Ludo.ActionTypes.SelectPawns) {
        // highlight pawns only for current player
        if (newAction.playerId !== player.id) return;

        gameComponentRef.current.engine.selectPawns(newAction.pawnIds);
        profilesComponentRef.current.restartProgress();
      }
      if (newAction.type === Games.Ludo.ActionTypes.FinishGame) {
        let winnerId = newAction.winnerId;

        setWinnerId(winnerId);
        setPage(winnerId ? Pages.Winner : page);
        timerComponentRef.current.stop();
      }
      if (newAction.type === Game.ActionTypes.Disconnected) {
        const playerIndex = players.findIndex(player => player.id === newAction.playerId);

        if (newAction.playerId && playerIndex > -1) {
          setPlayers(players.map(player => player.id === newAction.playerId ? {...player, disconnected: true,} : player));
        }
      }
      if (newAction.type === Games.Ludo.ActionTypes.PickColors) {
        setPlayers(newAction.gameState.players);
        setQueueColors(newAction.gameState.colorsQueue);
        setPage(Pages.PickColor);
      }
    };

    connectorInstance.socket.on('roomUpdate', (gameState) => {
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

      setPage(page);
      setPlayers(gameState.players);
      setQueueColors(gameState.colorsQueue);
      setGameName(gameState.gameName);
    });
    connectorInstance.socket.on('newAction', handleAction);
    connectorInstance.socket.on('socketError', (e) => {
      if (e.code === 1) {
        setPage(Pages.RoomNonExistent);
      }
    });
    return () => {
      connectorInstance.socket.off('roomUpdate');
      connectorInstance.socket.off('newAction');
      connectorInstance.socket.off('socketError');
    }
  }, [connectorInstance.socket, queueColors, players, currentPlayerId, player, dices, page, winnerId, ]);

  const selectColor = (color) => {
    connectorInstance.socket.emit('callAction', Games.Ludo.Actions.SelectColor(player.id, color));
  };

  useEffect(() => {
    setInGame();
    document.addEventListener('keypress', onKeyUp);
    if (roomId) {
      joinRoom(roomId);
    }

    return () => {
      unsetInGame();
      document.removeEventListener('keypress', onKeyUp);
      connectorInstance.socket.off('roomUpdate');
      connectorInstance.socket.off('newAction');
      connectorInstance.socket.off('socketError');
      connectorInstance.leaveGame();
    };
  }, []); // eslint-disable-line

  useEffect(() => {

  }, [roomId,]);

  const playerColor = player && playerColors.find(playerColor => playerColor.playerId === player.id),
    color = playerColor && playerColor.color;
  let currentModal;

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
    let colors = queueColors.map((queueColor) => {
      return <div
        className={"color" + (queueColor.selected ? " selected":"")}
        key={queueColor.color}
        style={{background: queueColor.color,}}
        onClick={() => { selectColor(queueColor.color)}}
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

  return (
    <div className="room">
      <GameComponent
        ref={gameComponentRef}
        onClick={handleBoardClick}
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
        ref={profilesComponentRef}
      />
      {currentModal}
      <Dices
        visible={page === Pages.Game}
        active={activeDice}
        onClick={handleDicesClick}
        color={color}
      />
      <Timer ref={timerComponentRef} />
    </div>
  );
};

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