import React, { Component, } from 'react';
import { compose, bindActionCreators, } from 'redux'
import { connect, } from 'react-redux'
import './index.sass'
import Games from 'Games.js';
import { withRouter, } from 'react-router-dom';
import { selectors, actions, } from 'shared/redux/api'


class Home extends Component {
  constructor(props) {
    super(props);
  }
  joinQueue = (gameName) => {
    const { history, } = this.props;

    this.props.connectorInstance.socket.on('roomUpdate', gameState => {
      history.push(`/room/${gameState.id}`);
    });
    this.props.connectorInstance.socket.emit('findRoom', {
      game: gameName,
    });
  }
  render() {
    const { player, } = this.props;
    const loggedOut = player.state && player.state === 'loggedOut'

    return (
      <div className="home-page">
        <h1>Wybierz grę.</h1>
        <div className="games-container">
          <div className="game-info">
            <h2>Ludo</h2>
            <button
              onClick={() => {this.joinQueue(Games.Ludo.Name)}}
              disabled={loggedOut}
            >
              Find game
            </button>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  player: selectors.getCurrentPlayer(state),
});

export default compose(
  withRouter,
  connect(mapStateToProps, null),
)(Home);