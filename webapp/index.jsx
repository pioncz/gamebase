import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import './styles.sass'
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import Pages from 'pages'
import Header from 'components/header/index.jsx'

ReactDOM.render(
  <div>
    <Router>
      <div>
        <Header/>
        <div className="main">
          <Route exact path="/" component={Pages.Home}/>
          <Route path="/ludo" component={Pages.Ludo}/>
        </div>
      </div>
    </Router>

  </div>,
  document.getElementById('webapp')
);
