import React, { Component, } from 'react'
import './index.sass'
import Games from 'Games.js';
import SearchingRoom from 'modals/SearchingRoom'

const Modals = {
  searchingRoom: 'searchingRoom',
};

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modalOpened: null,
    };
  }
  joinQueue = (gameName) => {
    this.props.connectorInstance.socket.emit('findRoom', {
      game: gameName,
    });
    this.setState({
      modalOpened: Modals.searchingRoom,
    });
  }
  render() {
    const { modalOpened, } = this.state;

    return (
      <div className="home-page">
        <h1>Wybierz grę.</h1>
        <div className="games-container">
          <div className="game-info">
            <h2>Ludo</h2>
            <button onClick={() => {this.joinQueue(Games.Ludo.Name)}}>Find game</button>
          </div>
          <div className="game-info">
            <h2>Kira</h2>
            <button onClick={() => {this.joinQueue(Games.Kira.Name)}}>Find game</button>
          </div>
        </div>
        {modalOpened && (
          <SearchingRoom />
        )}
      </div>
    );
  }
}