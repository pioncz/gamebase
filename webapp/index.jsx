import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import './styles.sass'
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import Pages from 'pages'
import Home from './pages/home/home.jsx';

ReactDOM.render(
  <div>
    <Router>
      <div>
        <div>
          <Link to='/'>Home</Link>
          <Link to='/ludo'>Ludo</Link>
        </div>
        <Route exact path="/" component={Home}/>
        <Route path="/ludo" component={Pages.Ludo}/>
      </div>
    </Router>

  </div>,
  document.getElementById('webapp')
);
