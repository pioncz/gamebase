import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useContext,
} from 'react';
import GameComponent, {
  GameComponentHandle,
} from '@/components/GameComponent/GameComponent';
import Games from '@/../../games/Games.js';
import Game from '@/../../games/game/index.js';
import { useSelector } from 'react-redux';
import { getDices, getPlayer, setInGame } from '@/store/GameSlice';
import WSConnectorContext from '@/contexts/WSConnector/WSConnectorContext';
import { useAppDispatch } from '@/store/store';
import { useNavigate, useParams } from 'react-router';
import { GameAction, Pawn, Player, PlayerColor } from '@/lib/types';
import SearchingRoomModal from '@/components/SearchingRoomModal/SearchingRoomModal';
import Progress from '@/components/Progress/Progress';
import Modal from '@/components/Modal/Modal';
import Button from '@/components/Button/Button';
import RoomNonExistentModal from '@/components/RoomNonExistentModal/RoomNonExistentModal';
import PlayerProfiles, {
  PlayerProfilesHandle,
} from '@/components/PlayerProfiles/PlayerProfiles';
import Dices from '@/components/Dices/Dices';
import Timer, { TimerHandle } from '@/components/Timer/Timer';
import { styled } from '@/lib/stitches.config';

const Pages = {
  Queue: 'Queue',
  PickColor: 'PickColor',
  Game: 'Game',
  Win: 'Win',
  Loose: 'Loose',
  Disconnected: 'Disconnected',
  Winner: 'Winner',
  RoomNonExistent: 'RoomNonExistent',
};

const RoomPage = () => {
  const player = useSelector(getPlayer);
  const dices = useSelector(getDices);
  const { roomId: paramsRoomId } = useParams();
  const { socket } = useContext(WSConnectorContext);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerColors, setPlayerColors] = useState<PlayerColor[]>([]);
  const [roomId, setRoomId] = useState(paramsRoomId);
  const [page, setPage] = useState(Pages.Queue);
  const [winnerId, setWinnerId] = useState('');
  const [gameName, setGameName] = useState('');
  const [activeDice, setActiveDice] = useState(false);
  const [currentPlayerId, setCurrentPlayerId] = useState('');
  const [waitingForAction, setWaitingForAction] = useState('');
  const [queueColors, setQueueColors] = useState<
    {
      selected: boolean;
      color: string;
    }[]
  >([]);
  const gameComponentRef = useRef<GameComponentHandle>(null);
  const timerComponentRef = useRef<TimerHandle>(null);
  const profilesComponentRef = useRef<PlayerProfilesHandle>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleBoardClick = useCallback(
    (e: { pawnId: string }) => {
      if (
        waitingForAction === Games.Ludo.ActionTypes.PickPawn &&
        e?.pawnId
      ) {
        socket?.emit(
          'callAction',
          Games.Ludo.Actions.PickPawn(e.pawnId, player.id),
        );
      }
    },
    [player.id, waitingForAction, socket],
  );

  const handleDicesClick = useCallback(() => {
    socket?.emit('callAction', Games.Ludo.Actions.Roll());
    setActiveDice(false);
  }, [socket]);

  const joinRoom = useCallback(
    (newRoomId: string) => {
      socket?.emit('joinRoom', {
        roomId: newRoomId,
      });
      if (roomId !== newRoomId) {
        setRoomId(roomId);
        setPage(Pages.Queue);
      }
    },
    [socket, roomId],
  );

  const joinQueue = useCallback(
    (gameName: string) => {
      socket?.on('roomUpdate', (gameState) => {
        navigate(`/room/${gameState.id}`);
      });
      socket?.emit('findRoom', {
        game: gameName,
      });
    },
    [socket, navigate],
  );

  useEffect(() => {
    const handleAction = (newAction: GameAction) => {
      // Divide lag by 15 minutes, to handle different timezones
      // console.log('newAction: ', newAction, ' lag: ', (Math.abs(Date.now() - newAction.timestamp) % (15 * 60 * 1000)));

      if (newAction.type === Games.Ludo.ActionTypes.SelectedColor) {
        setQueueColors(
          queueColors.map((queueColor) =>
            queueColor.color === newAction.value
              ? { ...queueColor, selected: true }
              : queueColor,
          ),
        );
      }
      if (
        newAction.type === Games.Ludo.ActionTypes.StartGame &&
        newAction.gameState
      ) {
        const gameState = newAction.gameState;

        for (const playerIndex in gameState.players) {
          const player = gameState.players[playerIndex];
          const playerColor = gameState.playerColors.find(
            (playerColor) => playerColor.playerId === player.id,
          );

          player.color = playerColor?.color;
        }

        setRoomId(gameState.id);
        setPlayers(gameState.players);
        setPlayerColors(gameState.playerColors);
        setCurrentPlayerId(gameState.currentPlayerId);
        setPage(Pages.Game);
        gameComponentRef.current?.initGame(
          newAction.animationLength || 0,
          gameState.pawns,
          gameState.players,
        );
        timerComponentRef.current?.start(
          gameState.finishTimestamp - Date.now(),
        );
      }
      if (newAction.type === Games.Ludo.ActionTypes.WaitForPlayer) {
        const waitingPlayer = players.find(
          (player) => player.id === newAction.playerId,
        );
        const activeDice =
          player.id === waitingPlayer?.id &&
          newAction?.expectedAction === Games.Ludo.ActionTypes.Roll;
        setCurrentPlayerId(newAction.playerId || '');
        setWaitingForAction(newAction.expectedAction || '');
        setActiveDice(activeDice);
        profilesComponentRef.current?.restartProgress();
      }
      if (newAction.type === Games.Ludo.ActionTypes.Rolled) {
        const rollPlayer = players.find(
          (player) => player.id === currentPlayerId,
        );
        const diceColors = (
          dices.find((dice) => dice.id === rollPlayer?.diceId) ||
          dices[0]
        ).colors;

        gameComponentRef.current?.rollDice(
          newAction.diceNumber,
          diceColors,
        );
        profilesComponentRef.current?.stopProgress();
      }
      if (newAction.type === Game.ActionTypes.MovePawn) {
        gameComponentRef.current?.movePawn({
          pawnId: newAction.pawnId || '',
          fieldSequence: newAction.fieldSequence || [],
        });
        profilesComponentRef.current?.stopProgress();
      }
      if (newAction.type === Games.Ludo.ActionTypes.SelectPawns) {
        // highlight pawns only for current player
        if (newAction.playerId !== player.id) return;

        gameComponentRef.current?.selectPawns(
          newAction.pawnIds || [],
        );
      }
      if (newAction.type === Games.Ludo.ActionTypes.FinishGame) {
        const winnerId = newAction.winnerId || '';

        setWinnerId(winnerId);
        setPage(winnerId ? Pages.Winner : page);
        timerComponentRef.current?.stop();
        setTimeout(() => {
          gameComponentRef.current?.clearGame();
        }, 300);
      }
      if (newAction.type === Game.ActionTypes.Disconnected) {
        const playerIndex = players.findIndex(
          (player) => player.id === newAction.playerId,
        );

        if (newAction.playerId && playerIndex > -1) {
          setPlayers(
            players.map((player) =>
              player.id === newAction.playerId
                ? { ...player, disconnected: true }
                : player,
            ),
          );
        }
      }
      if (
        newAction.type === Games.Ludo.ActionTypes.PickColors &&
        newAction.gameState
      ) {
        setPlayers(newAction.gameState.players);
        setQueueColors(newAction.gameState.colorsQueue || []);
        setPage(Pages.PickColor);
      }
    };

    socket?.on('roomUpdate', (gameState) => {
      const state = gameState.roomState;
      let page;

      if (state === 'pickColors') {
        page = Pages.PickColor;
      } else if (state === 'queue') {
        page = Pages.Queue;
      } else if (gameState.winnerId) {
        page = Pages.Winner;
      } else if (state === 'game') {
        page = Pages.Game;
      } else {
        page = Pages.Queue;
      }

      setGameName(gameState.gameName);
      setPage(page);
      setPlayers(gameState.players);
      setQueueColors(gameState.colorsQueue);
    });
    socket?.on('newAction', handleAction);
    socket?.on('socketError', (e) => {
      if (e.code === 1) {
        setPage(Pages.RoomNonExistent);
      }
    });
    return () => {
      socket?.off('roomUpdate');
      socket?.off('newAction');
      socket?.off('socketError');
    };
  }, [
    socket,
    queueColors,
    players,
    currentPlayerId,
    player,
    dices,
    page,
    winnerId,
  ]);

  const selectColor = (color: string) => {
    socket?.emit(
      'callAction',
      Games.Ludo.Actions.SelectColor(player.id, color),
    );
  };

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e?.key === ' ') {
        socket?.emit('callAction', Games.Ludo.Actions.Roll());
        setActiveDice(false);
      }
    };

    dispatch(setInGame(true));
    document.addEventListener('keypress', onKeyUp);
    if (roomId) {
      joinRoom(roomId);
    }

    return () => {
      dispatch(setInGame(false));
      document.removeEventListener('keypress', onKeyUp);
      socket?.off('roomUpdate');
      socket?.off('newAction');
      socket?.off('socketError');
      socket?.emit('leaveGame');
    };
  }, []); // eslint-disable-line

  const playerColor =
      player &&
      playerColors.find(
        (playerColor) => playerColor.playerId === player.id,
      ),
    color = playerColor && playerColor.color;
  let currentModal;

  if (page === Pages.Queue) {
    currentModal = <SearchingRoomModal />;
  }

  if (page === Pages.PickColor && gameName) {
    const colors = queueColors.map((queueColor) => {
      return (
        <div
          className={
            'color' + (queueColor.selected ? ' selected' : '')
          }
          key={queueColor.color}
          style={{ background: queueColor.color }}
          onClick={() => {
            selectColor(queueColor.color);
          }}
        ></div>
      );
    });

    currentModal = (
      <Modal>
        <h3>Wybierz kolor</h3>
        <div className="progress-container">
          <Progress
            length={Games[gameName].Config.SelectColorLength}
          />
        </div>
        <div className="colors-container">{colors}</div>
      </Modal>
    );
  }

  if (page === Pages.Disconnected) {
    currentModal = (
      <Modal>
        <h3>Gracz się rozłączył</h3>
        <Button onClick={() => joinQueue(gameName)}>NOWA GRA</Button>
      </Modal>
    );
  }

  if (page === Pages.Winner) {
    const winnerPlayer = players.find(
      (player) => player.id === winnerId,
    );

    currentModal = (
      <Modal>
        <h3>Winner!</h3>
        <div className={'player'}>
          <img
            src={winnerPlayer?.avatar}
            style={{
              border: '6px solid ' + winnerPlayer?.color,
            }}
          />
          <div className="player-name">{winnerPlayer?.login}</div>
        </div>
        <Button onClick={() => joinQueue(gameName)}>NOWA GRA</Button>
      </Modal>
    );
  }

  if (page === Pages.RoomNonExistent) {
    currentModal = <RoomNonExistentModal />;
  }

  return (
    <Root className="room">
      <GameComponent
        ref={gameComponentRef}
        onClick={handleBoardClick}
        gameId={roomId}
        gameName={gameName}
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
    </Root>
  );
};

const Root = styled('div', {
  position: 'absolute',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  top: 0,
  left: 0,
  userSelect: 'none',

  '.progress-container': {
    width: '100%',
    position: 'relative',
    height: '4px',
    marginBottom: '12px',
    background: 'rgba(0,0,0,0.6)',
  },

  '.colors-container': {
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: '$1',
    flexWrap: 'wrap',

    '.color': {
      width: '32px',
      height: '32px',
      margin: '5px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '2px',
      cursor: 'pointer',

      '&.selected': {
        opacity: 0.2,
      },
    },
  },

  '.modal': {
    '.player': {
      marginBottom: '20px',

      img: {
        borderRadius: '1px',
      },

      '.player-name': {
        fontSize: '22px',
        padding: '6px 0 0',
      },
    },
  },
});

export default RoomPage;
