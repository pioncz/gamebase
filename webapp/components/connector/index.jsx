import React, { Component } from 'react'
import './index.sass'
import ioClient from 'socket.io-client'

export default class Connector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      consoleVisible: false,
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
      // console.error(e);
      this.addMessage("connection error");
    });
  }
  leaveGame() {
    this.socket.emit('leaveGame');
  }
  joinQueue({game}) {
    this.socket.emit('joinQueue', {game});
  }
  addMessage(msg) {
    this.setState({
      messages: this.state.messages.concat(msg)
    });
  }
  hideConsole() {
    this.setState({
      consoleVisible: false,
    });
  }
  showConsole() {
    this.setState({
      consoleVisible: true,
    });
  }
  render() {
    if (!this.state.consoleVisible) {
      return <div></div>;
    }
    
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