import React, { Component } from 'react';
import GameComponent from 'components/gameComponent/index.jsx';

export default class Ludo extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <GameComponent pawns={this.props.pawns} players={this.props.player}></GameComponent>
  }
}