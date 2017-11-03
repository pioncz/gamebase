import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Game from './components/game/index.jsx'
import './styles.sass'

ReactDOM.render(
  <div>
    Hello react
    <Game></Game>
  </div>,
  document.getElementById('webapp')
);
