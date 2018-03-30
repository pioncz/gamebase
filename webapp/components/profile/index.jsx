import React, { Component } from 'react'
import './index.sass'

class Profile extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    let { user, className } = this.props;
    
    className = className || '';
    
    return <div className={`profile ${className}`}>
      {user && <div className='name'>{user.name}</div>}
      {user && <div className='avatar' style={{
        backgroundImage: `url(${user.avatar})`,
        backgroundSize: 'cover',
        borderRadius: '50%',
      }}></div>}
    </div>;
  }
}

export default Profile;