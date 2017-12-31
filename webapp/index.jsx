import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import './styles/styles.sass'
import { Provider } from 'react-redux';
import initStore from './store';
import Main from './Main.jsx'

ReactDOM.render(
  <Provider store={initStore()}>
    <Main />
  </Provider>,
  document.getElementById('webapp')
);
