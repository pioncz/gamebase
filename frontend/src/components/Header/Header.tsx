import { styled } from '@/lib/stitches.config';
import FullscreenButton from '@/components/FullscreenButton/FullscreenButton';
import { useSelector } from 'react-redux';
import { getDices, getPlayer, logout } from '@/store/GameSlice';
import { useCallback, useEffect, useState } from 'react';
import Profile from './Profile';
import { NavLink } from 'react-router';
import { useAppDispatch } from '@/store/store';

const Header = ({
  selectDice,
  toggleLoginModal,
  toggleRegistrationModal,
}: {
  selectDice: (diceId: string) => void;
  toggleLoginModal: () => void;
  toggleRegistrationModal: () => void;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const player = useSelector(getPlayer);
  const dispatch = useAppDispatch();
  const headerClass = `header ${menuOpen ? 'header--open' : ''}`;
  const dices = useSelector(getDices);

  const toggleMenu = () => {
    setMenuOpen((open) => !open);
  };

  const onProfileClick = () => {
    toggleMenu();
    dispatch(logout());
  };

  const toggleFullscreen = useCallback(() => {
    if (fullscreen && document.exitFullscreen) {
      document.exitFullscreen();
    } else if (
      !fullscreen &&
      document.documentElement.requestFullscreen
    ) {
      document.documentElement.requestFullscreen();
    }

    setFullscreen((v) => !v);
  }, [fullscreen]);

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key && e.key.toUpperCase() === 'F') {
        toggleFullscreen();
      }
    };

    document.addEventListener('keyup', onKeyUp);

    return () => {
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [toggleFullscreen]);

  return (
    <Root className={headerClass}>
      <div className="links-container">
        {/* <div className="nav-icon" onClick={toggleMenu}>
          <MenuIcon />
        </div> */}
        <FullscreenButton />
      </div>
      <div className="menu-container">
        <div className="menu">
          {player.state === 'loggedIn' && (
            <Profile
              player={player}
              onClick={() => {
                onProfileClick();
              }}
            ></Profile>
          )}
          {player.state === 'loading' && <div>Loading</div>}
          {(player.state === 'loggedOut' || player.temporary) && (
            <a
              onClick={() => {
                toggleMenu();
                toggleLoginModal();
              }}
            >
              Login
            </a>
          )}
          {(player.state === 'loggedOut' || player.temporary) && (
            <a
              onClick={() => {
                toggleMenu();
                toggleRegistrationModal();
              }}
            >
              Register
            </a>
          )}
          <NavLink to="/" onClick={toggleMenu}>
            Home
          </NavLink>
          <NavLink to="/engine" onClick={toggleMenu}>
            Engine
          </NavLink>
          <NavLink to="/admin" onClick={toggleMenu}>
            Admin
          </NavLink>
          <div className="dices-container">
            {dices.map((dice) => (
              <div
                key={dice.id}
                style={{ background: dice.colors[0] }}
                className={`dice${
                  player.diceId === dice.id ? ' selected' : ''
                }`}
                onClick={() => {
                  toggleMenu();
                  selectDice(dice.id);
                }}
              >
                <div
                  className="dice__spot"
                  style={{ background: dice.colors[1] }}
                />
                <div
                  className="dice__spot"
                  style={{ background: dice.colors[1] }}
                />
                <div
                  className="dice__spot"
                  style={{ background: dice.colors[1] }}
                />
                <div
                  className="dice__spot"
                  style={{ background: dice.colors[1] }}
                />
                <div
                  className="dice__spot"
                  style={{ background: dice.colors[1] }}
                />
                <div
                  className="dice__spot"
                  style={{ background: dice.colors[1] }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Root>
  );
};

const Root = styled('div', {
  position: 'absolute',
  zIndex: 200,
  top: 0,
  left: 0,
  height: '100%',
  width: '100%',
  pointerEvents: 'none',
  a: {
    color: '#D9E9EF',
    margin: '8px',
    textDecoration: 'none',
    cursor: 'pointer',
    userSelect: 'none',
  },
  '.links-container': {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    zIndex: 200,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    '> div': {
      pointerEvents: 'all',
    },
    '.nav-icon': {
      position: 'absolute',
      top: 0,
      right: 0,
      background: 'rgba(0, 0, 0, 0.4)',
      borderRadius: '1px',
      margin: '6px',
      cursor: 'pointer',
      padding: '7px 18px',
      fontSize: '24px',
      color: '#fff',
      '&--fullscreen': {
        bottom: 'auto',
        right: '0px',
      },
      svg: {
        display: 'block',
      },
    },
  },
  '.dices-container': {
    display: 'flex',
    justifyContent: 'space-around',
    margin: '8px',
    marginTop: '40px',
    '.dice': {
      position: 'relative',
      width: '64px',
      height: '64px',
      borderRadius: '3px',
      cursor: 'pointer',
      '&.selected': {
        border: '1px solid #000',
        boxShadow: '0px 0px 3px 5px #fff',
      },
      '&__spot': {
        position: 'absolute',
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: '#000',
        transform: 'translate(-50%,-50%)',
      },
      '&__spot:nth-child(1)': {
        top: '25%',
        left: '25%',
      },
      '&__spot:nth-child(2)': {
        top: '50%',
        left: '25%',
      },
      '&__spot:nth-child(3)': {
        top: '25%',
        left: '75%',
      },
      '&__spot:nth-child(4)': {
        top: '75%',
        left: '25%',
      },
      '&__spot:nth-child(5)': {
        top: '50%',
        left: '75%',
      },
      '&__spot:nth-child(6)': {
        top: '75%',
        left: '75%',
      },
    },
  },
  '.menu-container': {
    position: 'absolute',
    zIndex: 100,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,.8)',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    opacity: 0,
    transition: '.2s all ease-in-out',
    '.menu': {
      width: '400px',
      display: 'flex',
      flexDirection: 'column',
      textAlign: 'center',
      a: {
        position: 'relative',
        transition: '.2s all linear',
        top: '-200px',
        opacity: 0,
        fontSize: '22px',
        '&:nth-child(2)': {
          transitionDelay: '.05s',
        },
        '&:nth-child(3)': {
          transitionDelay: '.1s',
        },
        '&:nth-child(4)': {
          transitionDelay: '.15s',
        },
        '&:nth-child(5)': {
          transitionDelay: '.2s',
        },
        '&:nth-child(6)': {
          transitionDelay: '.25s',
        },
        '&:nth-child(7)': {
          transitionDelay: '.3s',
        },
        '&:nth-child(8)': {
          transitionDelay: '.35s',
        },
      },
    },
  },
  '&--open': {
    pointerEvents: 'all',
    '.menu-container': {
      pointerEvents: 'all',
      opacity: 1,
      '.menu a': {
        top: 0,
        opacity: 1,
      },
    },
  },
  '.profile': {
    margin: '10px',
    cursor: 'pointer',
  },
});

export default Header;
