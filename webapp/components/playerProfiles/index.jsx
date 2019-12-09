import React, { Component, createRef, } from 'react';
import ClassNames from 'classnames';
import './index.sass';
import Progress from 'components/progress'

export default class PlayerProfiles extends Component {
  constructor(props) {
    super(props);

    this.state = {
      lastProgress: null,
    };
    this.containerRef = createRef();
  }
  restartProgress = (currentPlayerId) => {
    const { roundLength, players, firstPlayerId, } = this.props;
    const { lastProgress, } = this.state;
    const firstIndex = players.findIndex(player => player.id === firstPlayerId);
    const currentIndex = players.findIndex(player => player.id === currentPlayerId);
    const whichDiv = (currentIndex + (4 - firstIndex)) % 4;
    const div = this.containerRef.current.children[whichDiv];
    const progress = div.querySelector('.progress');

    if (lastProgress !== null) {
      const div = this.containerRef.current.children[lastProgress];
      if (div) {
        const lastProgress = div.querySelector('.progress');
        lastProgress.style.width = '';
        lastProgress.style.transition = '';
      }

    }

    progress.style.transition = '';
    progress.style.width = '100%';
    setTimeout(() => {
      progress.style.transition = `${roundLength/1000}s all linear`;
      progress.style.width = '';
    });
    this.setState({
      lastProgress: whichDiv,
    });
  }
  stopProgress = () => {
    const { currentPlayerId, players, firstPlayerId, } = this.props;
    const firstIndex = players.findIndex(player => player.id === firstPlayerId);
    const currentIndex = players.findIndex(player => player.id === currentPlayerId);
    const whichDiv = (currentIndex + (4 - firstIndex)) % 4;
    const div = this.containerRef.current.children[whichDiv];
    const progress = div.querySelector('.progress');

    progress.style.width = '';
    progress.style.transition = '';

    this.setState({
      lastProgress: null,
    });
  }
  render() {
    const { players, firstPlayerId, hidden, currentPlayerId, } = this.props;
    let playerIndex = players.findIndex(player => player.id === firstPlayerId),
      filteredPlayers = players.slice(0, players.length);

    while (filteredPlayers.length < 4) {
      filteredPlayers.push({});
    }

    // swap players so first will be with id firstPlayerId
    filteredPlayers = filteredPlayers.slice(playerIndex, filteredPlayers.length).concat(filteredPlayers.slice(0, playerIndex));

    return (
      <div
        className='player-profiles'
        ref={this.containerRef}
      >
        {filteredPlayers.map((player, index) => {
          let className = ClassNames({
            'player': true,
            ['player-'+ index]: true,
            'player--hidden': !!hidden || !player.login,
            'player--disconnected': !!player.disconnected,
          });

          return <div key={index} className={className}>
            <div className="player-name" style={{
              'borderColor': player.color,
            }}>
              {player.login}
              {player.id === currentPlayerId && <p className="arrow"></p>}
              <Progress
                value={0}
              />
            </div>
            <img src={player.avatar} />
          </div>
        })}
      </div>
    )
  }
}