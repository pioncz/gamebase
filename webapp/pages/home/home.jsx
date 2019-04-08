import React, { Component, } from 'react'
import './index.sass'
import Games from 'Games.js';

export default class Home extends Component {
  constructor(props) {
    super(props);
  }
  joinQueue = (gameName) => {
    this.props.connectorInstance.socket.emit('findRoom', {
      game: gameName,
    });
  }
  render() {
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
      </div>
    );
  }
}