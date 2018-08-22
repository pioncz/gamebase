import React, {Component} from 'react';
import './index.sass';
import Game from 'game.js'

export default class GameComponent extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  componentDidMount() {
    this.engine = new Game({container: this.rendererContainer});
    this.engine.on('click', this.handleClick);
  }
  componentWillUnmount() {
   this.engine.off(); 
  }
  shouldComponentUpdate(nextProps) {
    if (nextProps.moves && nextProps.moves.length) {
      let move = nextProps.moves[nextProps.moves.length - 1];
      this.engine.board.movePawn(move);
    }
    let gameShouldInit = nextProps.pawns.length &&
      nextProps.players && nextProps.players.length;
    
    if (gameShouldInit) {
      this.engine.initGame({pawns: nextProps.pawns, players: nextProps.players});
    }
    return false;
  }
  handleClick(e) {
    if (this.props.onClick) {
      this.props.onClick(this.engine, e);
    }
  }
  movePawn(pawnMove) {
    return this.engine.board.movePawn(pawnMove);
  }
  checkMoves(pawns, diceNumber, playerIndex) {
    return this.engine.board.checkMoves(pawns, diceNumber, playerIndex);
  }
  render() {
    return <div className="game">
      <div ref={(renderer) => {
        this.rendererContainer = renderer;
      }} className="renderer"></div>
    </div>;
  }
}