import React, { Component, } from 'react';
import GameComponent from 'components/gameComponent/';
import './index.sass';
import BoardUtils from 'ludo/BoardUtils';
import Timer from 'components/timer';
import { actions, } from 'shared/redux/api';
import {connect,} from "react-redux";
import {bindActionCreators,} from "redux";
import PlayerProfiles from 'components/playerProfiles';
import { Config, AnimationLengths, } from 'ludo';
import Games from 'Games.js';
import Snackbar from 'components/snackbar';
import Dices from 'components/dices';

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
        ...action.item,
      };
    });
  },
  randomPlayer = () => {
    let id = nextId() + 'playerId';

    return {
      id,
      color: randomColor('rgb'),
      avatar: '/static/avatar6.jpg',
      login: 'Name ' + id,
      index: null,
    }
  },
  PawnSets = {
    Ludo: {
      'initial': [
        {id: '12', x: 0, z: 0,}, // first player
        {id: '13', x: 1, z: 0,}, // first player
        {id: '14', x: 0, z: 1,}, // first player
        {id: '15', x: 1, z: 1,}, // first player
        {id: '4', x: 9, z: 0,}, // second player
        {id: '5', x: 10, z: 0,}, // second player
        {id: '6', x: 9, z: 1,}, // second player
        {id: '7', x: 10, z: 1,}, // second player
        {id: '0', x: 9, z: 10,}, // third player
        {id: '1', x: 10, z: 10,}, // third player
        {id: '2', x: 9, z: 9,}, // third player
        {id: '3', x: 10, z: 9,}, // third player
        {id: '8', x: 0, z: 9,}, // fourth player
        {id: '9', x: 1, z: 9,}, // fourth player
        {id: '10', x: 0, z: 10,}, // fourth player
        {id: '11', x: 1, z: 10,}, // fourth player
      ],
      'movePawnBack': [
        {id: '12', x: 0, z: 4,}, // first player
        {id: '13', x: 1, z: 0,}, // first player
        {id: '14', x: 0, z: 1,}, // first player
        {id: '15', x: 1, z: 1,}, // first player
        {id: '4', x: 1, z: 4,}, // second player
        {id: '5', x: 4, z: 4,}, // second player
        {id: '6', x: 3, z: 4,}, // second player
        {id: '7', x: 2, z: 4,}, // second player
        {id: '0', x: 9, z: 10,}, // third player
        {id: '1', x: 10, z: 10,}, // third player
        {id: '2', x: 9, z: 9,}, // third player
        {id: '3', x: 10, z: 9,}, // third player
        {id: '8', x: 0, z: 9,}, // fourth player
        {id: '9', x: 1, z: 9,},
        {id: '10', x: 0, z: 10,},
        {id: '11', x: 1, z: 10,},
      ],
      'win': [
        {id: '12', x: 0, z: 5,}, // first player
        {id: '13', x: 2, z: 5,}, // first player
        {id: '14', x: 3, z: 5,}, // first player
        {id: '15', x: 4, z: 5,}, // first player
        {id: '4', x: 9, z: 0,}, // second player
        {id: '5', x: 10, z: 0,}, // second player
        {id: '6', x: 9, z: 1,}, // second player
        {id: '7', x: 10, z: 1,}, // second player
        {id: '0', x: 9, z: 10,}, // third player
        {id: '1', x: 10, z: 10,}, // third player
        {id: '2', x: 9, z: 9,}, // third player
        {id: '3', x: 10, z: 9,}, // third player
        {id: '8', x: 0, z: 9,}, // fourth player
        {id: '9', x: 1, z: 9,},
        {id: '10', x: 0, z: 10,},
        {id: '11', x: 1, z: 10,},
      ],
    },
    Kira: {
      'initial': [
        {id: '12', x: 0.5, z: 0.5,}, // first player
        {id: '0', x: 0.5, z: 0.5,}, // third player
        {id: '8', x: 0.5, z: 0.5,}, // fourth player
        {id: '4', x: 0.5, z: 0.5,}, // second player
      ],
    },
  };

class Engine extends Component {
  constructor(props) {
    super(props);

    this.state = {
      gameName: localStorage.gameName || Games.Ludo.Name,
      pawns: [],
      moves: [],
      players: [],
      pawnInput: localStorage.pawnInput || '',
      selectedPawnId: null,
      currentPlayerId: null,
      gameId: null,
      numberOfPlayers: localStorage.numberOfPlayers || 1,
      pawnSet: localStorage.pawnSet || 'initial',
      firstPlayerIndex: localStorage.firstPlayerIndex || 1,
      firstPlayerId: null,
      messages: [],
      activeDice: false,
    };

    this.gameComponentRef = React.createRef();
    this.timerComponentRef = React.createRef();
    this.snackbarComponentRef = React.createRef();
    this.connectorInstance = this.props.connectorInstance;

    this.handleInputChange = this.handleInputChange.bind(this);
    this.movePawn = this.movePawn.bind(this);
    this.initGame = this.initGame.bind(this);
    this.onPawnClick = this.onPawnClick.bind(this);
    this.handleGameChange = this.handleGameChange.bind(this);
  }
  componentDidMount() {
    this.props.setInGame();
    this.gameComponentRef.current.appendStats();
    this.initGame();
    this.profilesComponent.restartProgress();
    let lastId=0;
    const addMessage = () => {
      this.snackbarComponentRef.addMessage('Start gry!'+lastId++, lastId % 2 ? 'red' : '');
    }
    this.messagesIntervalId = setInterval(() => {
      addMessage();
      // this.setState({
      //   activeDice: !this.state.activeDice,
      // });
    }, 3000);
    addMessage();
    window.engine = this.gameComponentRef.current.engine;
  }
  componentWillUnmount() {
    this.props.unsetInGame();
    clearInterval(this.messagesIntervalId);
  }
  movePawn(e) {
    const { pawns, selectedPawnId, pawnInput, players, gameName, } = this.state,
      pawn = pawns.find(pawn => pawn.id === selectedPawnId),
      playerIds = players.map(player => player.id),
      gameState = {pawns, playerIds,},
      game = Games[gameName];

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
      let moves = this.gameComponentRef.current.checkMoves(gameState, +pawnInput, this.state.currentPlayerId);

      if (moves.length) {
        let move = moves.find(move => move.pawnId === selectedPawnId);

        if (move && move.fieldSequence.length) {
          move.fieldSequence = move.fieldSequence.map(singleMove => ({
            ...singleMove,
            animationLength: AnimationLengths.movePawn,
          }));

          let fieldSequence = move.fieldSequence || [],
            lastField = fieldSequence[fieldSequence.length - 1],
            anotherPawns = pawns.filter(pawn =>
              pawn.playerId !== this.state.currentPlayerId &&
              pawn.x === lastField.x &&
              pawn.z === lastField.z
            ) || [];

          this.gameComponentRef.current.movePawn({pawnId: pawn.id, fieldSequence,})
            .then(() =>{
              let newX = lastField.x,
                newZ = lastField.z;

              this.setState({
                pawns: updateObjectInArray(this.state.pawns, {id: pawn.id, item: {x: newX, z: newZ,}, }),
              });
            });

          if (anotherPawns.length) {
            let anotherPawn = anotherPawns[0],
              anotherPawnSpawnFields = BoardUtils.getEmptySpawnFields(pawns, anotherPawn.playerIndex),
              spawnField = (anotherPawnSpawnFields && anotherPawnSpawnFields[0]) || null,
              anotherPawnMove = { pawnId: anotherPawn.id, fieldSequence: [{x: spawnField.x, z: spawnField.z, animationLength: game.AnimationLengths.movePawn,},], };

            if (anotherPawnMove) {
              this.gameComponentRef.current.movePawn(anotherPawnMove)
                .then(() =>{
                  let newX = spawnField.x,
                    newZ = spawnField.z;

                  this.setState({
                    pawns: updateObjectInArray(this.state.pawns, {id: anotherPawnMove.pawnId, item: {x: newX, z: newZ,}, }),
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
  rollDice = (number) => {
    let diceNumber = isNaN(number) ? 6 : number;
    this.gameComponentRef.current.engine.rollDice(diceNumber, [randomColor('rgb'),randomColor('rgb'),] );
  }
  handleInputChange(e) {
    if (!e.target.name) return;

    localStorage.setItem(e.target.name, e.target.value);
    this.setState({
      [e.target.name]: e.target.value,
    });
  }
  initGame() {
    const { numberOfPlayers, pawnSet, firstPlayerIndex, gameName, } = this.state;
    const pawnsForPlayer = Games[gameName].Config.PawnsForPlayer;

    let newPlayers = [],
      newPawns,
      firstPlayer,
      firstPlayerId;

    for(let i = 0; i < numberOfPlayers; i++) {
      let newPlayer = randomPlayer();
      newPlayer.index = newPlayers.length;
      newPlayers.push(newPlayer);
    }

    newPawns = PawnSets[gameName][pawnSet].slice(0,pawnsForPlayer*numberOfPlayers);

    for(let pawnI in newPawns) {
      let pawn = newPawns[pawnI],
        player = newPlayers[Math.floor(pawnI / pawnsForPlayer)];

      pawn.color = player.color;
      pawn.playerId = player.id;
      pawn.playerIndex = player.index;
    }

    firstPlayer = firstPlayerIndex && newPlayers[firstPlayerIndex-1];
    firstPlayerId = (firstPlayer && firstPlayer.id) || 0;

    this.setState({
      pawns: newPawns,
      players: newPlayers,
      selectedPawnId: newPawns[0].id,
      currentPlayerId: newPawns[0].playerId,
      gameId: nextId(),
      firstPlayerId,
    }, () => {
    });
    setTimeout(() => {
      this.gameComponentRef.current.initGame(Games[gameName].AnimationLengths.startGameBase);
    }, 100);
    setTimeout(() => {
      this.gameComponentRef.current.engine.selectPawns([newPawns[0].id,]);
    }, 500);

    this.timerComponentRef.current.start(5*60*1000);
  }
  clearGame = () => {
    this.setState({
      pawns: [],
      players: [],
      selectedPawnId: [],
      currentPlayerId: [],
      gameId: null,
      firstPlayerId: null,
    }, () => {
      this.gameComponentRef.current.clearGame();
    });
  }
  selectPawn = (pawnId) => {
    const { pawns, selectedPawnId, } = this.state;

    if (selectedPawnId === pawnId) {
      this.setState({
        currentPlayerId: null,
        selectedPawnId: null,
      }, () => {
        this.profilesComponent.stopProgress();
        this.gameComponentRef.current.engine.selectPawns([]);
      });
    } else {
      const playerId = pawns.find(pawn => pawn.id === pawnId).playerId;

      this.setState({
        currentPlayerId: playerId,
        selectedPawnId: pawnId,
      }, () => {
        this.profilesComponent.restartProgress(playerId);
        this.gameComponentRef.current.engine.selectPawns([pawnId,]);
      });
    }
  }
  onPawnClick(pawnId) {
    this.selectPawn(pawnId);
  }
  handleGameChange(e) {
    const pawnSet = Object.keys(PawnSets[e.target.value])[0];
    localStorage.setItem(e.target.name, e.target.value);
    localStorage.setItem('pawnSet', pawnSet);
    this.gameComponentRef.current.engine.changeGame(e.target.value);
    this.setState({
      gameName: e.target.value,
      pawnSet,
    });
  }
  handleSetGame() {
    console.log('handleSetGame');
  }
  handleClick = (e) => {
    if (e.pawnId) {
      this.selectPawn(e.pawnId);
    }
  }
  toggleControls = () => {
    this.gameComponentRef.current.engine.toggleControls();
  }
  resetControls = () => {
    this.gameComponentRef.current.engine.resetControls();
  }
  render() {
    const { players, pawns, selectedPawnId, pawnInput, numberOfPlayers, pawnSet, firstPlayerIndex,
        firstPlayerId, currentPlayerId, gameName, messages, activeDice: active,
      } = this.state,
      pawnsElements = pawns.map(pawn => {
        return <div key={pawn.id}
          className={'pawn' + (pawn.id===selectedPawnId?' pawn--selected':'')}
          onClick={() => { this.onPawnClick(pawn.id)} }>
          {`${pawn.id}:${pawn.color}:${pawn.x},${pawn.z}`}
        </div>;
      });
    const games = Object.keys(Games).filter(gameName => gameName !== 'Game');

    return <div className="engine-page">
      <div className="settings">
        <div className="settings-title">Game</div>
        <div className="input-row">
          <div>Choose game</div>
          <div>
            <select name="gameName" onChange={this.handleGameChange} value={gameName}>
              {games.map(gameName => (
                <option value={gameName} key={gameName} >{gameName}</option>
              ))}
            </select>
          </div>
          <button type="button" onClick={this.handleSetGame}>Set game</button>
        </div>
        <div className="settings-title">Settings</div>
        <div className="settings-body">
          <div className="input-row">
            <div>Number of players</div>
            <div>
              <input tabIndex={1} type="number" min={1} max={4} value={numberOfPlayers} name="numberOfPlayers" onChange={this.handleInputChange}/>
            </div>
          </div>
          <div className="input-row">
            <div>First player</div>
            <div>
              <input type="number" min={1} max={numberOfPlayers} value={firstPlayerIndex} name="firstPlayerIndex" onChange={this.handleInputChange}/>
            </div>
          </div>
          <div className="input-row">
            <div>Pawns set</div>
            <div>
              <select name="pawnSet" onChange={this.handleInputChange} value={pawnSet}>
                {Object.keys(PawnSets[gameName]).map( pawnSetName => (
                  <option value={pawnSetName} key={`${gameName}-${pawnSetName}`}>{`${gameName} - ${pawnSetName}`}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="button" onClick={this.initGame}>Init game</button>
          <button type="button" onClick={this.clearGame}>Clear game</button>
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
          <button onClick={this.rollDice}>RZUĆ KOŚCIĄ</button>
        </div>
        <div className="settings-title">Camera</div>
        <div className="settings-body">
          <div className="input-row">
            <div>
              <button onClick={this.toggleControls}>TOGGLE CONTROLS</button>
              <button onClick={this.resetControls}>RESET</button>
            </div>
          </div>
        </div>
      </div>
      <GameComponent
        ref={ this.gameComponentRef }
        onClick={this.handleClick}
        pawns={this.state.pawns}
        players={this.state.players}
        moves={this.state.moves}
        gameId={this.state.gameId}
        gameName={this.state.gameName}
        firstPlayerId={firstPlayerId}
        players={players}
      />
      <PlayerProfiles
        players={players}
        firstPlayerId={firstPlayerId}
        currentPlayerId={currentPlayerId}
        hidden={false}
        roundLength={Config.RoundLength}
        ref={(element) => {this.profilesComponent = element; }}
      />
      <Timer ref={this.timerComponentRef}/>
      <Snackbar ref={(element) => {this.snackbarComponentRef = element;}} />
      <Dices
        visible
        active={active}
        onClick={this.rollDice}
      />
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