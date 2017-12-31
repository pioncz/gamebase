import React, { Component } from 'react';
import GameComponent from 'components/gameComponent/index.jsx';
import InitialPage from './initialPage.jsx';
import Modal from 'components/modal/index.jsx';
import Button from 'components/button/index.jsx';

const Pages = {
  Initial: 'Initial',
  Queue: 'Queue',
  Game: 'Game',
  Win: 'Win',
  Loose: 'Loose',
};

export default class Ludo extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      menuOpened: false,
      page: Pages.Initial,
      player: {
        name: '',
      },
    };
    
    this.handleClick = this.handleClick.bind(this);
    this.joinQueue = this.joinQueue.bind(this);
  }
  handleClick() {
    let a = parseInt(Math.random()*4)*4,
      b = Math.ceil(Math.random()*6);
    
    this.gameComponent.movePen(a, b);
  }
  joinQueue() {
    if (this.props.connectorInstance) {
      this.props.connectorInstance.joinQueue({
        game: 'ludo'
      });
    }
    if (this.initialModal) {
      this.initialModal.close();
    }
    this.setState({page: Pages.Queue});
  }
  render() {
    let currentModal,
      page = this.state.page;
    
    if (page == Pages.Initial) {
      currentModal = <Modal ref={(element) => {this.initialModal = element;}}>
        <h3>Znajdź grę</h3>
        <div className="buttons-container">
          <Button onClick={this.joinQueue}>START</Button>
        </div>
      </Modal>
    }
    if (page == Pages.Queue) {
      currentModal = <Modal ref={(element) => {this.queueModal = element;}}>
        <h3>Szukanie graczy</h3>
        <p>Przewidywany czas 2min</p>
      </Modal>;
    }
      
    return (<div>
      <GameComponent
        ref={(element) => {this.gameComponent = element; }}
        onClick={this.handleClick}
        pawns={this.props.pawns}
        players={this.props.player}
      />
      {currentModal}
    </div>);
  }
}