import React, { Component } from 'react';
import GameComponent from 'components/gameComponent/';
import './index.sass';

const nextId = (()=>{
  let id = 0;
  return () => {
    return (id++)+'';
  };
})(),
  randomColor = (format) => {
    var rint = Math.round(0xffffff * Math.random());
    switch(format)
    {
      case 'hex':
        return ('#0' + rint.toString(16)).replace(/^#0([0-9a-f]{6})$/i, '#$1');
        break;
    
      case 'rgb':
        return 'rgb(' + (rint >> 16) + ',' + (rint >> 8 & 255) + ',' + (rint & 255) + ')';
        break;
    
      default:
        return rint;
        break;
    }
  },
  log = (msg) => console.error(msg);

export default class Engine extends Component {
  constructor(props) {
    super(props);
  
    this.state = {
      pawns: [],
      players: [],
      pawnInput: localStorage.pawnInput || '',
      selectedPawnId: null,
      currentPlayerId: null,
    };
  
    this.gameComponent = null;
    this.connectorInstance = this.props.connectorInstance;
    
    this.handleInputChange = this.handleInputChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.initGame = this.initGame.bind(this);
  }
  onSubmit(e) {
    const { pawns, selectedPawnId, pawnInput, } = this.state,
      pawn = pawns.find(pawn => pawn.id===this.state.selectedPawnId);
  
    if (!selectedPawnId || !pawn) {
      log('No pawn');
      e.preventDefault();
      return false;
    }
    
    if (isNaN(pawnInput)) {
      log('Wrong params');
      e.preventDefault();
      return false;
    }
    
    try {
      // console.log(this.gameComponent.checkMoves([{id: 1, x: 0, z: 4}], 1 ,0 )); // [ x: 1, z: 4]
      // console.log(this.gameComponent.checkMoves([{id: 1, x: 0, z: 4}], 3 ,0 )); // [x: 1, z: 4, x: 2, z: 4, x: 3, z: 4]
      // console.log(this.gameComponent.checkMoves([{id: 1, x: 5, z: 0}], 1 ,0 )); // [x: 6, z: 0]
      // console.log(this.gameComponent.checkMoves([{id: 1, x: 5, z: 0}], 2 ,0 )); // [x: 6, z: 0, x: 6, z: 1]
      // console.log(this.gameComponent.checkMoves([{id: 1, x: 0, z: 5}], 2 ,0 )); // x: 1, z: 5, x: 2, z: 5
      // console.log(this.gameComponent.checkMoves([{id: 1, x: 3, z: 5}], 2 ,0 )); // []
      // console.log(this.gameComponent.checkMoves([{id: 1, x: 0, z: 5}], 2 ,1 )); // [x: 0, z: 4, x: 1, z: 4]
      // console.log(this.gameComponent.checkMoves([{id: 1, x: 0, z: 1}], 2 ,0 )); // []
      // console.log(this.gameComponent.checkMoves([{id: 1, x: 0, z: 1}], 6 ,0 )); // [x: 0, z: 4]
      let moves = this.gameComponent.checkMoves([pawn], +pawnInput,this.state.currentPlayerId);
      
      if (moves.length) {
        let move = moves[0],
          fieldSequence = move.fieldSequence || [];
          
        if (fieldSequence.length) {
          this.gameComponent.movePawn({pawnId: pawn.id, fieldSequence});
        } else {
          log('No possible move for this pawn and dice value')
        }
      } else {
        log('No available moves');
      }
      // checkMoves(pawns, diceNumber) // returns pawn ids of pawns which can move
      // getFieldSequence(pawn, diceNumber) // returns promise - reject if cant move, resolve after move
    } catch(e) {
      log(e);
    }
    
    e.preventDefault();
    return false;
  }
  rollDice(number) {
    this.gameComponent.engine.board.dice.roll(number || 6);
  }
  handleInputChange(e) {
    if (!e.target.name) return;
  
    localStorage.setItem(e.target.name, e.target.value);
    this.setState({
      [e.target.name]: e.target.value,
    });
  }
  initGame() {
    let playerId = nextId(),
      pawnId = nextId(),
      color = randomColor('rgb'),
      currentPlayerId = 0,
      newPawn = {
        id: pawnId,
        color,
        playerId: playerId,
        x: 5,
        z: 0,
      },
      newPlayer = {
        id: playerId,
        color,
        avatar: '/static/avatar6.jpg',
        name: 'Name ' + playerId,
        index: currentPlayerId,
      };

    if (!this.state.pawns.length) {
      this.setState({
        pawns: [...this.state.pawns, newPawn],
        players: [...this.state.pawns, newPlayer],
        selectedPawnId: pawnId,
        currentPlayerId: currentPlayerId,
      });
    }
  }
  render() {
    let pawns = this.state.pawns.map(pawn => {
      return <div key={pawn.id} className={'pawn' + (pawn.id===this.state.selectedPawnId?' pawn--selected':'')}>
        {`${pawn.id}:${pawn.color}:${pawn.x},${pawn.z}`}
      </div>;
    }),
      player = nextId();
    
    return <div className="engine-page">
      <div className="settings">
        <div className="settings-title">Settings</div>
        <div className="settings-body">
          <form onSubmit={this.onSubmit}>
            <div className="pawns">
              <div className="pawns-title">Pawns:</div>
              <div className="pawns-body">
                {pawns}
              </div>
            </div>
            <button type="button" onClick={this.initGame}>Init game</button>
            <div className="input-row">
              <div>move pawn</div>
              <div><input tabIndex={1} type="number" min={1} max={6} value={this.state.pawnInput} name="pawnInput" onChange={this.handleInputChange}/></div>
            </div>
            <input type="submit" />
          </form>
        </div>
      </div>
      <GameComponent
        ref={(element) => {this.gameComponent = element; }}
        onClick={this.handleClick}
        pawns={this.state.pawns}
        players={this.state.players}
        moves={this.state.moves}
      />
    </div>;
  }
}