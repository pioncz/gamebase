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
    let { user }  = this.props;
    
    return <header>
      <div className="left-pane">
        <Link to='/'>Home</Link>
        <Link to='/ludo'>Ludo</Link>
        <Link to='/engine'>Engine</Link>
      </div>
      <div className="right-pane">
        <Profile user={user}></Profile>
      </div>
    </header>
  }
}