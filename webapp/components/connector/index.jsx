import React, { Component } from 'react'
import './index.sass'
import ioClient from 'socket.io-client'



export default class Connector extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  
    this.socket = ioClient();
    this.socket.emit('console', 'hi');
  }
  render() {
    return (<div className={"console"}></div>);
  }
}