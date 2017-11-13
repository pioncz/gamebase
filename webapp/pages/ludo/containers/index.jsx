import React, { Component } from 'react'
import Game from 'components/game/index.jsx'

export default class Ludo extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <Game pawns={this.props.pawns} players={this.props.player}></Game>
  }
}