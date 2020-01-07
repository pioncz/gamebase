import React, { Component, useCallback, } from 'react';
import { compose, bindActionCreators, } from 'redux'
import { connect, } from 'react-redux'
import './index.sass'
import Games from 'Games.js';
import { withRouter, } from 'react-router-dom';
import { selectors, actions, } from 'shared/redux/api'
import { useTranslation, } from 'react-i18next';

const Home = ({
  player, history, connectorInstance, games,
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
        {games.map(gameName => (
          <div
            className="game-info"
            key={gameName}
          >
            <h2>{gameName}</h2>
            <button
              onClick={() => {joinQueue(gameName)}}
              disabled={loggedOut}
            >
              {t('home.findGame')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  player: selectors.getCurrentPlayer(state),
  games: selectors.getCurrentGames(state),
});

export default compose(
  withRouter,
  connect(mapStateToProps, null),
)(Home);