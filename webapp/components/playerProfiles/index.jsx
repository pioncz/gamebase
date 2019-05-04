import React, { Component } from 'react';
import ClassNames from 'classnames';
import './index.sass';
import Progress from 'components/progress'

export default class PlayerProfiles extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPlayerProgress: 0,
    };
    this.updateInterval = null;
    this.lastTick = null;
    this.updateProgressValue = this.updateProgressValue.bind(this);
    this.stopProgress = this.stopProgress.bind(this);
    this.restartProgress = this.restartProgress.bind(this);
  }
  componentWillUnmount() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
  restartProgress() {
    this.stopProgress();
    this.setState({
      currentPlayerProgress: 1,
    }, () =>{
      this.updateInterval = setInterval(this.updateProgressValue, 60);
    });
  }
  stopProgress() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.updateInterval = null;
    this.lastTick = null;
    this.setState({
      currentPlayerProgress: 0,
    });
  }
  updateProgressValue() {
    const { currentPlayerProgress } = this.state;
    const { roundLength } = this.props;
    const currentTime = Date.now();
    let playerProgress;
    if (this.lastTick) {
      playerProgress = currentPlayerProgress - (currentTime - this.lastTick) / roundLength;
    } else {
      playerProgress = currentPlayerProgress;
    }
    
    this.setState({
      currentPlayerProgress: playerProgress,
    }, () => {
      if (playerProgress <= 0) {
        this.stopProgress();
      }
      this.lastTick = currentTime;
    });
  }
  render() {
    const { players, firstPlayerId, hidden, currentPlayerId } = this.props;
    const { currentPlayerProgress } = this.state;
    let playerIndex = players.findIndex(player => player.id === firstPlayerId),
      filteredPlayers = players.slice(0, players.length);

    while (filteredPlayers.length < 4) {
      filteredPlayers.push({});
    }

    // swap players so first will be with id firstPlayerId
    filteredPlayers = filteredPlayers.slice(playerIndex, filteredPlayers.length).concat(filteredPlayers.slice(0, playerIndex));

    return <div className='player-profiles'>
      {filteredPlayers.map((player, index) => {
        let className = ClassNames({
            'player': true,
            ['player-'+ index]: true,
            'player--hidden': !!hidden || !player.login,
            'player--disconnected': !!player.disconnected,
          });
      
        return <div key={index} className={className}>
          <div className="player-name" style={{
            [(index%3?'borderLeft':'borderRight')]: "6px solid " + player.color
          }}>
            {player.login}
            {player.id === currentPlayerId && <p className={'arrow ' + (index%3?'right':'left')}></p>}
            <Progress 
              value={player.id === currentPlayerId ? currentPlayerProgress : 0} 
            />
          </div>
          <img src={player.avatar} />
        </div>
      })}
    </div>
  }
}