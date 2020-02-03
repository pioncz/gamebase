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
    const { lastProgress, } = this.state;
    const { roundLength, players, firstPlayerId, } = this.props;
    const firstIndex = players.findIndex(player => player.id === firstPlayerId);
    const currentIndex = players.findIndex(player => player.id === currentPlayerId);
    const whichDiv = (currentIndex + (4 - firstIndex)) % 4;
    const div = this.containerRef.current.children[whichDiv];
    const progress = div.querySelector('.progress');

    if (lastProgress !== null) {
      const oldDiv = this.containerRef.current.children[lastProgress];
      const oldProgress = oldDiv.querySelector('.progress');
      oldProgress.style.animationName = '';
      oldProgress.style.animationDuration = '';
    }

    progress.style.animationName = 'shortenWidth';
    progress.style.animationDuration = `${roundLength/1000}s`;

    this.setState({
      lastProgress: whichDiv,
    });
  }
  stopProgress = () => {
    const { lastProgress, } = this.state;

    if (lastProgress === null) {
      return;
    }

    const div = this.containerRef.current.children[lastProgress];
    const progress = div.querySelector('.progress');
    progress.style.animationName = '';
    progress.style.animationDuration = '';

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
              <Progress />
            </div>
            <img src={player.avatar} />
          </div>
        })}
      </div>
    )
  }
}