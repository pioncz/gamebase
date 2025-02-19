import type { ReactNode } from 'react';
import React, {
  createContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import ioClient, { Socket } from 'socket.io-client';
import { styled } from '@/lib/stitches.config';
import { Dice, Player } from '@/lib/types';
import { useAppDispatch } from '@/store/store';
import { setDices, setGames, setPlayer } from '@/store/GameSlice';

interface WSConnectorContextProps {
  connected?: boolean;
  socket?: Socket | null;
}

const WSConnectorContext = createContext<WSConnectorContextProps>({});

export const WSConnectorContextProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (socketRef.current) return;
    socketRef.current = ioClient(import.meta.env.VITE_WS_HOST, { secure: true });

    socketRef.current?.on('connect', () => {
      setConnected(true);
    });
    socketRef.current?.on('connect_error', (e) => {
      setConnected(false);
      console.error('socketError', e);
      console.error('socketError', e.message);
    });
    socketRef.current?.on('disconnect', () => {
      setConnected(false);
    });
    socketRef.current?.on('error', (e) => {
      setConnected(false);
      console.error('socketError', e);
    });

    socketRef.current?.on(
      'initialData',
      ({
        player,
        dices,
        games,
      }: {
        player: Player;
        dices: Dice[];
        games: [];
        }) => {
        dispatch(setPlayer({ ...player, state: 'loggedIn' }));
        dispatch(setDices(dices));

        const diceId = window.localStorage.diceId;
        const login = window.localStorage.login;
        if (diceId) {
          socketRef.current?.emit('selectDice', { diceId });
          dispatch(setPlayer({ diceId }));
        }
        if (login) {
          socketRef.current?.emit('selectLogin', { login });
          dispatch(setPlayer({ login }));
        }
        dispatch(setGames({ games }));
      },
    );
  }, []);

  return (
    <WSConnectorContext.Provider
      value={{
        connected,
        socket: socketRef.current,
      }}
    >
      {children}
      {!connected && <OfflineIcon>OFFLINE</OfflineIcon>}
    </WSConnectorContext.Provider>
  );
};

const OfflineIcon = styled('div', {
  position: 'fixed',
  bottom: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  border: '2px solid red',
  color: 'red',
  padding: '8px 20px',
  borderRadius: '4px',
  fontWeight: 500,
});

export default WSConnectorContext;
