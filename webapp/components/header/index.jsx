import React, { Component } from 'react'
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import './index.sass'
import Profile from 'components/profile/index'

export default class Header extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { player }  = this.props;
        
    return <header>
      <div className="left-pane">
        <Link to='/'>Home</Link>
        <Link to='/ludo'>Ludo</Link>
        <Link to='/engine'>Engine</Link>
        <Link to='/admin'>Admin</Link>
      </div>
      <div className="right-pane">
        {player.state === 'loggedIn' && <Profile player={player} onClick={this.props.logout}></Profile>}
        {player.state === 'loading' && <div>Loading</div>}
        {player.state === 'loggedOut' && 
          <div>
            <a onClick={this.props.toggleLoginModal}>Login</a>
            <a onClick={this.props.toggleRegistrationModal}>Register</a>
          </div>}
      </div>
    </header>
  }
}