import React, { Component, } from 'react'
import { Link, } from 'react-router-dom'
import './index.sass'
import Profile from 'components/profile/index'
import Classnames from 'classnames'
import MenuIcon from '@material-ui/icons/Menu'
import FullscreenButton from 'components/fullscreenButton'
import Utils from 'services/utils';

export default class Header extends Component {
  constructor(props) {
    super(props);

    this.state = {
      menuOpen: false,
      fullscreen: false,
    };

    this.toggleMenu = this.toggleMenu.bind(this);
    this.toggleFullscreen = this.toggleFullscreen.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }
  componentDidMount() {
    document.addEventListener('keypress', this.onKeyUp);
  }
  componentWillUnmount() {
    document.removeEventListener('keypress', this.onKeyUp);
  }
  onKeyUp(e) {
    if (e.key && e.key.toUpperCase() === 'F') {
      this.toggleFullscreen();
    }
  }
  toggleMenu() {
    this.setState({
      menuOpen: !this.state.menuOpen,
    });
  }
  toggleFullscreen() {
    const { fullscreen, } = this.state;

    if (fullscreen) {
      if(document.exitFullscreen) {
        document.exitFullscreen();
      } else if(document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if(document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    } else {
      if(document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if(document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if(document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      } else if(document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }
    }

    this.setState({
      fullscreen: !fullscreen,
    });
  }
  render() {
    const { player, dices, selectDice, }  = this.props,
      { menuOpen, fullscreen, } = this.state,
      headerClass = Classnames({
        'header': true,
        'header--open': menuOpen,
      });
    const isIos = Utils.isIos;

    return <header className={headerClass}>
      <div className="links-container">
        <div className="nav-icon" onClick={this.toggleMenu}>
          <MenuIcon />
        </div>
        {!isIos && <FullscreenButton />}
      </div>
      <div className="menu-container">
        <div className="menu" onClick={this.toggleMenu}>
          {player.state === 'loggedIn' && <Profile player={player} onClick={this.props.logout}></Profile>}
          {player.state === 'loading' && <div>Loading</div>}
          {(player.state === 'loggedOut' || player.temporary) && <a onClick={this.props.toggleLoginModal}>Login</a>}
          {(player.state === 'loggedOut' || player.temporary) && <a onClick={this.props.toggleRegistrationModal}>Register</a>}
          <Link to='/'>Home</Link>
          <Link to='/engine'>Engine</Link>
          <Link to='/admin'>Admin</Link>
          <div className="dices-container">
            {dices.map(dice => (
              <div key={dice.id} style={{background: dice.colors[0],}} className="dice" onClick={() => selectDice(dice.id)}>
                <div className="dice__spot" style={{background: dice.colors[1],}} />
                <div className="dice__spot" style={{background: dice.colors[1],}} />
                <div className="dice__spot" style={{background: dice.colors[1],}} />
                <div className="dice__spot" style={{background: dice.colors[1],}} />
                <div className="dice__spot" style={{background: dice.colors[1],}} />
                <div className="dice__spot" style={{background: dice.colors[1],}} />
              </div>
            ))}

          </div>
        </div>
      </div>
    </header>
  }
}