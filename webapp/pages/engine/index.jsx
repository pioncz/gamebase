import React, { Component } from 'react';
import GameComponent from 'components/gameComponent/';
import './index.sass';
import BoardUtils from 'ludo/BoardUtils';
import Timer from 'components/timer';
import { actions } from 'shared/redux/api';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";

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
  log = (msg) => console.error(msg),
  updateObjectInArray = (array, action) => {
    return array.map( (item, index) => {
      if(item.id !== action.id) {
        // This isn't the item we care about - keep it as-is
        return item;
      }
      
      // Otherwise, this is the one we want - return an updated value
      return {
        ...item,
        ...action.item
      };
    });
  },
  randomPlayer = () => {
    let id = nextId();
  
    return {
      id,
      color: randomColor('rgb'),
      avatar: '/static/avatar6.jpg',
      name: 'Name ' + id,
      index: null,
    }
  },
  PawnSets = {
    'initial': [
        {id: '12', x: 0, z: 0}, // first player
        {id: '13', x: 1, z: 0}, // first player
        {id: '14', x: 0, z: 1}, // first player
        {id: '15', x: 1, z: 1}, // first player
        {id: '4', x: 9, z: 0}, // second player
        {id: '5', x: 10, z: 0}, // second player
        {id: '6', x: 9, z: 1}, // second player
        {id: '7', x: 10, z: 1}, // second player
        {id: '8', x: 0, z: 9}, // third player
        {id: '9', x: 1, z: 9}, // third player
        {id: '10', x: 0, z: 10}, // third player
        {id: '11', x: 1, z: 10}, // third player
        {id: '0', x: 9, z: 10}, // fourth player
        {id: '1', x: 10, z: 10}, // fourth player
        {id: '2', x: 9, z: 9}, // fourth player
        {id: '3', x: 10, z: 9}, // fourth player
    ],
    'movePawnBack': [
        {id: '12', x: 0, z: 4}, // first player
        {id: '13', x: 1, z: 0}, // first player
        {id: '14', x: 0, z: 1}, // first player
        {id: '15', x: 1, z: 1}, // first player
        {id: '4', x: 3, z: 4}, // second player
        {id: '5', x: 10, z: 0}, // second player
        {id: '6', x: 9, z: 1}, // second player
        {id: '7', x: 10, z: 1}, // second player
        {id: '8', x: 0, z: 9}, // third player
        {id: '9', x: 1, z: 9}, // third player
        {id: '10', x: 0, z: 10}, // third player
        {id: '11', x: 1, z: 10}, // third player
        {id: '0', x: 9, z: 10}, // fourth player
        {id: '1', x: 10, z: 10}, // fourth player
        {id: '2', x: 9, z: 9}, // fourth player
        {id: '3', x: 10, z: 9}, // fourth player
    ],
    'win': [
        {id: '12', x: 0, z: 5}, // first player
        {id: '13', x: 2, z: 5}, // first player
        {id: '14', x: 3, z: 5}, // first player
        {id: '15', x: 4, z: 5}, // first player
        {id: '4', x: 9, z: 0}, // second player
        {id: '5', x: 10, z: 0}, // second player
        {id: '6', x: 9, z: 1}, // second player
        {id: '7', x: 10, z: 1}, // second player
        {id: '8', x: 0, z: 9}, // third player
        {id: '9', x: 1, z: 9}, // third player
        {id: '10', x: 0, z: 10}, // third player
        {id: '11', x: 1, z: 10}, // third player
        {id: '0', x: 9, z: 10}, // fourth player
        {id: '1', x: 10, z: 10}, // fourth player
        {id: '2', x: 9, z: 9}, // fourth player
        {id: '3', x: 10, z: 9}, // fourth player
    ],
  };

class Engine extends Component {
  constructor(props) {
    super(props);
  
    this.state = {
      pawns: [],
      moves: [],
      players: [],
      pawnInput: localStorage.pawnInput || '',
      selectedPawnId: null,
      currentPlayerId: null,
      gameId: null,
      numberOfPlayers: localStorage.numberOfPlayers || 1,
      pawnSet: localStorage.pawnSet || 'initial',
    };

    this.gameComponent = null;
    this.timerComponent = null;
    this.connectorInstance = this.props.connectorInstance;
    
    this.handleInputChange = this.handleInputChange.bind(this);
    this.movePawn = this.movePawn.bind(this);
    this.initGame = this.initGame.bind(this);
    this.onPawnClick = this.onPawnClick.bind(this);
  }
  componentDidMount() {
    this.props.setInGame();
  }
  componentWillUnmount() {
    this.props.unsetInGame();
  }
  movePawn(e) {
    const { pawns, selectedPawnId, pawnInput, players } = this.state,
      pawn = pawns.find(pawn => pawn.id === selectedPawnId),
      playerIds = players.map(player => player.id),
      roomState = {pawns, playerIds};
  
    if (!selectedPawnId) {
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
      let moves = this.gameComponent.checkMoves(roomState, +pawnInput, this.state.currentPlayerId);
      
      if (moves.length) {
        let move = moves.find(move => move.pawnId === selectedPawnId);
          
        if (move && move.fieldSequence.length) {
          let fieldSequence = move.fieldSequence || [],
            lastField = fieldSequence[fieldSequence.length - 1],
            anotherPawns = pawns.filter(pawn =>
              pawn.playerId !== this.state.currentPlayerId &&
              pawn.x === lastField.x &&
              pawn.z === lastField.z
            ) || [];
          
          this.gameComponent.movePawn({pawnId: pawn.id, fieldSequence})
            .then(() =>{
              let newX = lastField.x,
                newZ = lastField.z;

              this.setState({
                pawns: updateObjectInArray(this.state.pawns, {id: pawn.id, item: {x: newX, z: newZ} })
              });
            });
  
          if (anotherPawns.length) {
            let anotherPawn = anotherPawns[0],
              anotherPawnSpawnFields = BoardUtils.getSpawnFields(pawns, anotherPawn.playerIndex),
              spawnField = (anotherPawnSpawnFields && anotherPawnSpawnFields[0]) || null,
              anotherPawnMove = { pawnId: anotherPawn.id, fieldSequence: [spawnField] };
    
            if (anotherPawnMove) {
              this.gameComponent.movePawn(anotherPawnMove)
                .then(() =>{
                  let newX = spawnField.x,
                    newZ = spawnField.z;
      
                  this.setState({
                    pawns: updateObjectInArray(this.state.pawns, {id: anotherPawnMove.pawnId, item: {x: newX, z: newZ} })
                  });
                });
            }
          }
        } else {
          log('No possible move for this pawn and dice value')
        }
      } else {
        log('No available moves');
      }

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
    const { numberOfPlayers, pawnSet } = this.state;
    let newPlayers = [],
      newPawns;
  
    for(let i = 0; i < numberOfPlayers; i++) {
      let newPlayer = randomPlayer();
      newPlayer.index = newPlayers.length;
      newPlayers.push(newPlayer);
    }
    
    newPawns = PawnSets[pawnSet].slice(0,4*numberOfPlayers);
    
    for(let pawnI in newPawns) {
      let pawn = newPawns[pawnI],
        player = newPlayers[Math.floor(pawnI / 4)];
      
      pawn.color = player.color;
      pawn.playerId = player.id;
      pawn.playerIndex = player.index;
    }

    this.setState({
      pawns: newPawns,
      players: newPlayers,
      selectedPawnId: newPawns[0].id,
      currentPlayerId: newPawns[0].playerId,
      gameId: nextId(),
    });
    setTimeout(() => {
      this.gameComponent.engine.selectPawns([newPawns[0].id]);
    }, 50);

    this.timerComponent.start(5*60*1000);
  }
  onPawnClick(pawnId) {
    this.gameComponent.engine.selectPawns([pawnId]);
    this.setState({
      selectedPawnId: pawnId,
    });
  }
  render() {
    const { pawns, selectedPawnId, pawnInput, numberOfPlayers, pawnSet } = this.state,
      pawnsElements = pawns.map(pawn => {
      return <div key={pawn.id}
                  className={'pawn' + (pawn.id===selectedPawnId?' pawn--selected':'')}
      onClick={() => { this.onPawnClick(pawn.id)} }>
        {`${pawn.id}:${pawn.color}:${pawn.x},${pawn.z}`}
      </div>;
    });
    
    return <div className="engine-page">
      <div className="settings">
        <div className="settings-title">Settings</div>
        <div className="settings-body">
          <div className="input-row">
              <div>Number of players</div>
              <div>
                  <input tabIndex={1} type="number" min={1} max={4} value={numberOfPlayers} name="numberOfPlayers" onChange={this.handleInputChange}/>
              </div>
          </div>
            <div className="input-row">
                <div>Pawns set</div>
                <div>
                  <select name="pawnSet" onChange={this.handleInputChange}>
                    <option value="initial" selected={pawnSet === 'initial'}>Initial</option>
                    <option value="movePawnBack" selected={pawnSet === 'movePawnBack'}>Move pawn back</option>
                    <option value="win" selected={pawnSet === 'win'}>Win</option>
                  </select>
                </div>
            </div>
          <button type="button" onClick={this.initGame}>Init game</button>
          <hr />
          <div className="pawns">
            <div className="pawns-title">Pawns:</div>
            <div className="pawns-body">
              {pawnsElements}
            </div>
          </div>
          <div className="input-row">
            <div>move pawn</div>
            <div><input tabIndex={1} type="number" min={1} max={6} value={pawnInput} name="pawnInput" onChange={this.handleInputChange}/></div>
          </div>
          <button onClick={this.movePawn}>RUSZ PIONKA</button>
        </div>
      </div>
      <GameComponent
        ref={(element) => { this.gameComponent = element; }}
        onClick={this.handleClick}
        pawns={this.state.pawns}
        players={this.state.players}
        moves={this.state.moves}
        gameId={this.state.gameId}
      />
      <Timer ref={(element) => { this.timerComponent = element; }}/>
    </div>;
  }
}

const {
  setInGame,
  unsetInGame,
} = actions;

const mapStateToProps = state => ({
//  pawns: getPawns(state),
});

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators({
//    fetchPresentation,
    setInGame,
    unsetInGame,
  }, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Engine);