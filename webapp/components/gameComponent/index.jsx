import React, {Component,} from 'react';
import './index.sass';
import Engine from 'engine.js'

export default class GameComponent extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.rendererContainerRef = React.createRef();
  }
  componentDidMount() {
    this.createEngine();
  }
  componentWillUnmount() {
    if (this.engine) {
      this.engine.off('click', this.handleClick);
    }
  }
  shouldComponentUpdate(nextProps) {
    if (!this.engine && nextProps.gameName) {
      this.createEngine();
    }

    if (!this.engine) {
      return false;
    }

    if (nextProps.moves && nextProps.moves.length) {
      let move = nextProps.moves[nextProps.moves.length - 1];
      this.engine.board.movePawn(move);
    }

    if (this.props.gameName !== nextProps.gameName) {
      this.engine.changeGame(nextProps.gameName);
    }
    return false;
  }
  createEngine() {
    const { gameName, } = this.props;
    if (gameName) {
      this.engine = new Engine({
        container: this.rendererContainerRef.current,
        gameName,
      });
      this.engine.on('click', this.handleClick);
    }
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
  initGame() {
    const { gameId, gameName, pawns, players, firstPlayerId, } = this.props;

    this.engine.initGame(
      {
        gameId: gameId,
        gameName: gameName,
        pawns: pawns,
        players: players,
      },
      firstPlayerId,
    );
  }
  clearGame() {
    this.engine.clearGame();
  }
  render() {
    return <div className="game-component">
      <div ref={this.rendererContainerRef} className="renderer"></div>
    </div>;
  }
}