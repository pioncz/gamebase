import React, { Component } from 'react'
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import './index.sass'
import Profile from 'components/profile/index'
import Classnames from 'classnames'

export default class Header extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      menuOpen: false, 
    };
    
    this.toggleMenu = this.toggleMenu.bind(this);
  }
  toggleMenu() {
    this.setState({
      menuOpen: !this.state.menuOpen,
    });
  }
  render() {
    const { player }  = this.props,
      { menuOpen } = this.state,
      headerClass = Classnames({
        'header': true,
        'header--open': menuOpen,
      });
        
    return <header className={headerClass}>
      <div className="links-container">
        <div className="nav-icon" onClick={this.toggleMenu}>
          <div>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
      <div className="menu-container">
        <div className="menu" onClick={this.toggleMenu}>
          {player.state === 'loggedIn' && <Profile player={player} onClick={this.props.logout}></Profile>}
          {player.state === 'loading' && <div>Loading</div>}
          {player.state === 'loggedOut' && <a onClick={this.props.toggleLoginModal}>Login</a>}
          {player.state === 'loggedOut' && <a onClick={this.props.toggleRegistrationModal}>Register</a>}
          <Link to='/'>Home</Link>
          <Link to='/ludo'>Ludo</Link>
          <Link to='/engine'>Engine</Link>
          <Link to='/admin'>Admin</Link>
        </div>
      </div>
    </header>
  }
}