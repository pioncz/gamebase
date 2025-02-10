import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import Progress from '../Progress/Progress';
import { Player } from '@/lib/types';
import { styled } from '@/lib/stitches.config';
import { getAssetPath } from '@/lib/assets';

export type PlayerProfilesHandle = {
  restartProgress: () => void;
  stopProgress: () => void;
};

const PlayerProfiles = forwardRef(
  (
    {
      players,
      firstPlayerId,
      currentPlayerId,
      hidden,
      roundLength,
    }: {
      players: Player[];
      firstPlayerId: string;
      currentPlayerId: string;
      hidden: boolean;
      roundLength: number;
    },
    ref,
  ) => {
    const [lastProgress, setLastProgress] = useState<number | null>(
      null,
    );
    const containerRef = useRef<HTMLDivElement>(null);
    const playerIndex = players.findIndex(
      (player) => player.id === firstPlayerId,
    );
    // swap players so first will be with id firstPlayerId
    const filteredPlayers: Player[] = players
      .slice(0, players.length)
      .slice(playerIndex, players.length)
      .concat(players.slice(0, players.length).slice(0, playerIndex));

    useImperativeHandle(
      ref,
      () => ({
        restartProgress: () => {
          const firstIndex = players.findIndex(
            (player) => player.id === firstPlayerId,
          );
          const currentIndex = players.findIndex(
            (player) => player.id === currentPlayerId,
          );
          const whichDiv = (currentIndex + (4 - firstIndex)) % 4;
          const div = containerRef.current?.children[whichDiv];
          const progress = div?.querySelector(
            '.progress',
          ) as HTMLElement;

          if (lastProgress !== null) {
            const oldDiv =
              containerRef.current?.children[lastProgress];
            const oldProgress = oldDiv?.querySelector(
              '.progress',
            ) as HTMLElement;
            if (oldProgress) {
              oldProgress.style.animationName = '';
              oldProgress.style.animationDuration = '';
            }
          }

          if (progress) {
            progress.style.animationName = 'shortenWidth';
            progress.style.animationDuration = `${
              roundLength / 1000
            }s`;
          }

          setLastProgress(whichDiv);
        },
        stopProgress: () => {
          if (lastProgress === null) {
            return;
          }

          const div = containerRef.current?.children[lastProgress];
          const progress = div?.querySelector(
            '.progress',
          ) as HTMLElement;
          if (progress) {
            progress.style.animationName = '';
            progress.style.animationDuration = '';
          }

          setLastProgress(null);
        },
      }),
      [
        lastProgress,
        roundLength,
        players,
        firstPlayerId,
        currentPlayerId,
      ],
    );

    return (
      <Root className="player-profiles" ref={containerRef}>
        {filteredPlayers.map((player, index) => {
          const className = `player player-${index} ${
            !!hidden || !player.login ? 'player--hidden' : ''
          } ${player.disconnected ? 'player--disconnected' : ''}`;

          return (
            <div key={index} className={className}>
              <div
                className="player-name"
                style={{
                  borderColor: player.color,
                }}
              >
                {player.login}
                {player.id === currentPlayerId && (
                  <p className="arrow"></p>
                )}
                <Progress />
              </div>
              <img src={getAssetPath(player.avatar)} />
            </div>
          );
        })}
      </Root>
    );
  },
);

const Root = styled('div', {
  position: 'absolute',
  width: '100%',
  height: '100%',
  top: '50%',
  transform: 'translateY(-50%)',
  left: '0',
  pointerEvents: 'none',
  zIndex: 100,
  overflow: 'hidden',

  '.player': {
    width: '100%',
    maxWidth: '200px',
    position: 'absolute',
    transition: 'all ease-in-out .2s',
    display: 'flex',

    '.player-name': {
      position: 'relative',
      background: 'rgba(0,0,0,0.2)',
      padding: '0px 32px 0px 18px',
      width: '100%',
      maxWidth: '200px',
      color: '#fff',
      fontSize: '22px',
      userSelect: 'none',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      borderRadius: '2px',

      '.arrow': {
        position: 'absolute',
        right: '12px',
        top: '50%',
        border: 'solid #fff',
        borderWidth: '0 3px 3px 0',
        display: 'inline-block',
        padding: '3px',
        margin: '0',
        transform: 'translateY(-50%) rotate(135deg)',
      },
    },

    '.player-progress': {
      position: 'absolute',
      width: '0%',
      background: '#fff',
      left: '0',
      bottom: '0',
    },

    img: {
      height: '39px',
      width: '39px',
      userSelect: 'none',
    },

    '&.player-0': {
      top: '52px',
    },

    '&.player-1': {
      top: '52px',
      transitionDelay: '.1s',
    },

    '&.player-2': {
      bottom: '52px',
      transitionDelay: '.2s',
    },

    '&.player-3': {
      bottom: '52px',
      transitionDelay: '.3s',
    },

    '&.player-0, &.player-3': {
      flexDirection: 'row-reverse',
      left: '6px',

      '.player-name': {
        borderRight: '4px solid',
      },

      '&.player--hidden': {
        left: '-200px',
      },
    },

    '&.player-1, &.player-2': {
      right: '6px',

      '.player-name': {
        padding: '0px 18px 0px 32px',
        borderLeft: '4px solid',

        '.arrow': {
          right: 'auto',
          left: '12px',
          transform: 'translateY(-50%) rotate(-45deg)',
        },

        '.progress': {
          left: 'auto',
          right: '0px',
          transform: 'scaleX(-1)',
        },
      },

      '&.player--hidden': {
        right: '-200px',
      },
    },
  },
});

export default PlayerProfiles;
