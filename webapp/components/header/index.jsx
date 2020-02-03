import React, { Component, useState, useEffect, useCallback, } from 'react'
import { Link, } from 'react-router-dom'
import './index.sass'
import Profile from 'components/profile/index'
import Classnames from 'classnames'
import MenuIcon from '@material-ui/icons/Menu'
import FullscreenButton from 'components/fullscreenButton'
import Utils from 'services/utils';
import { useTranslation, } from 'react-i18next';

const Header = ({
  player, dices, selectDice, logout, toggleLoginModal, toggleRegistrationModal,
}) => {
  const [menuOpen, setMenuOpen,] = useState(false);
  const [fullscreen, setFullscreen,] = useState(false);
  const { t, i18n, } = useTranslation();
  const [language, setLanguage,] = useState(i18n.language);
  const headerClass = Classnames({
    'header': true,
    'header--open': menuOpen,
  });
  const isIos = Utils.isIos;

  const toggleFullscreen = useCallback(() => {
    if (fullscreen) {
      if(document.exitFullscreen) {
        document.exitFullscreen();
      } else if(document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if(document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    } else {
      if(document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if(document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if(document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      } else if(document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }
    }

    setFullscreen(!fullscreen);
  }, [fullscreen,]);

  const onKeyUp = useCallback((e) => {
    if (e.key && e.key.toUpperCase() === 'F') {
      toggleFullscreen();
    }
  }, [toggleFullscreen,]);

  const toggleMenu = useCallback(() => {
    setMenuOpen(!menuOpen);
  }, [menuOpen,]);

  useEffect(() => {
    document.addEventListener('keypress', onKeyUp);

    return () => {
      document.removeEventListener('keypress', onKeyUp);
    };
  });

  return (
    <header className={headerClass}>
      <div className="links-container">
        {/* <div className="nav-icon" onClick={toggleMenu}>
          <MenuIcon />
        </div> */}
        {!isIos && <FullscreenButton />}
      </div>
      <div className="menu-container">
        <div className="menu">
          {player.state === 'loggedIn' && (
            <Profile player={player} onClick={() => { toggleMenu(); logout(); }}></Profile>
          )}
          {player.state === 'loading' && <div>{t('commons.loading')}</div>}
          {(player.state === 'loggedOut' || player.temporary) && (
            <a onClick={() => { toggleMenu(); toggleLoginModal();}}>{t('navigation.login')}</a>
          )}
          {(player.state === 'loggedOut' || player.temporary) && (
            <a onClick={() => { toggleMenu(); toggleRegistrationModal();}}>{t('navigation.register')}</a>
          )}
          <Link to='/' onClick={toggleMenu}>{t('navigation.home')}</Link>
          <Link to='/engine' onClick={toggleMenu}>{t('navigation.engine')}</Link>
          <Link to='/admin' onClick={toggleMenu}>{t('navigation.admin')}</Link>
          <select
            onChange={e => {
              i18n.changeLanguage(e.target.value);
              setLanguage(e.target.value);
            }}
            value={language}
          >
            {Object.keys(i18n.store.data).map(
              lang => (<option value={lang} key={lang}>{t(`languages.${lang}`)}</option>)
            )}
          </select>
          <div className="dices-container">
            {dices.map(dice => (
              <div
                key={dice.id}
                style={{background: dice.colors[0],}}
                className={`dice${player.diceId === dice.id ? ' selected' : ''}`}
                onClick={() => { toggleMenu(); selectDice(dice.id)}}
              >
                <div className="dice__spot" style={{background: dice.colors[1],}} />
                <div className="dice__spot" style={{background: dice.colors[1],}} />
                <div className="dice__spot" style={{background: dice.colors[1],}} />
                <div className="dice__spot" style={{background: dice.colors[1],}} />
                <div className="dice__spot" style={{background: dice.colors[1],}} />
                <div className="dice__spot" style={{background: dice.colors[1],}} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;