import React, { Component } from 'react'
import './index.sass'

class Profile extends Component {
  constructor(props) {
    super(props);
    
    this.onClick = this.onClick.bind(this);
  }
  onClick() {
    if (this.props.onClick) {
      this.props.onClick();
    }
  }
  render() {
    let { player, className } = this.props;
    
    className = className || '';
    
    return <div className={`profile ${className}`} onClick={this.onClick}>
      {player && <div className='avatar' style={{
        backgroundImage: `url(${player.avatar})`,
        backgroundSize: 'cover',
        borderRadius: '50%',
      }}></div>}
      {player && <div className='name'>{player.login}</div>}
    </div>;
  }
}

export default Profile;