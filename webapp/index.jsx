import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import './styles/styles.sass'
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import Pages from 'pages'
import Header from 'components/header/index.jsx'
import { Provider } from 'react-redux';
import initStore from './store';
import Connector from 'components/connector/index.jsx'

ReactDOM.render(
  <Provider store={initStore()}>
    <Router>
      <div>
        <Header/>
        <div className="main">
          <Route exact path="/" component={Pages.Ludo}/>
          <Route path="/ludo" component={Pages.Ludo}/>
        </div>
        <Connector />
      </div>
    </Router>
  </Provider>,
  document.getElementById('webapp')
);
