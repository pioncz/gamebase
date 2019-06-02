import React, { Component, } from 'react'
import './index.sass'
import ioClient from 'socket.io-client'
import Config from 'config';

export default class Connector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      consoleVisible: false,
      connected: true,
    };

    this.addMessage = this.addMessage.bind(this);

    this.socket = ioClient(Config.ws.host);

    this.socket.on('console', this.addMessage);
    this.socket.on('connect', () => {
      this.setState({
        connected: true,
      });
      // this.addMessage("connected to socket server");
    });
    this.socket.on('foundGame', () => {
      this.addMessage("found game");
    });
    this.socket.on('connect_error', (e) => {
      this.setState({
        connected: false,
      });
      this.addMessage("connection error");
    });
    this.socket.on('disconnect', () => {
      this.setState({
        connected: false,
      });
    });
    this.socket.on('socketError', (e) => {
      console.error('socketError', e);
    });
  }
  leaveGame() {
    this.socket.emit('leaveGame');
  }
  joinQueue({game,}) {
    this.socket.emit('joinQueue', {game,});
  }
  addMessage(msg) {
    this.setState({
      messages: this.state.messages.concat(msg),
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
    const {consoleVisible, connected,} = this.state;

    let messages = this.state.messages.map((message, i) => {
      return <div key={i}>{message}</div>;
    });

    return (<div className={"connector"}>
      {consoleVisible && <div className={"console"}>
        <div className="console-title">Console</div>
        <div className="console-wrapper">
          <div className="console-messages">
            {messages}
          </div>
        </div>
      </div>}
      {!connected && <div className={"offline"}>OFFLINE</div>}
    </div>);
  }
}