import React, { Component, useCallback, } from 'react';
import { compose, bindActionCreators, } from 'redux'
import { connect, } from 'react-redux'
import './index.sass'
import Games from 'Games.js';
import { withRouter, } from 'react-router-dom';
import { selectors, actions, } from 'shared/redux/api'
import { useTranslation, } from 'react-i18next';
import Button from 'components/button/index'

const Home = ({
  player, history, connectorInstance,
}) => {
  const { t, i18n, } = useTranslation();
  const loggedOut = !player || player.state && player.state === 'loggedOut';
  const joinQueue = useCallback((gameName) => {
    connectorInstance.socket.on('roomUpdate', gameState => {
      history.push(`/room/${gameState.id}`);
    });
    connectorInstance.socket.emit('findRoom', {
      game: gameName,
    });
  }, [ history, connectorInstance, ]);


  return (
    <div className="home-page">
      <h1>{t('home.pickGame')}</h1>
      <div className="games-container">
        <div className="game-info">
          <h2>{t('ludo.name')}</h2>
          <div className="game-description">
            <p>{t('ludo.description')}</p>
            <p>{t('ludo.details1')}</p>
            <p>{t('ludo.details2')}</p>
          </div>
          <Button 
            onClick={() => {joinQueue(Games.Ludo.Name)}}            
            disabled={loggedOut}
          >
            {t('home.findGame')}
          </Button>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  player: selectors.getCurrentPlayer(state),
});

export default compose(
  withRouter,
  connect(mapStateToProps, null),
)(Home);