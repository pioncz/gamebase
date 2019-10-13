import React, { Component, useState, useEffect, useCallback, } from 'react';
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
  match, connectorInstance, setInGame, unsetInGame, dices, player,
}) => {
  const initRoomId = match.params.roomId;
  const [menuOpened, setMenuOpened,] = useState(false);
  const [page, setPage,] = useState(initRoomId ? Pages.Queue : Pages.Initial);
  // colors that players can pick from
  const [queueColors, setQueueColors,] = useState([]);
  const [playerColors, setPlayerColors,] = useState([]);
  const [currentPlayerId, setCurrentPlayerId,] = useState();
  const [roomId, setRoomId,] = useState(initRoomId);
  const [roomName, setRoomName,] = useState();
  const [gameName, setGameName,] = useState();
  const [players, setPlayers,] = useState([]);
  const [pawns, setPawns,] = useState([]);
  const [winnerId, setWinnerId,] = useState();
  const [timestamp, setTimestamp,] = useState();
  const [nextRollTimestamp, setNextRollTimestamp,] = useState();
  const [nextRollLength, setNextRollLength,] = useState();
  const [waitingForAction, setWaitingForAction,] = useState();
  const [activeDice, setActiveDice,] = useState(false);
  const [finishTimestamp, setFinishTimestamp,] = useState();
  const timerComponentRef = React.useRef();
  const profilesComponentRef = React.useRef();
  const gameComponentRef = React.useRef();

  const handleAction2 = useEffect((newAction) => {
    if (newAction.type === Games.Ludo.ActionTypes.SelectedColor) {
      let queueColor = queueColors.find(color => color.color === newAction.value);

      if (queueColor) {
        queueColor.selected = true;
      }

      setQueueColors(queueColors);
    }
    if (newAction.type === Games.Ludo.ActionTypes.StartGame) {
      let gameState = newAction.gameState;

      for(let playerIndex in gameState.players) {
        let player = gameState.players[playerIndex],
          playerColor = gameState.playerColors.find(playerColor => playerColor.playerId === player.id);

        player.color = playerColor.color;
      }

      setPlayers(gameState.players);
      setRoomId(gameState.id);
      setPlayerColors(gameState.playerColors);
      setCurrentPlayerId(gameState.currentPlayerId);
      setPage(Pages.Game);
      setPawns(gameState.pawns);
      setFinishTimestamp(gameState.finishTimestamp);

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
      if (!players.length) { console.log('no players'); return; }

      const actionPlayer = players.find(player => player.id === newAction.playerId);
      const activeDice = player.id === actionPlayer.id && newAction.expectedAction === Games.Ludo.ActionTypes.Roll;

      setCurrentPlayerId(newAction.playerId);
      setWaitingForAction(newAction.expectedAction);
      setActiveDice(activeDice);
    }
    if (newAction.type === Games.Ludo.ActionTypes.Rolled) {
      let player = players.find(player => player.id === currentPlayerId);
      if (!players.length) { console.log('no players'); return; }
      let diceColors = (dices.find(dice => dice.id === player.diceId) || dices[0]).colors;

      gameComponentRef.current.engine.rollDice(newAction.diceNumber, diceColors);
    }
    if (newAction.type === Game.ActionTypes.MovePawn) {
      gameComponentRef.current.movePawn({pawnId: newAction.pawnId, fieldSequence: newAction.fieldSequence,});
    }
    if (newAction.type === Games.Ludo.ActionTypes.SelectPawns) {
      // highlight pawns only for current player
      if (player && newAction.playerId !== player.id) return;

      gameComponentRef.current.engine.selectPawns(newAction.pawnIds);
      profilesComponentRef.current.restartProgress();
    }
    if (newAction.type === Games.Ludo.ActionTypes.FinishGame) {
      let winnerId = newAction.winnerId;

      setWinnerId(winnerId);
      setPage(winnerId ? Pages.Winner: page);
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
  }, []);

  const initSocketEvents = useCallback(() => {
    const handleAction = (newAction) => {
      if (newAction.type === Games.Ludo.ActionTypes.SelectedColor) {
        let queueColor = queueColors.find(color => color.color === newAction.value);

        if (queueColor) {
          queueColor.selected = true;
        }

        setQueueColors(queueColors);
      }
      if (newAction.type === Games.Ludo.ActionTypes.StartGame) {
        let gameState = newAction.gameState;

        for(let playerIndex in gameState.players) {
          let player = gameState.players[playerIndex],
            playerColor = gameState.playerColors.find(playerColor => playerColor.playerId === player.id);

          player.color = playerColor.color;
        }

        setPlayers(gameState.players);
        setRoomId(gameState.id);
        setPlayerColors(gameState.playerColors);
        setCurrentPlayerId(gameState.currentPlayerId);
        setPage(Pages.Game);
        setPawns(gameState.pawns);
        setFinishTimestamp(gameState.finishTimestamp);

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
        if (!players.length) { console.log('no players'); return; }

        const actionPlayer = players.find(player => player.id === newAction.playerId);
        const activeDice = player.id === actionPlayer.id && newAction.expectedAction === Games.Ludo.ActionTypes.Roll;

        setCurrentPlayerId(newAction.playerId);
        setWaitingForAction(newAction.expectedAction);
        setActiveDice(activeDice);
      }
      if (newAction.type === Games.Ludo.ActionTypes.Rolled) {
        let player = players.find(player => player.id === currentPlayerId);
        if (!players.length) { console.log('no players'); return; }
        let diceColors = (dices.find(dice => dice.id === player.diceId) || dices[0]).colors;

        gameComponentRef.current.engine.rollDice(newAction.diceNumber, diceColors);
      }
      if (newAction.type === Game.ActionTypes.MovePawn) {
        gameComponentRef.current.movePawn({pawnId: newAction.pawnId, fieldSequence: newAction.fieldSequence,});
      }
      if (newAction.type === Games.Ludo.ActionTypes.SelectPawns) {
        // highlight pawns only for current player
        if (player && newAction.playerId !== player.id) return;

        gameComponentRef.current.engine.selectPawns(newAction.pawnIds);
        profilesComponentRef.current.restartProgress();
      }
      if (newAction.type === Games.Ludo.ActionTypes.FinishGame) {
        let winnerId = newAction.winnerId;

        setWinnerId(winnerId);
        setPage(winnerId ? Pages.Winner: page);
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
    console.error('players: ', players);
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

      setGameName(gameState.gameName);
      setPlayers(gameState.players);
      setPage(page);
      setQueueColors(gameState.colorsQueue);
    });

    connectorInstance.socket.on('newAction', (newAction) => {
      // Devide lag by 15 minutes, to handle different timezones
      console.log('newAction: ', newAction, ' lag: ', (Math.abs(Date.now() - newAction.timestamp) % (15 * 60 * 1000)));

      handleAction2(newAction);
    });

    connectorInstance.socket.on('socketError', (e) => {
      if (e.code === 1) {
        setPage(Pages.RoomNonExistent);
      }
    });
  }, [handleAction2, connectorInstance, queueColors, players, currentPlayerId, player,]);

  const selectColor = (color) => {
    connectorInstance.socket.emit('callAction', Games.Ludo.Actions.SelectColor(player.id, color));
  };

  const handleDicesClick = () => {
    connectorInstance.socket.emit('callAction', Games.Ludo.Actions.Roll());

    setActiveDice(false);
  };

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
  }, [waitingForAction, player, pawns,]);

  const joinQueue = useCallback(() => {
    const gameName = Games.Ludo.Name;

    connectorInstance.socket.emit('findRoom', {
      game: gameName,
    });
    setPage(Pages.Queue);
    setGameName(gameName);
  }, [connectorInstance,]);

  const joinRoom = useCallback((newRoomId) => {
    connectorInstance.socket.emit('joinRoom', {
      roomId: newRoomId,
    });
    if (roomId !== newRoomId) {
      setPage(Pages.Queue);
      setRoomId(roomId);
    }
  }, [roomId,]);

  const onKeyUp = (e) => {
    if (e.key && e.key === ' ') {
      connectorInstance.socket.emit('callAction', Games.Ludo.Actions.Roll());
    }
  }

  useEffect(() => {
    setInGame();
    if (connectorInstance) {
      initSocketEvents();
    }
    document.addEventListener('keypress', onKeyUp);
    if (roomId) {
      joinRoom(roomId);
    }

    return () => {
      if (connectorInstance) {
        if (connectorInstance.socket) {
          connectorInstance.socket.off('roomUpdate');
          connectorInstance.socket.off('newAction');
          connectorInstance.socket.off('socketError');
        }
        connectorInstance.leaveGame();
      }
      unsetInGame();
      document.removeEventListener('keypress', onKeyUp);
    };
  }, [connectorInstance, roomName, roomId,]);

  let currentModal,
    playerColor = player && playerColors.find(playerColor => playerColor.playerId === player.id),
    color = playerColor && playerColor.color;

  if (page === Pages.Initial) {
    currentModal = <Modal open={true}>
      <h3>Znajdź grę</h3>
      <div className="buttons-container">
        <Button onClick={joinQueue}>START</Button>
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
      <Button onClick={joinQueue}>NOWA GRA</Button>
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
      <Button onClick={joinQueue}>NOWA GRA</Button>
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