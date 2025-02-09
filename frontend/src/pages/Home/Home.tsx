import WSConnectorContext from '@/contexts/WSConnector/WSConnectorContext';
import { Game } from '@/lib/types';
import { getGames, getPlayer } from '@/store/GameSlice';
import { useCallback, useContext } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

const HomePage = () => {
  const player = useSelector(getPlayer);
  const games = useSelector(getGames);
  const loggedOut =
    !player || (player.state && player.state === 'loggedOut');
  const { socket } = useContext(WSConnectorContext);
  const navigate = useNavigate();

  const joinQueue = useCallback(
    (gameName: string) => {
      socket?.on('roomUpdate', (gameState: Game) => {
        navigate(`/room/${gameState.id}`);
      });
      socket?.emit('findRoom', {
        game: gameName,
      });
    },
    [navigate, socket],
  );

  return (
    <div className="home-page">
      <h1>Pick game</h1>
      <div className="games-container">
        {games.map((gameName) => (
          <div className="game-info" key={gameName}>
            <h2>{gameName}</h2>
            <p>Game description</p>
            <button
              className="button"
              onClick={() => {
                joinQueue(gameName);
              }}
              disabled={loggedOut}
            >
              Find game
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
