import React, { Component } from 'react'
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import './index.sass'

export default class Header extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <header>
      <Link to='/'>Home</Link>
      <Link to='/ludo'>Ludo</Link>
    </header>
  }
}