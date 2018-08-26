import React, {Component} from 'react';
import './index.sass';
import Engine from 'engine.js'

export default class GameComponent extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  componentDidMount() {
    this.engine = new Engine({container: this.rendererContainer});
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
    let gameShouldUpdate = this.props.gameId !== nextProps.gameId;
    
    if (gameShouldUpdate) {
      this.engine.updateGame({gameId: nextProps.gameId, pawns: nextProps.pawns, players: nextProps.players});
    }
    return false;
  }
  handleClick(e) {
    if (this.props.onClick) {
      this.props.onClick(e);
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