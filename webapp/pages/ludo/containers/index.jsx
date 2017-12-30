import React, { Component } from 'react';
import GameComponent from 'components/gameComponent/index.jsx';

export default class Ludo extends Component {
  constructor(props) {
    super(props);
    
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    let a = parseInt(Math.random()*4)*4,
      b = Math.ceil(Math.random()*6);
    
    this.gameComponent.movePen(a, b);
  }
  render() {
    return (<GameComponent
      ref={(element) => {this.gameComponent = element; }}
      onClick={this.handleClick}
      pawns={this.props.pawns}
      players={this.props.player}
    />);
  }
}