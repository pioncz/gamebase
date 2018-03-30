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
      {user && user.name}
    </div>;
  }
}

export default Profile;