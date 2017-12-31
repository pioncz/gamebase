import React, { Component } from 'react';
import GameComponent from 'components/gameComponent/index.jsx';
import InitialPage from './initialPage.jsx';

export default class Ludo extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      menuOpened: false,
      page: 'initial',
      player: {
        name: '',
      },
    };
    
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    let a = parseInt(Math.random()*4)*4,
      b = Math.ceil(Math.random()*6);
    
    this.gameComponent.movePen(a, b);
  }
  render() {
    let page = <InitialPage connectorInstance={this.props.connectorInstance} />;
    
    return (<div>
      <GameComponent
        ref={(element) => {this.gameComponent = element; }}
        onClick={this.handleClick}
        pawns={this.props.pawns}
        players={this.props.player}
      />
      {page}
    </div>);
  }
}