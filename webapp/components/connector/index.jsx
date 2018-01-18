import React, { Component } from 'react'
import './index.sass'
import ioClient from 'socket.io-client'

export default class Connector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: []
    };
    
    this.addMessage = this.addMessage.bind(this);
  
    this.socket = ioClient();
    
    this.socket.on('console', this.addMessage);
    this.socket.on('connect', () => {
      // this.addMessage("connected to socket server");
    });
    this.socket.on('foundGame', () => {
      this.addMessage("found game");
    });
    this.socket.on('connect_error', (e) => {
      console.error(e);
      this.addMessage("connection error");
    });
  }
  joinQueue({game}) {
    this.socket.emit('joinQueue', {game});
  }
  addMessage(msg) {
    this.setState({
      messages: this.state.messages.concat(msg)
    });
  }
  render() {
    let messages = this.state.messages.map((message, i) => {
      return <div key={i}>{message}</div>;
    });
    
    return (<div className={"console"}>
      <div className="console-title">Console</div>
      <div className="console-wrapper">
        <div className="console-messages">
          {messages}
        </div>
      </div>
    </div>);
  }
}