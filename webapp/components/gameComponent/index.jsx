import React, {Component} from 'react';
import './index.sass';
import Game from 'game.js'

export default class GameComponent extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  componentDidMount() {
    this.engine = new Game({container: this.rendererContainer, pawns: this.props.pawns});
  }
  shouldComponentUpdate(nextProps) {
    if (nextProps.moves && nextProps.moves.length) {
      let move = nextProps.moves[nextProps.moves.length - 1];
      this.engine.board.movePawn(move);
    }
    return false;
  }
  handleClick() {
    if (this.props.onClick) {
      this.props.onClick(this.engine);
    }
  }
  movePen(player, length) {
    this.engine.board.movePawn(player, length);
  }
  render() {
    return <div className="game" onClick={this.handleClick}>
      <div ref={(renderer) => {
        this.rendererContainer = renderer;
      }} className="renderer"></div>
    </div>;
  }
}