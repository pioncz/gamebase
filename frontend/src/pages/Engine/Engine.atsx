import { useContext, useEffect, useRef, useState } from 'react';
import { nextId, randomColor, log, updateObjectInArray, randomPlayer, PawnSets } from './EngineHelpers';
import Games from './../../../../games/Games.js';
import { Config } from './../../../../games/ludo/index.js';
import WSConnectorContext from '@/contexts/WSConnector/WSConnectorContext';
import { useDispatch } from 'react-redux';
import { setInGame } from '@/store/GameSlice.js';
import { Pawn } from '@/lib/types.js';
import { GameComponentHandle } from '@/components/GameComponent/GameComponent.js';
import { TimerHandle } from '@/components/Timer/Timer.js';
import { PlayerProfilesHandle } from '@/components/PlayerProfiles/PlayerProfiles.js';

const EnginePage = () => {
  const [gameName, setGameName] = useState(localStorage.gameName || Games.Ludo.Name);
  const [pawns, setPawns] = useState<Pawn[]>([]);
  const [moves, setMoves] = useState([]);
  const [players, setPlayers] = useState([]);
  const [pawnInput, setPawnInput] = useState(localStorage.pawnInput || '');
  const [selectedPawnId, setSelectedPawnId] = useState(null);
  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [numberOfPlayers, setNumberOfPlayers] = useState(localStorage.numberOfPlayers || 1);
  const [pawnSet, setPawnSet] = useState(localStorage.pawnSet || 'initial');
  const [firstPlayerIndex, setFirstPlayerIndex] = useState(localStorage.firstPlayerIndex || 1);
  const [firstPlayerId, setFirstPlayerId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeDice, setActiveDice] = useState(false);
  const gameComponentRef = useRef<GameComponentHandle>(null);
  const timerComponentRef = useRef<TimerHandle>(null);
  const snackbarComponentRef = useRef(null);
  const profilesComponentRef = useRef<PlayerProfilesHandle>(null);
  const { socket } = useContext(WSConnectorContext);
  const dispatch = useDispatch();

  const pawnsElements = pawns.map(pawn => {
    return <div key={pawn.id}
      className={'pawn' + (pawn.id===selectedPawnId?' pawn--selected':'')}
      onClick={() => { onPawnClick(pawn.id)} }>
      {`${pawn.id}:${pawn.color}:${pawn.x},${pawn.z}`}
    </div>;
  });
  const games = Object.keys(Games).filter(gameName => gameName !== 'Game');

  //   movePawn(e) {
//     const { pawns, selectedPawnId, pawnInput, players, gameName, } = this.state,
//       pawn = pawns.find(pawn => pawn.id === selectedPawnId),
//       playerIds = players.map(player => player.id),
//       gameState = {pawns, playerIds,},
//       game = Games[gameName];

//     if (!selectedPawnId) {
//       log('No pawn');
//       e.preventDefault();
//       return false;
//     }

//     if (isNaN(pawnInput)) {
//       log('Wrong params');
//       e.preventDefault();
//       return false;
//     }

//     try {
//       let moves = this.gameComponentRef.current.checkMoves(gameState, +pawnInput, this.state.currentPlayerId);

//       if (moves.length) {
//         let move = moves.find(move => move.pawnId === selectedPawnId);

//         if (move && move.fieldSequence.length) {
//           move.fieldSequence = move.fieldSequence.map(singleMove => ({
//             ...singleMove,
//             animationLength: AnimationLengths.movePawn,
//           }));

//           let fieldSequence = move.fieldSequence || [],
//             lastField = fieldSequence[fieldSequence.length - 1],
//             anotherPawns = pawns.filter(pawn =>
//               pawn.playerId !== this.state.currentPlayerId &&
//               pawn.x === lastField.x &&
//               pawn.z === lastField.z
//             ) || [];

//           this.gameComponentRef.current.movePawn({pawnId: pawn.id, fieldSequence,})
//             .then(() =>{
//               let newX = lastField.x,
//                 newZ = lastField.z;

//               this.setState({
//                 pawns: updateObjectInArray(this.state.pawns, {id: pawn.id, item: {x: newX, z: newZ,}, }),
//               });
//             });

//           if (anotherPawns.length) {
//             let anotherPawn = anotherPawns[0],
//               anotherPawnSpawnFields = BoardUtils.getEmptySpawnFields(pawns, anotherPawn.playerIndex),
//               spawnField = (anotherPawnSpawnFields && anotherPawnSpawnFields[0]) || null,
//               anotherPawnMove = { pawnId: anotherPawn.id, fieldSequence: [{x: spawnField.x, z: spawnField.z, animationLength: game.AnimationLengths.movePawn,},], };

//             if (anotherPawnMove) {
//               this.gameComponentRef.current.movePawn(anotherPawnMove)
//                 .then(() =>{
//                   let newX = spawnField.x,
//                     newZ = spawnField.z;

//                   this.setState({
//                     pawns: updateObjectInArray(this.state.pawns, {id: anotherPawnMove.pawnId, item: {x: newX, z: newZ,}, }),
//                   });
//                 });
//             }
//           }
//         } else {
//           log('No possible move for this pawn and dice value')
//         }
//       } else {
//         log('No available moves');
//       }

//     } catch(e) {
//       log(e);
//     }

//     e.preventDefault();
//     return false;
//   }
 const rollDice = (number: number) => {
    const diceNumber = isNaN(number) ? 6 : number;
    gameComponentRef.current?.rollDice(diceNumber, [String(randomColor('rgb')),String(randomColor('rgb')),] );
  }
    // const handleInputChange = (e) => {
    //   if (!e.target.name) return;

    //   localStorage.setItem(e.target.name, e.target.value);
    //   this.setState({
    //     [e.target.name]: e.target.value,
    //   });
    // }
//   initGame() {
//     const { numberOfPlayers, pawnSet, firstPlayerIndex, gameName, } = this.state;
//     const pawnsForPlayer = Games[gameName].Config.PawnsForPlayer;

//     let newPlayers = [],
//       newPawns,
//       firstPlayer,
//       firstPlayerId;

//     for(let i = 0; i < numberOfPlayers; i++) {
//       let newPlayer = randomPlayer();
//       newPlayer.index = newPlayers.length;
//       newPlayers.push(newPlayer);
//     }

//     newPawns = PawnSets[gameName][pawnSet].slice(0,pawnsForPlayer*numberOfPlayers);

//     for(let pawnI in newPawns) {
//       let pawn = newPawns[pawnI],
//         player = newPlayers[Math.floor(pawnI / pawnsForPlayer)];

//       pawn.color = player.color;
//       pawn.playerId = player.id;
//       pawn.playerIndex = player.index;
//     }

//     firstPlayer = firstPlayerIndex && newPlayers[firstPlayerIndex-1];
//     firstPlayerId = (firstPlayer && firstPlayer.id) || 0;

//     this.setState({
//       pawns: newPawns,
//       players: newPlayers,
//       selectedPawnId: newPawns[0].id,
//       currentPlayerId: newPawns[0].playerId,
//       gameId: nextId(),
//       firstPlayerId,
//     }, () => {
//     });
//     setTimeout(() => {
//       this.gameComponentRef.current.initGame(Games[gameName].AnimationLengths.startGameBase);
//     }, 100);
//     setTimeout(() => {
//       this.gameComponentRef.current.engine.selectPawns([newPawns[0].id,]);
//     }, 500);

//     this.timerComponentRef.current.start(5*60*1000);
//   }
 const clearGame = () => {
   setPawns([]);
   setPlayers([]);
   setSelectedPawnId(null);
   setCurrentPlayerId(null);
   setGameId(null);
    setFirstPlayerId(null);
      gameComponentRef.current?.clearGame();
  }
//   selectPawn = (pawnId) => {
//     const { pawns, selectedPawnId, } = this.state;

//     if (selectedPawnId === pawnId) {
//       this.setState({
//         currentPlayerId: null,
//         selectedPawnId: null,
//       }, () => {
//         this.profilesComponent.stopProgress();
//         this.gameComponentRef.current.engine.selectPawns([]);
//       });
//     } else {
//       const playerId = pawns.find(pawn => pawn.id === pawnId).playerId;

//       this.setState({
//         currentPlayerId: playerId,
//         selectedPawnId: pawnId,
//       }, () => {
//         this.profilesComponent.restartProgress(playerId);
//         this.gameComponentRef.current.engine.selectPawns([pawnId,]);
//       });
//     }
//   }
    const onPawnClick = (pawnId) => {
      selectPawn(pawnId);
    }
//   handleGameChange(e) {
//     const pawnSet = Object.keys(PawnSets[e.target.value])[0];
//     localStorage.setItem(e.target.name, e.target.value);
//     localStorage.setItem('pawnSet', pawnSet);
//     this.gameComponentRef.current.engine.changeGame(e.target.value);
//     this.setState({
//       gameName: e.target.value,
//       pawnSet,
//     });
//   }
//   handleSetGame() {
//     console.log('handleSetGame');
//   }
//   handleClick = (e) => {
//     if (e.pawnId) {
//       this.selectPawn(e.pawnId);
//     }
//   }
//   toggleControls = () => {
//     this.gameComponentRef.current.engine.toggleControls();
//   }
//   resetControls = () => {
//     this.gameComponentRef.current.engine.resetControls();
//   }

  useEffect(() => {
    dispatch(setInGame(true));
    gameComponentRef?.current?.appendStats();
    initGame();
    profilesComponentRef?.current?.restartProgress();
    let lastId=0;
    const addMessage = () => {
      snackbarComponentRef?.current?.addMessage('Start gry!'+lastId++, lastId % 2 ? 'red' : '');
    }
    const messagesIntervalId = setInterval(() => {
      addMessage();
      // this.setState({
      //   activeDice: !this.state.activeDice,
      // });
    }, 3000);
    addMessage();
    window.engine = gameComponentRef.current?.engine;

    return () => {
      dispatch(setInGame(false));
      clearInterval(messagesIntervalId);
    }
  }, []);

  return (<div className="engine-page">
    <div className="settings">
      <div className="settings-title">Game</div>
      <div className="input-row">
        <div>Choose game</div>
        <div>
          <select name="gameName" onChange={handleGameChange} value={gameName}>
            {games.map(gameName => (
              <option value={gameName} key={gameName} >{gameName}</option>
            ))}
          </select>
        </div>
        <button type="button" onClick={handleSetGame}>Set game</button>
      </div>
      <div className="settings-title">Settings</div>
      <div className="settings-body">
        <div className="input-row">
          <div>Number of players</div>
          <div>
            <input tabIndex={1} type="number" min={1} max={4} value={numberOfPlayers} name="numberOfPlayers" onChange={handleInputChange} />
          </div>
        </div>
        <div className="input-row">
          <div>First player</div>
          <div>
            <input type="number" min={1} max={numberOfPlayers} value={firstPlayerIndex} name="firstPlayerIndex" onChange={handleInputChange} />
          </div>
        </div>
        <div className="input-row">
          <div>Pawns set</div>
          <div>
            <select name="pawnSet" onChange={handleInputChange} value={pawnSet}>
              {Object.keys(PawnSets[gameName]).map(pawnSetName => (
                <option value={pawnSetName} key={`${gameName}-${pawnSetName}`}>{`${gameName} - ${pawnSetName}`}</option>
              ))}
            </select>
          </div>
        </div>
        <button type="button" onClick={initGame}>Init game</button>
        <button type="button" onClick={clearGame}>Clear game</button>
        <hr />
        <div className="pawns">
          <div className="pawns-title">Pawns:</div>
          <div className="pawns-body">
            {pawnsElements}
          </div>
        </div>
        <div className="input-row">
          <div>move pawn</div>
          <div><input tabIndex={1} type="number" min={1} max={6} value={pawnInput} name="pawnInput" onChange={this.handleInputChange} /></div>
        </div>
        <button onClick={movePawn}>RUSZ PIONKA</button>
        <button onClick={rollDice}>RZUĆ KOŚCIĄ</button>
      </div>
      <div className="settings-title">Camera</div>
      <div className="settings-body">
        <div className="input-row">
          <div>
            <button onClick={toggleControls}>TOGGLE CONTROLS</button>
            <button onClick={resetControls}>RESET</button>
          </div>
        </div>
      </div>
    </div>
    <GameComponent
      ref={gameComponentRef}
      onClick={handleClick}
      pawns={pawns}
      players={players}
      moves={moves}
      gameId={gameId}
      gameName={gameName}
      firstPlayerId={firstPlayerId}
      players={players}
    />
    <PlayerProfiles
      players={players}
      firstPlayerId={firstPlayerId}
      currentPlayerId={currentPlayerId}
      hidden={false}
      roundLength={Config.RoundLength}
      ref={profilesComponentRef}
    />
    <Timer ref={timerComponentRef} />
    <Snackbar ref={snackbarComponentRef} />
    <Dices
      visible
      active={active}
      onClick={rollDice}
    />
  </div>);
};

export default EnginePage;

// import React, { Component, } from 'react';
// import GameComponent from 'components/gameComponent/';
// import './index.sass';
// import BoardUtils from 'ludo/BoardUtils';
// import Timer from 'components/timer';
// import { actions, } from 'shared/redux/api';
// import {connect,} from "react-redux";
// import {bindActionCreators,} from "redux";
// import PlayerProfiles from 'components/playerProfiles';
// import { Config, AnimationLengths, } from 'ludo';
// import Games from 'Games.js';
// import Snackbar from 'components/snackbar';
// import Dices from 'components/dices';

// class Engine extends Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       gameName: localStorage.gameName || Games.Ludo.Name,
//       pawns: [],
//       moves: [],
//       players: [],
//       pawnInput: localStorage.pawnInput || '',
//       selectedPawnId: null,
//       currentPlayerId: null,
//       gameId: null,
//       numberOfPlayers: localStorage.numberOfPlayers || 1,
//       pawnSet: localStorage.pawnSet || 'initial',
//       firstPlayerIndex: localStorage.firstPlayerIndex || 1,
//       firstPlayerId: null,
//       messages: [],
//       activeDice: false,
//     };

//     this.gameComponentRef = React.createRef();
//     this.timerComponentRef = React.createRef();
//     this.snackbarComponentRef = React.createRef();
//     this.connectorInstance = this.props.connectorInstance;

//     this.handleInputChange = this.handleInputChange.bind(this);
//     this.movePawn = this.movePawn.bind(this);
//     this.initGame = this.initGame.bind(this);
//     this.onPawnClick = this.onPawnClick.bind(this);
//     this.handleGameChange = this.handleGameChange.bind(this);
//   }
//   componentDidMount() {
//     this.props.setInGame();
//     this.gameComponentRef.current.appendStats();
//     this.initGame();
//     this.profilesComponent.restartProgress();
//     let lastId=0;
//     const addMessage = () => {
//       this.snackbarComponentRef.addMessage('Start gry!'+lastId++, lastId % 2 ? 'red' : '');
//     }
//     this.messagesIntervalId = setInterval(() => {
//       addMessage();
//       // this.setState({
//       //   activeDice: !this.state.activeDice,
//       // });
//     }, 3000);
//     addMessage();
//     window.engine = this.gameComponentRef.current.engine;
//   }
//   componentWillUnmount() {
//     this.props.unsetInGame();
//     clearInterval(this.messagesIntervalId);
//   }
//   movePawn(e) {
//     const { pawns, selectedPawnId, pawnInput, players, gameName, } = this.state,
//       pawn = pawns.find(pawn => pawn.id === selectedPawnId),
//       playerIds = players.map(player => player.id),
//       gameState = {pawns, playerIds,},
//       game = Games[gameName];

//     if (!selectedPawnId) {
//       log('No pawn');
//       e.preventDefault();
//       return false;
//     }

//     if (isNaN(pawnInput)) {
//       log('Wrong params');
//       e.preventDefault();
//       return false;
//     }

//     try {
//       let moves = this.gameComponentRef.current.checkMoves(gameState, +pawnInput, this.state.currentPlayerId);

//       if (moves.length) {
//         let move = moves.find(move => move.pawnId === selectedPawnId);

//         if (move && move.fieldSequence.length) {
//           move.fieldSequence = move.fieldSequence.map(singleMove => ({
//             ...singleMove,
//             animationLength: AnimationLengths.movePawn,
//           }));

//           let fieldSequence = move.fieldSequence || [],
//             lastField = fieldSequence[fieldSequence.length - 1],
//             anotherPawns = pawns.filter(pawn =>
//               pawn.playerId !== this.state.currentPlayerId &&
//               pawn.x === lastField.x &&
//               pawn.z === lastField.z
//             ) || [];

//           this.gameComponentRef.current.movePawn({pawnId: pawn.id, fieldSequence,})
//             .then(() =>{
//               let newX = lastField.x,
//                 newZ = lastField.z;

//               this.setState({
//                 pawns: updateObjectInArray(this.state.pawns, {id: pawn.id, item: {x: newX, z: newZ,}, }),
//               });
//             });

//           if (anotherPawns.length) {
//             let anotherPawn = anotherPawns[0],
//               anotherPawnSpawnFields = BoardUtils.getEmptySpawnFields(pawns, anotherPawn.playerIndex),
//               spawnField = (anotherPawnSpawnFields && anotherPawnSpawnFields[0]) || null,
//               anotherPawnMove = { pawnId: anotherPawn.id, fieldSequence: [{x: spawnField.x, z: spawnField.z, animationLength: game.AnimationLengths.movePawn,},], };

//             if (anotherPawnMove) {
//               this.gameComponentRef.current.movePawn(anotherPawnMove)
//                 .then(() =>{
//                   let newX = spawnField.x,
//                     newZ = spawnField.z;

//                   this.setState({
//                     pawns: updateObjectInArray(this.state.pawns, {id: anotherPawnMove.pawnId, item: {x: newX, z: newZ,}, }),
//                   });
//                 });
//             }
//           }
//         } else {
//           log('No possible move for this pawn and dice value')
//         }
//       } else {
//         log('No available moves');
//       }

//     } catch(e) {
//       log(e);
//     }

//     e.preventDefault();
//     return false;
//   }
//   rollDice = (number) => {
//     let diceNumber = isNaN(number) ? 6 : number;
//     this.gameComponentRef.current.engine.rollDice(diceNumber, [randomColor('rgb'),randomColor('rgb'),] );
//   }
//   handleInputChange(e) {
//     if (!e.target.name) return;

//     localStorage.setItem(e.target.name, e.target.value);
//     this.setState({
//       [e.target.name]: e.target.value,
//     });
//   }
//   initGame() {
//     const { numberOfPlayers, pawnSet, firstPlayerIndex, gameName, } = this.state;
//     const pawnsForPlayer = Games[gameName].Config.PawnsForPlayer;

//     let newPlayers = [],
//       newPawns,
//       firstPlayer,
//       firstPlayerId;

//     for(let i = 0; i < numberOfPlayers; i++) {
//       let newPlayer = randomPlayer();
//       newPlayer.index = newPlayers.length;
//       newPlayers.push(newPlayer);
//     }

//     newPawns = PawnSets[gameName][pawnSet].slice(0,pawnsForPlayer*numberOfPlayers);

//     for(let pawnI in newPawns) {
//       let pawn = newPawns[pawnI],
//         player = newPlayers[Math.floor(pawnI / pawnsForPlayer)];

//       pawn.color = player.color;
//       pawn.playerId = player.id;
//       pawn.playerIndex = player.index;
//     }

//     firstPlayer = firstPlayerIndex && newPlayers[firstPlayerIndex-1];
//     firstPlayerId = (firstPlayer && firstPlayer.id) || 0;

//     this.setState({
//       pawns: newPawns,
//       players: newPlayers,
//       selectedPawnId: newPawns[0].id,
//       currentPlayerId: newPawns[0].playerId,
//       gameId: nextId(),
//       firstPlayerId,
//     }, () => {
//     });
//     setTimeout(() => {
//       this.gameComponentRef.current.initGame(Games[gameName].AnimationLengths.startGameBase);
//     }, 100);
//     setTimeout(() => {
//       this.gameComponentRef.current.engine.selectPawns([newPawns[0].id,]);
//     }, 500);

//     this.timerComponentRef.current.start(5*60*1000);
//   }
//   clearGame = () => {
//     this.setState({
//       pawns: [],
//       players: [],
//       selectedPawnId: [],
//       currentPlayerId: [],
//       gameId: null,
//       firstPlayerId: null,
//     }, () => {
//       this.gameComponentRef.current.clearGame();
//     });
//   }
//   selectPawn = (pawnId) => {
//     const { pawns, selectedPawnId, } = this.state;

//     if (selectedPawnId === pawnId) {
//       this.setState({
//         currentPlayerId: null,
//         selectedPawnId: null,
//       }, () => {
//         this.profilesComponent.stopProgress();
//         this.gameComponentRef.current.engine.selectPawns([]);
//       });
//     } else {
//       const playerId = pawns.find(pawn => pawn.id === pawnId).playerId;

//       this.setState({
//         currentPlayerId: playerId,
//         selectedPawnId: pawnId,
//       }, () => {
//         this.profilesComponent.restartProgress(playerId);
//         this.gameComponentRef.current.engine.selectPawns([pawnId,]);
//       });
//     }
//   }
//   onPawnClick(pawnId) {
//     this.selectPawn(pawnId);
//   }
//   handleGameChange(e) {
//     const pawnSet = Object.keys(PawnSets[e.target.value])[0];
//     localStorage.setItem(e.target.name, e.target.value);
//     localStorage.setItem('pawnSet', pawnSet);
//     this.gameComponentRef.current.engine.changeGame(e.target.value);
//     this.setState({
//       gameName: e.target.value,
//       pawnSet,
//     });
//   }
//   handleSetGame() {
//     console.log('handleSetGame');
//   }
//   handleClick = (e) => {
//     if (e.pawnId) {
//       this.selectPawn(e.pawnId);
//     }
//   }
//   toggleControls = () => {
//     this.gameComponentRef.current.engine.toggleControls();
//   }
//   resetControls = () => {
//     this.gameComponentRef.current.engine.resetControls();
//   }
//   render() {
//     const { players, pawns, selectedPawnId, pawnInput, numberOfPlayers, pawnSet, firstPlayerIndex,
//         firstPlayerId, currentPlayerId, gameName, messages, activeDice: active,
//       } = this.state,
//       pawnsElements = pawns.map(pawn => {
//         return <div key={pawn.id}
//           className={'pawn' + (pawn.id===selectedPawnId?' pawn--selected':'')}
//           onClick={() => { this.onPawnClick(pawn.id)} }>
//           {`${pawn.id}:${pawn.color}:${pawn.x},${pawn.z}`}
//         </div>;
//       });
//     const games = Object.keys(Games).filter(gameName => gameName !== 'Game');

    // return <div className="engine-page">
    //   <div className="settings">
    //     <div className="settings-title">Game</div>
    //     <div className="input-row">
    //       <div>Choose game</div>
    //       <div>
    //         <select name="gameName" onChange={this.handleGameChange} value={gameName}>
    //           {games.map(gameName => (
    //             <option value={gameName} key={gameName} >{gameName}</option>
    //           ))}
    //         </select>
    //       </div>
    //       <button type="button" onClick={this.handleSetGame}>Set game</button>
    //     </div>
    //     <div className="settings-title">Settings</div>
    //     <div className="settings-body">
    //       <div className="input-row">
    //         <div>Number of players</div>
    //         <div>
    //           <input tabIndex={1} type="number" min={1} max={4} value={numberOfPlayers} name="numberOfPlayers" onChange={this.handleInputChange}/>
    //         </div>
    //       </div>
    //       <div className="input-row">
    //         <div>First player</div>
    //         <div>
    //           <input type="number" min={1} max={numberOfPlayers} value={firstPlayerIndex} name="firstPlayerIndex" onChange={this.handleInputChange}/>
    //         </div>
    //       </div>
    //       <div className="input-row">
    //         <div>Pawns set</div>
    //         <div>
    //           <select name="pawnSet" onChange={this.handleInputChange} value={pawnSet}>
    //             {Object.keys(PawnSets[gameName]).map( pawnSetName => (
    //               <option value={pawnSetName} key={`${gameName}-${pawnSetName}`}>{`${gameName} - ${pawnSetName}`}</option>
    //             ))}
    //           </select>
    //         </div>
    //       </div>
    //       <button type="button" onClick={this.initGame}>Init game</button>
    //       <button type="button" onClick={this.clearGame}>Clear game</button>
    //       <hr />
    //       <div className="pawns">
    //         <div className="pawns-title">Pawns:</div>
    //         <div className="pawns-body">
    //           {pawnsElements}
    //         </div>
    //       </div>
    //       <div className="input-row">
    //         <div>move pawn</div>
    //         <div><input tabIndex={1} type="number" min={1} max={6} value={pawnInput} name="pawnInput" onChange={this.handleInputChange}/></div>
    //       </div>
    //       <button onClick={this.movePawn}>RUSZ PIONKA</button>
    //       <button onClick={this.rollDice}>RZUĆ KOŚCIĄ</button>
    //     </div>
    //     <div className="settings-title">Camera</div>
    //     <div className="settings-body">
    //       <div className="input-row">
    //         <div>
    //           <button onClick={this.toggleControls}>TOGGLE CONTROLS</button>
    //           <button onClick={this.resetControls}>RESET</button>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    //   <GameComponent
    //     ref={ this.gameComponentRef }
    //     onClick={this.handleClick}
    //     pawns={this.state.pawns}
    //     players={this.state.players}
    //     moves={this.state.moves}
    //     gameId={this.state.gameId}
    //     gameName={this.state.gameName}
    //     firstPlayerId={firstPlayerId}
    //     players={players}
    //   />
    //   <PlayerProfiles
    //     players={players}
    //     firstPlayerId={firstPlayerId}
    //     currentPlayerId={currentPlayerId}
    //     hidden={false}
    //     roundLength={Config.RoundLength}
    //     ref={(element) => {this.profilesComponent = element; }}
    //   />
    //   <Timer ref={this.timerComponentRef}/>
    //   <Snackbar ref={(element) => {this.snackbarComponentRef = element;}} />
    //   <Dices
    //     visible
    //     active={active}
    //     onClick={this.rollDice}
    //   />
    // </div>;
//   }
// }

// const {
//   setInGame,
//   unsetInGame,
// } = actions;

// const mapStateToProps = state => ({
// //  pawns: getPawns(state),
// });

// const mapDispatchToProps = dispatch => ({
//   ...bindActionCreators({
//     //    fetchPresentation,
//     setInGame,
//     unsetInGame,
//   }, dispatch),
// });

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps,
// )(Engine);

// .engine-page
//   .settings
//     position: absolute
//     min-width: 300px
//     height: 100vh
//     top: 0
//     right: 0
//     z-index: 150
//     border: 4px solid #bbb
//     background-color: #222
//     font-family: 'Roboto Mono', monospace
//     opacity: .1
//     color: #fff
//     text-transform: uppercase
//     resize: horizontal
//     overflow: hidden
//     transition: .2s all
//     &:hover
//       opacity: .95

//     .pawns
//       font-size: 14px
//       padding: 2px 0px
//       min-height: 100px
//       background: #000
//       .pawns-title
//         padding: 0px 2px
//       .pawns-body
//         max-height: 200px
//         overflow-y: scroll
//         .pawn
//           cursor: pointer
//           &.pawn--selected
//             background: #444
//     button
//       width: 100%
//       text-transform: uppercase
//       background: #000
//       color: #fff
//       border: 2px solid #fff
//     input
//       text-transform: uppercase
//       padding: 1px 2px
//       border: 0
//       outline: 0
//       font-weight: 600
//       &:invalid
//         border-bottom: 2px solid red
//     .settings-title
//       font-weight: 600
//       color: #222
//       background: #bbb
//     .settings-body
//       padding-left: 2px
//       .input-row
//         display: flex
//         > div
//           width: 50%
//           flex-grow: 1
//           flex-shrink: 0