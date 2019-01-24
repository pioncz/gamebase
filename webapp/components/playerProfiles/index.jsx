import React, { Component } from 'react';
import ClassNames from 'classnames';
import './index.sass';

export default class PlayerProfiles extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { players, firstPlayerId, hidden, currentPlayerId } = this.props;
    let playerIndex = players.findIndex(player => player.id === firstPlayerId),
      filteredPlayers = players.slice(0, players.length);

    while (filteredPlayers.length < 4) {
      filteredPlayers.push({});
    }

    // swap players so first will be with id firstPlayerId
    filteredPlayers = filteredPlayers.slice(playerIndex, filteredPlayers.length).concat(filteredPlayers.slice(0, playerIndex));

    return <div className='player-profiles'>
      {filteredPlayers.map((player, index) => {
        let startTimestamp = null,
          endTimestamp = null,
          className = ClassNames({
            'player': true,
            ['player-'+ index]: true,
            'player--hidden': !!hidden || !player.login,
            'player--disconnected': !!player.disconnected,
          });
      
        return <div key={index} className={className}>
          <div className="player-name" style={{
            [(index%3?'borderLeft':'borderRight')]: "3px solid " + player.color
          }}>
            {player.login}
            {player.id === currentPlayerId && <p className={'arrow ' + (index%3?'right':'left')}></p>}
            {/* <Progress startTimestamp={startTimestamp} endTimestamp={endTimestamp} /> */}
          </div>
          <img src={player.avatar} />
        </div>
      })}
    </div>
  }
}